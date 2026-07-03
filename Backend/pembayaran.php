<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

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
$user    = verifyToken(isset($headers['Authorization']) ? $headers['Authorization'] : '');
if (!$user) { http_response_code(401); echo json_encode(["status"=>"error","message"=>"Token tidak valid."]); exit; }

$action = isset($_GET['action']) ? $_GET['action'] : '';

// ── GET ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Admin: orders yang perlu penetapan harga
    if ($action === 'need_pricing') {
        $result = mysqli_query($koneksi, "
            SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan, o.created_at,
                   u.Email as email_customer, u.nama as nama_customer
            FROM orders o
            LEFT JOIN users u ON o.id_user = u.id_user
            WHERE o.status = 'menunggu_pembayaran'
              AND NOT EXISTS (SELECT 1 FROM pembayaran p WHERE p.id_order = o.id_order)
            ORDER BY o.created_at ASC
        ");
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) $data[] = $row;
        echo json_encode(["status"=>"success","data"=>$data]);
        exit;
    }

    // Semua pembayaran (admin) atau milik customer
    if ($user['role'] === 'admin') {
        $result = mysqli_query($koneksi, "
            SELECT p.*, o.jenis_baju, o.jumlah, o.status as status_order, o.catatan,
                   o.created_at as tanggal_order, b.nama_batch,
                   u.Email as email_customer, u.nama as nama_customer, u.no_hp, u.alamat
            FROM pembayaran p
            INNER JOIN orders o ON p.id_order = o.id_order
            LEFT JOIN batch b ON o.id_batch = b.id_batch
            LEFT JOIN users u ON o.id_user = u.id_user
            ORDER BY p.created_at DESC
        ");
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) $data[] = $row;
        echo json_encode(["status"=>"success","data"=>$data]);
    } else {
        $stmt = mysqli_prepare($koneksi, "
            SELECT p.*, o.jenis_baju, o.jumlah, o.status as status_order
            FROM pembayaran p
            INNER JOIN orders o ON p.id_order = o.id_order
            WHERE o.id_user = ?
            ORDER BY p.created_at DESC
        ");
        mysqli_stmt_bind_param($stmt, "i", $user['id_user']);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $data = [];
        while ($row = mysqli_fetch_assoc($result)) $data[] = $row;
        echo json_encode(["status"=>"success","data"=>$data]);
    }
    exit;
}

// ── POST ─────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Customer upload bukti transfer
    if ($action === 'upload_bukti') {
        if ($user['role'] !== 'customer') { http_response_code(403); echo json_encode(["status"=>"error","message"=>"Akses ditolak."]); exit; }

        $id_pembayaran = isset($_POST['id_pembayaran']) ? (int)$_POST['id_pembayaran'] : 0;
        if (!$id_pembayaran || !isset($_FILES['bukti']) || $_FILES['bukti']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status"=>"error","message"=>"Data tidak lengkap atau file tidak valid."]); exit;
        }

        $upload_dir = __DIR__ . '/uploads/bukti/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

        $ext = strtolower(pathinfo($_FILES['bukti']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg','jpeg','png','webp'])) {
            echo json_encode(["status"=>"error","message"=>"Format tidak valid. Gunakan JPG/PNG."]); exit;
        }

        $filename = 'bukti_' . time() . '_' . uniqid() . '.' . $ext;
        if (!move_uploaded_file($_FILES['bukti']['tmp_name'], $upload_dir . $filename)) {
            echo json_encode(["status"=>"error","message"=>"Gagal upload bukti."]); exit;
        }

        $bukti = 'uploads/bukti/' . $filename;
        $stmt  = mysqli_prepare($koneksi, "UPDATE pembayaran SET bukti_transfer=?, status='menunggu_konfirmasi' WHERE id_pembayaran=?");
        mysqli_stmt_bind_param($stmt, "si", $bukti, $id_pembayaran);
        mysqli_stmt_execute($stmt);

        // Update status order
        $upd = mysqli_prepare($koneksi, "UPDATE orders SET status='menunggu_konfirmasi' WHERE id_order=(SELECT id_order FROM pembayaran WHERE id_pembayaran=?)");
        mysqli_stmt_bind_param($upd, "i", $id_pembayaran);
        mysqli_stmt_execute($upd);

        echo json_encode(["status"=>"success","message"=>"Bukti transfer dikirim. Menunggu konfirmasi admin."]);
        exit;
    }

    // Admin input harga satuan
    if ($user['role'] !== 'admin') { http_response_code(403); echo json_encode(["status"=>"error","message"=>"Akses ditolak."]); exit; }

    $data         = json_decode(file_get_contents("php://input"), true);
    $id_order     = isset($data['id_order'])     ? (int)$data['id_order']     : 0;
    $harga_satuan = isset($data['harga_satuan']) ? (int)$data['harga_satuan'] : 0;

    if (!$id_order || $harga_satuan <= 0) {
        echo json_encode(["status"=>"error","message"=>"ID order dan harga wajib diisi."]); exit;
    }

    $cek = mysqli_prepare($koneksi, "SELECT jumlah FROM orders WHERE id_order=? AND status='menunggu_pembayaran'");
    mysqli_stmt_bind_param($cek, "i", $id_order);
    mysqli_stmt_execute($cek);
    $order = mysqli_fetch_assoc(mysqli_stmt_get_result($cek));
    if (!$order) { echo json_encode(["status"=>"error","message"=>"Order tidak ditemukan."]); exit; }

    $total_harga = $harga_satuan * $order['jumlah'];
    $stmt = mysqli_prepare($koneksi, "INSERT INTO pembayaran (id_order, harga_satuan, total_harga) VALUES (?,?,?)");
    mysqli_stmt_bind_param($stmt, "iii", $id_order, $harga_satuan, $total_harga);
    echo json_encode(mysqli_stmt_execute($stmt)
        ? ["status"=>"success","message"=>"Tagihan berhasil dibuat."]
        : ["status"=>"error","message"=>"Gagal membuat tagihan."]);
    exit;
}

// ── PUT: admin konfirmasi lunas ──────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($user['role'] !== 'admin') { http_response_code(403); echo json_encode(["status"=>"error","message"=>"Akses ditolak."]); exit; }

    $data          = json_decode(file_get_contents("php://input"), true);
    $id_pembayaran = isset($data['id_pembayaran']) ? (int)$data['id_pembayaran'] : 0;
    $id_order      = isset($data['id_order'])      ? (int)$data['id_order']      : 0;

    if (!$id_pembayaran || !$id_order) { echo json_encode(["status"=>"error","message"=>"Data tidak valid."]); exit; }

    $stmt = mysqli_prepare($koneksi, "UPDATE pembayaran SET status='lunas' WHERE id_pembayaran=?");
    mysqli_stmt_bind_param($stmt, "i", $id_pembayaran);
    mysqli_stmt_execute($stmt);

    $upd = mysqli_prepare($koneksi, "UPDATE orders SET status='pengiriman' WHERE id_order=?");
    mysqli_stmt_bind_param($upd, "i", $id_order);
    echo json_encode(mysqli_stmt_execute($upd)
        ? ["status"=>"success","message"=>"Pembayaran dikonfirmasi lunas. Pesanan siap dikirim!"]
        : ["status"=>"error","message"=>"Gagal konfirmasi."]);
    exit;
}
?>