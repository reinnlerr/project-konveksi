<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

if (!$user || $user['role'] !== 'customer') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Akses ditolak."]);
    exit;
}

$data     = json_decode(file_get_contents("php://input"), true);
$id_order = isset($data['id_order']) ? (int)$data['id_order'] : 0;

if (!$id_order) {
    echo json_encode(["status" => "error", "message" => "ID order tidak valid."]);
    exit;
}

// Pastikan order milik customer & statusnya finishing
$cek = mysqli_prepare($koneksi, "
    SELECT id_order, id_batch FROM orders 
    WHERE id_order = ? AND id_user = ? AND status = 'finishing'
");
mysqli_stmt_bind_param($cek, "ii", $id_order, $user['id_user']);
mysqli_stmt_execute($cek);
$result = mysqli_stmt_get_result($cek);
$order  = mysqli_fetch_assoc($result);

if (!$order) {
    echo json_encode(["status" => "error", "message" => "Order tidak ditemukan."]);
    exit;
}

$upd = mysqli_prepare($koneksi, "UPDATE orders SET status = 'menunggu_pembayaran' WHERE id_order = ?");
mysqli_stmt_bind_param($upd, "i", $id_order);

if (mysqli_stmt_execute($upd)) {
    echo json_encode(["status" => "success", "message" => "Pesanan disetujui! Sedang dalam proses pengiriman."]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menyetujui pesanan."]);
}
?>