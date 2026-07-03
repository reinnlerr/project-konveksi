<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$id_order = isset($_GET['id_order']) ? (int)$_GET['id_order'] : 0;
if (!$id_order) { echo json_encode(["status"=>"error","message"=>"ID order tidak valid."]); exit; }

// Customer hanya boleh lihat nota miliknya
if ($user['role'] === 'customer') {
    $cek = mysqli_prepare($koneksi, "SELECT id_order FROM orders WHERE id_order=? AND id_user=?");
    mysqli_stmt_bind_param($cek, "ii", $id_order, $user['id_user']);
    mysqli_stmt_execute($cek);
    mysqli_stmt_store_result($cek);
    if (mysqli_stmt_num_rows($cek) === 0) {
        echo json_encode(["status"=>"error","message"=>"Nota tidak ditemukan."]); exit;
    }
}

$stmt = mysqli_prepare($koneksi, "
    SELECT
        o.id_order, o.jenis_baju, o.jumlah, o.catatan, o.created_at as tanggal_order,
        u.Email as email_customer, u.nama as nama_customer, u.no_hp, u.alamat,
        p.id_pembayaran, p.harga_satuan, p.total_harga, p.status as status_bayar,
        b.nama_batch
    FROM orders o
    LEFT JOIN users u  ON o.id_user   = u.id_user
    LEFT JOIN pembayaran p ON o.id_order = p.id_order
    LEFT JOIN batch b  ON o.id_batch  = b.id_batch
    WHERE o.id_order = ?
");
mysqli_stmt_bind_param($stmt, "i", $id_order);
mysqli_stmt_execute($stmt);
$data = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

echo json_encode($data
    ? ["status"=>"success","data"=>$data]
    : ["status"=>"error","message"=>"Nota tidak ditemukan."]);
?>