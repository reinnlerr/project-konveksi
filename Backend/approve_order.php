<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Pastikan yang akses cuma admin
if (!$user || !isset($user['role']) || $user['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized. Hanya Admin yang bisa approve order."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_order = isset($data['id_order']) ? (int)$data['id_order'] : 0;

    if ($id_order <= 0) {
        echo json_encode(["status" => "error", "message" => "ID Order tidak valid."]);
        exit;
    }

    // Mulai transaksi database (kalau ada gagal di tengah jalan, gak akan tersimpan)
    mysqli_begin_transaction($koneksi);

    try {
        // 1. Cek ordernya ada atau tidak, pastikan statusnya masih pending
        $stmt = mysqli_prepare($koneksi, "SELECT * FROM orders WHERE id_order = ? AND status = 'pending'");
        mysqli_stmt_bind_param($stmt, "i", $id_order);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $order = mysqli_fetch_assoc($result);

        if (!$order) {
            throw new Exception("Order tidak ditemukan atau sudah di-approve sebelumnya.");
        }

        $jenis_baju = $order['jenis_baju'];
        $jumlah = $order['jumlah'];
        $id_admin = $user['id_user'];
        $tanggal_sekarang = date('Y-m-d');
        
        // 2. Bikin batch baru
        $nama_batch = "Order #" . $id_order . " - " . $jenis_baju;
        $stmt_batch = mysqli_prepare($koneksi, "INSERT INTO batch (nama_batch, tanggal_mulai, status, created_by) VALUES (?, ?, 'proses', ?)");
        mysqli_stmt_bind_param($stmt_batch, "ssi", $nama_batch, $tanggal_sekarang, $id_admin);
        mysqli_stmt_execute($stmt_batch);
        
        // Ambil id_batch yang baru dibuat otomatis
        $id_batch = mysqli_insert_id($koneksi);

        // 3. Masukkan ke tabel bahan_masuk secara otomatis
        $nama_bahan = "Bahan " . $jenis_baju;
        $stmt_bahan = mysqli_prepare($koneksi, "INSERT INTO bahan_masuk (id_batch, nama_bahan, jumlah, tanggal) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt_bahan, "isis", $id_batch, $nama_bahan, $jumlah, $tanggal_sekarang);
        mysqli_stmt_execute($stmt_bahan);

        // 4. Update status di tabel orders menjadi 'bahan' dan hubungkan id_batch-nya
        $stmt_update = mysqli_prepare($koneksi, "UPDATE orders SET status = 'bahan', id_batch = ? WHERE id_order = ?");
        mysqli_stmt_bind_param($stmt_update, "ii", $id_batch, $id_order);
        mysqli_stmt_execute($stmt_update);

        // Kalau semua langkah sukses, permanenkan di database
        mysqli_commit($koneksi);
        
        echo json_encode(["status" => "success", "message" => "Order berhasil di-approve! Masuk ke proses bahan."]);

    } catch (Exception $e) {
        // Kalau ada yang gagal, batalkan (rollback) semua perubahan sebelumnya
        mysqli_rollback($koneksi);
        echo json_encode(["status" => "error", "message" => "Gagal approve order: " . $e->getMessage()]);
    }
    exit;
}
?>