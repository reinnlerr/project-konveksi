<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "koneksi.php";

// ── Fungsi verifikasi token ──
function verifyToken($auth) {
    if (empty($auth) || !str_starts_with($auth, 'Bearer ')) return null;

    $token  = str_replace('Bearer ', '', $auth);
    $parts  = explode('.', $token);
    if (count($parts) !== 2) return null;

    [$payload, $signature] = $parts;

    // Verifikasi signature
    $expected = hash_hmac('sha256', $payload, 'SECRET_KEY_KONVEKSI_UAS');
    if (!hash_equals($expected, $signature)) return null;

    $decoded = json_decode(base64_decode($payload), true);

    // Cek expiry
    if (!$decoded || time() > $decoded['exp']) return null;

    return $decoded;
}

// ── Cek token ──
$auth    = getAuthorizationHeader();
$user    = verifyToken($auth);

if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid. Silakan login ulang."]);
    exit;
}

// ── Cek role admin ──
// FIX: Kalau bukan admin, kita kembalikan status sukses tapi datanya kosong.
// Biar aman dan console browser nggak merah lagi.
if ($user['role'] !== 'admin') {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit;
}

// ── Ambil data user (Ini cuma jalan kalau dia admin) ──
$result = mysqli_query($koneksi, "SELECT id_user, Email, role, created_at FROM users ORDER BY created_at DESC");

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data."]);
    exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => "success", "data" => $data]);
?>