<?php
// Pengaturan Database
$host = "localhost";
$user = "root";      // Username bawaan XAMPP
$pass = "";          // Password bawaan XAMPP biasanya kosong
$db   = "db_konveksi"; // Pastikan ini sama dengan nama database kamu

// Membuat Koneksi
$koneksi = mysqli_connect($host, $user, $pass, $db);

// Cek Koneksi
if (!$koneksi) {
    die("Koneksi gagal: " . mysqli_connect_error());
}

/**
 * Membaca Authorization header secara robust di semua konfigurasi XAMPP.
 * Mengatasi masalah getallheaders() yang tidak berfungsi di PHP-CGI/FastCGI.
 */
function getAuthorizationHeader() {
    // 1. Cara standar (Apache mod_php)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (!empty($headers['Authorization'])) return $headers['Authorization'];
        // Case-insensitive fallback
        foreach ($headers as $key => $val) {
            if (strtolower($key) === 'authorization') return $val;
        }
    }
    // 2. Fallback via $_SERVER (Apache + .htaccess RewriteRule atau Nginx)
    if (!empty($_SERVER['HTTP_AUTHORIZATION']))  return $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    // 3. Fallback via apache_request_headers() (beberapa konfigurasi Apache)
    if (function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        if (!empty($apacheHeaders['Authorization'])) return $apacheHeaders['Authorization'];
    }
    return '';
}
?>