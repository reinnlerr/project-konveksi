<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$email            = isset($data['email']) ? trim($data['email']) : '';
$password         = isset($data['password']) ? $data['password'] : '';
$confirm_password = isset($data['confirmPassword']) ? $data['confirmPassword'] : '';
$role             = isset($data['role']) ? trim($data['role']) : 'pegawai';

// Validasi input kosong
if (empty($email) || empty($password) || empty($confirm_password)) {
    echo json_encode([
        "status"  => "error",
        "message" => "Semua field wajib diisi."
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

// Validasi password cocok
if ($password !== $confirm_password) {
    echo json_encode([
        "status"  => "error",
        "message" => "Password dan konfirmasi password tidak cocok."
    ]);
    exit;
}

// Validasi panjang password
if (strlen($password) < 6) {
    echo json_encode([
        "status"  => "error",
        "message" => "Password minimal 6 karakter."
    ]);
    exit;
}

// Validasi role
$allowed_role = ['admin', 'pegawai', 'owner'];
if (!in_array($role, $allowed_role)) {
    echo json_encode([
        "status"  => "error",
        "message" => "Role tidak valid."
    ]);
    exit;
}

// Cek apakah email sudah terdaftar
$cek = mysqli_prepare($koneksi, "SELECT id_user FROM users WHERE Email = ?");
mysqli_stmt_bind_param($cek, "s", $email);
mysqli_stmt_execute($cek);
mysqli_stmt_store_result($cek);

if (mysqli_stmt_num_rows($cek) > 0) {
    echo json_encode([
        "status"  => "error",
        "message" => "Email sudah terdaftar, gunakan email lain."
    ]);
    exit;
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Simpan ke database
$stmt = mysqli_prepare($koneksi, "INSERT INTO users (Email, password, role) VALUES (?, ?, ?)");
mysqli_stmt_bind_param($stmt, "sss", $email, $hashed_password, $role);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "status"  => "success",
        "message" => "Registrasi berhasil! Silakan login."
    ]);
} else {
    echo json_encode([
        "status"  => "error",
        "message" => "Registrasi gagal, coba lagi."
    ]);
}
?>