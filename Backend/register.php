<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include "koneksi.php";

// Ambil data dari React (dikirim dalam format JSON)
$data = json_decode(file_get_contents("php://input"), true);

$full_name        = isset($data['fullName']) ? trim($data['fullName']) : '';
$email            = isset($data['email']) ? trim($data['email']) : '';
$password         = isset($data['password']) ? $data['password'] : '';
$confirm_password = isset($data['confirmPassword']) ? $data['confirmPassword'] : '';

// Validasi input kosong
if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
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

// Cek apakah email sudah terdaftar
$cek = mysqli_prepare($koneksi, "SELECT id FROM users WHERE email = ?");
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

// Hash password sebelum disimpan
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Simpan ke database
$stmt = mysqli_prepare($koneksi, "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'user')");
mysqli_stmt_bind_param($stmt, "sss", $full_name, $email, $hashed_password);

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