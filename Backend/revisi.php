<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "koneksi.php";

function verifyToken($auth) {
    if (empty($auth) || !str_starts_with($auth, 'Bearer ')) return null;
    $token = str_replace('Bearer ', '', $auth);
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    [$payload, $signature] = $parts;
    $expected = hash_hmac('sha256', $payload, 'SECRET_KEY_KONVEKSI_UAS');
    if (!hash_equals($expected, $signature)) return null;
    $decoded = json_decode(base64_decode($payload), true);
    if (!$decoded || time() > $decoded['exp']) return null;
    return $decoded;
}

$headers = getallheaders();
$auth    = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$user    = verifyToken($auth);

if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
    exit;
}

// ── GET: riwayat revisi untuk admin ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = mysqli_query($koneksi, "
        SELECT r.id_revisi, r.id_order, r.alasan, r.foto, r.created_at,
               o.jenis_baju, o.jumlah, o.status,
               b.nama_batch,
               u.Email AS email_customer
        FROM revisi_log r
        INNER JOIN orders o ON r.id_order = o.id_order
        INNER JOIN batch b ON o.id_batch = b.id_batch
        INNER JOIN users u ON o.id_user = u.id_user
        ORDER BY r.created_at DESC
    ");

    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}

// ── POST: customer submit revisi + foto ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($user['role'] !== 'customer') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Akses ditolak."]);
        exit;
    }

    // Multipart/form-data
    $id_order = isset($_POST['id_order']) ? (int)$_POST['id_order'] : 0;
    $alasan   = isset($_POST['alasan'])   ? trim($_POST['alasan'])   : '';

    if (!$id_order || empty($alasan)) {
        echo json_encode(["status" => "error", "message" => "ID order dan alasan wajib diisi."]);
        exit;
    }

    // Pastikan order milik customer & statusnya finishing
    $cek = mysqli_prepare($koneksi, "
        SELECT id_order FROM orders
        WHERE id_order = ? AND id_user = ? AND status = 'finishing'
    ");
    mysqli_stmt_bind_param($cek, "ii", $id_order, $user['id_user']);
    mysqli_stmt_execute($cek);
    mysqli_stmt_store_result($cek);

    if (mysqli_stmt_num_rows($cek) === 0) {
        echo json_encode(["status" => "error", "message" => "Order tidak ditemukan atau tidak dalam status finishing."]);
        exit;
    }

    // Foto WAJIB untuk revisi
    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["status" => "error", "message" => "Foto referensi wajib diupload untuk revisi."]);
        exit;
    }

    $upload_dir = __DIR__ . '/uploads/revisi/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $ext     = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowed)) {
        echo json_encode(["status" => "error", "message" => "Format foto tidak valid. Gunakan JPG/PNG."]);
        exit;
    }

    $filename = 'revisi_' . time() . '_' . uniqid() . '.' . $ext;
    if (!move_uploaded_file($_FILES['foto']['tmp_name'], $upload_dir . $filename)) {
        echo json_encode(["status" => "error", "message" => "Gagal upload foto."]);
        exit;
    }

    $foto = 'uploads/revisi/' . $filename;

    // Simpan ke revisi_log
    $insert = mysqli_prepare($koneksi, "INSERT INTO revisi_log (id_order, alasan, foto) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($insert, "iss", $id_order, $alasan, $foto);

    if (!mysqli_stmt_execute($insert)) {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan revisi."]);
        exit;
    }

    // Update status order ke jahit
    $update = mysqli_prepare($koneksi, "UPDATE orders SET status = 'jahit' WHERE id_order = ?");
    mysqli_stmt_bind_param($update, "i", $id_order);
    mysqli_stmt_execute($update);

    echo json_encode(["status" => "success", "message" => "Revisi berhasil dikirim. Pesanan kembali ke proses jahit."]);
    exit;
}
?>