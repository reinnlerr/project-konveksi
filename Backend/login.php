<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include "koneksi.php";

// Ambil data dari React (dikirim dalam format JSON)
$data = json_decode(file_get_contents("php://input"), true);

$email    = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validasi input kosong
if (empty($email) || empty($password)) {
    echo json_encode([
        "status"  => "error",
        "message" => "Email dan password wajib diisi."
    ]);
    exit;
}

// Validasi format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status"  => "error",
        "message" => "Format email tidak valid."
    ]);
    exit;
}

// Cari user berdasarkan email
$stmt = mysqli_prepare($koneksi, "SELECT id, full_name, email, password, role FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user   = mysqli_fetch_assoc($result);

// Cek user & verifikasi password
if ($user && password_verify($password, $user['password'])) {
    echo json_encode([
        "status"  => "success",
        "message" => "Login berhasil!",
        "data"    => [
            "id"        => $user['id'],
            "full_name" => $user['full_name'],
            "email"     => $user['email'],
            "role"      => $user['role']
        ]
    ]);
} else {
    echo json_encode([
        "status"  => "error",
        "message" => "Email atau password salah."
    ]);
}
?>