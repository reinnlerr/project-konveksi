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

$data = json_decode(file_get_contents("php://input"), true);

$email    = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Format email tidak valid."]);
    exit;
}

$stmt = mysqli_prepare($koneksi, "SELECT id_user, Email, password, role FROM users WHERE Email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user   = mysqli_fetch_assoc($result);

if ($user && password_verify($password, $user['password'])) {

    // ── Generate simple token ──
    $payload = base64_encode(json_encode([
        "id_user" => $user['id_user'],
        "email"   => $user['Email'],
        "role"    => $user['role'],
        "exp"     => time() + (60 * 60 * 8) // expired 8 jam
    ]));
    $signature = hash_hmac('sha256', $payload, 'SECRET_KEY_KONVEKSI_UAS');
    $token = $payload . '.' . $signature;

    echo json_encode([
        "status"  => "success",
        "message" => "Login berhasil!",
        "token"   => $token,
        "data"    => [
            "id_user" => $user['id_user'],
            "email"   => $user['Email'],
            "role"    => $user['role']
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Email atau password salah."]);
}
?>