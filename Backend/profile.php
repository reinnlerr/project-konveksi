<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
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

$user    = verifyToken(getAuthorizationHeader());

if (!$user) { http_response_code(401); echo json_encode(["status"=>"error","message"=>"Token tidak valid."]); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = mysqli_prepare($koneksi, "SELECT id_user, Email, nama, no_hp, alamat FROM users WHERE id_user = ?");
    mysqli_stmt_bind_param($stmt, "i", $user['id_user']);
    mysqli_stmt_execute($stmt);
    $data = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data   = json_decode(file_get_contents("php://input"), true);
    $nama   = isset($data['nama'])   ? trim($data['nama'])   : '';
    $no_hp  = isset($data['no_hp'])  ? trim($data['no_hp'])  : '';
    $alamat = isset($data['alamat']) ? trim($data['alamat']) : '';

    if (empty($nama) || empty($no_hp) || empty($alamat)) {
        echo json_encode(["status"=>"error","message"=>"Semua field wajib diisi."]); exit;
    }

    $stmt = mysqli_prepare($koneksi, "UPDATE users SET nama=?, no_hp=?, alamat=? WHERE id_user=?");
    mysqli_stmt_bind_param($stmt, "sssi", $nama, $no_hp, $alamat, $user['id_user']);
    echo json_encode(mysqli_stmt_execute($stmt)
        ? ["status"=>"success","message"=>"Profil berhasil disimpan."]
        : ["status"=>"error","message"=>"Gagal menyimpan profil."]);
    exit;
}
?>