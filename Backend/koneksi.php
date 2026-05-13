<?php
// Pengaturan Database
$host = "localhost";
$user = "root";      // Username bawaan XAMPP
$pass = "";          // Password bawaan XAMPP biasanya kosong
$db   = "db_konveksi"; // Pastikan ini sama dengan nama database kamu

// Membuat Koneksi
$koneksi = mysqli_connect($host, $user, $pass, $db);

// Cek Koneksi (Untuk bukti laporan)
if (!$koneksi) {
    die("Koneksi gagal: " . mysqli_connect_error());
} else {
    echo "Koneksi ke Database " . $db . " Berhasil!";
}
?>