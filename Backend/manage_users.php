<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

$headers = getallheaders();
$auth    = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$user    = verifyToken($auth);

if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
    exit;
}

// Hanya admin yang boleh akses
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Akses ditolak."]);
    exit;
}

// ── GET: ambil semua user ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = mysqli_query($koneksi, "
        SELECT id_user, Email, role, created_at 
        FROM users 
        ORDER BY created_at DESC
    ");
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}

// ── POST: tambah user baru (karyawan) ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data     = json_decode(file_get_contents("php://input"), true);
    $email    = isset($data['email'])    ? trim($data['email'])    : '';
    $password = isset($data['password']) ? $data['password']       : '';
    $role     = isset($data['role'])     ? trim($data['role'])     : '';

    $allowed = ['karyawan', 'bahan', 'cutting', 'jahit', 'finishing', 'pengiriman'];

    if (empty($email) || empty($password) || empty($role)) {
        echo json_encode(["status" => "error", "message" => "Semua field wajib diisi."]);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Format email tidak valid."]);
        exit;
    }
    if (strlen($password) < 6) {
        echo json_encode(["status" => "error", "message" => "Password minimal 6 karakter."]);
        exit;
    }
    if (!in_array($role, $allowed)) {
        echo json_encode(["status" => "error", "message" => "Role tidak valid."]);
        exit;
    }

    // Cek email duplikat
    $cek = mysqli_prepare($koneksi, "SELECT id_user FROM users WHERE Email = ?");
    mysqli_stmt_bind_param($cek, "s", $email);
    mysqli_stmt_execute($cek);
    mysqli_stmt_store_result($cek);
    if (mysqli_stmt_num_rows($cek) > 0) {
        echo json_encode(["status" => "error", "message" => "Email sudah terdaftar."]);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt   = mysqli_prepare($koneksi, "INSERT INTO users (Email, password, role) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "sss", $email, $hashed, $role);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["status" => "success", "message" => "User berhasil ditambahkan."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menambahkan user."]);
    }
    exit;
}

// ── DELETE: hapus user ──
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data    = json_decode(file_get_contents("php://input"), true);
    $id_user = isset($data['id_user']) ? (int)$data['id_user'] : 0;

    if (!$id_user) {
        echo json_encode(["status" => "error", "message" => "ID user tidak valid."]);
        exit;
    }

    // Cegah hapus diri sendiri
    if ($id_user === (int)$user['id_user']) {
        echo json_encode(["status" => "error", "message" => "Tidak bisa menghapus akun sendiri."]);
        exit;
    }

    $stmt = mysqli_prepare($koneksi, "DELETE FROM users WHERE id_user = ?");
    mysqli_stmt_bind_param($stmt, "i", $id_user);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["status" => "success", "message" => "User berhasil dihapus."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menghapus user."]);
    }
    exit;
}
?>