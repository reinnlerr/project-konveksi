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

// ── GET: ambil semua revisi (untuk admin) ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = mysqli_query($koneksi, "
        SELECT r.id_revisi, r.id_order, r.alasan, r.created_at,
               o.jenis_baju, o.jumlah, o.status,
               b.nama_batch,
               u.Email AS email_customer
        FROM revisi_log r
        INNER JOIN orders o ON r.id_order = o.id_order
        INNER JOIN batch b ON o.id_batch = b.id_batch
        INNER JOIN users u ON o.id_user = u.id_user
        ORDER BY r.created_at DESC
    ");

    if (!$result) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Query gagal."]);
        exit;
    }

    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}

// ── POST: customer submit alasan revisi ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Hanya customer yang boleh submit
    if ($user['role'] !== 'customer') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Akses ditolak."]);
        exit;
    }

    $data     = json_decode(file_get_contents("php://input"), true);
    $id_order = isset($data['id_order']) ? (int)$data['id_order'] : 0;
    $alasan   = isset($data['alasan'])   ? trim($data['alasan'])   : '';

    if (!$id_order || empty($alasan)) {
        echo json_encode(["status" => "error", "message" => "ID order dan alasan wajib diisi."]);
        exit;
    }

    // Pastikan order ini milik customer yang login & statusnya menunggu_revisi
    $cek = mysqli_prepare($koneksi, "
        SELECT id_order FROM orders
        WHERE id_order = ? AND id_user = ? AND status = 'menunggu_revisi'
    ");
    mysqli_stmt_bind_param($cek, "ii", $id_order, $user['id_user']);
    mysqli_stmt_execute($cek);
    mysqli_stmt_store_result($cek);

    if (mysqli_stmt_num_rows($cek) === 0) {
        echo json_encode(["status" => "error", "message" => "Order tidak ditemukan atau tidak perlu revisi."]);
        exit;
    }

    // Simpan alasan ke revisi_log
    $insert = mysqli_prepare($koneksi, "INSERT INTO revisi_log (id_order, alasan) VALUES (?, ?)");
    mysqli_stmt_bind_param($insert, "is", $id_order, $alasan);

    if (!mysqli_stmt_execute($insert)) {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan alasan revisi."]);
        exit;
    }

    // Update status order balik ke 'jahit'
    $update = mysqli_prepare($koneksi, "UPDATE orders SET status = 'jahit' WHERE id_order = ?");
    mysqli_stmt_bind_param($update, "i", $id_order);
    mysqli_stmt_execute($update);

    echo json_encode(["status" => "success", "message" => "Alasan revisi berhasil dikirim. Pesanan kembali ke proses jahit."]);
    exit;
}
?>