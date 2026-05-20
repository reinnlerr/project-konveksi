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

// ── Verifikasi token ──
function verifyToken($auth) {
    if (empty($auth) || !str_starts_with($auth, 'Bearer ')) return null;
    $token  = str_replace('Bearer ', '', $auth);
    $parts  = explode('.', $token);
    if (count($parts) !== 2) return null;
    [$payload, $signature] = $parts;
    $expected = hash_hmac('sha256', $payload, 'SECRET_KEY_KONVEKSI_UAS');
    if (!hash_equals($expected, $signature)) return null;
    $decoded = json_decode(base64_decode($payload), true);
    if (!$decoded || time() > $decoded['exp']) return null;
    return $decoded;
}

$headers = getallheaders();
$auth    = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$user    = verifyToken($auth);

if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
    exit;
}

// ── POST: buat order baru ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data       = json_decode(file_get_contents("php://input"), true);
    $jenis_baju = isset($data['jenis_baju']) ? trim($data['jenis_baju']) : '';
    $jumlah     = isset($data['jumlah']) ? (int)$data['jumlah'] : 0;
    $deadline   = isset($data['deadline']) ? trim($data['deadline']) : '';
    $catatan    = isset($data['catatan']) ? trim($data['catatan']) : '';
    $id_user    = $user['id_user'];

    if (empty($jenis_baju) || $jumlah <= 0 || empty($deadline)) {
        echo json_encode(["status" => "error", "message" => "Semua field wajib diisi."]);
        exit;
    }

    $stmt = mysqli_prepare($koneksi, "INSERT INTO orders (id_user, jenis_baju, jumlah, deadline, catatan) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "isiss", $id_user, $jenis_baju, $jumlah, $deadline, $catatan);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["status" => "success", "message" => "Order berhasil dibuat!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal membuat order."]);
    }
    exit;
}

// ── GET: ambil order ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Cek apakah yang login adalah admin
    if (isset($user['role']) && $user['role'] === 'admin') {
        // Jika Admin: Ambil SEMUA orderan dari semua customer
        $stmt = mysqli_prepare($koneksi, "SELECT * FROM orders ORDER BY created_at DESC");
        mysqli_stmt_execute($stmt);
    } else {
        // Jika Customer: Cuma ambil orderan miliknya sendiri
        $id_user = $user['id_user'];
        $stmt = mysqli_prepare($koneksi, "SELECT * FROM orders WHERE id_user = ? ORDER BY created_at DESC");
        mysqli_stmt_bind_param($stmt, "i", $id_user);
        mysqli_stmt_execute($stmt);
    }

    $result = mysqli_stmt_get_result($stmt);

    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}
?>