<?php
// Mengizinkan frontend (React) untuk mengakses API ini
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Menyisipkan file koneksi database yang sudah dibuat tadi
include "koneksi.php";

// Menangkap data username dan password yang dikirim oleh pengguna
// (Untuk uji coba cepat di browser, kita pakai metode GET dulu)
$username = isset($_GET['username']) ? $_GET['username'] : '';
$password = isset($_GET['password']) ? $_GET['password'] : '';

// Periksa apakah username dan password cocok dengan data dummy di database
if ($username === 'admin_konveksi' && $password === 'password123') {
    echo json_encode([
        "status" => "success",
        "message" => "Selamat datang! Login berhasil.",
        "data" => [
            "username" => $username,
            "role" => "admin"
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Username atau password salah, silakan coba lagi."
    ]);
}
?>