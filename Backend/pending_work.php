<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$auth    = getAuthorizationHeader();
$user = verifyToken($auth);

if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
    exit;
}

$role = isset($_GET['role']) ? trim($_GET['role']) : '';

switch ($role) {
    case 'bahan':
        $result = mysqli_query($koneksi, "
            SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan,
                   b.id_batch, b.nama_batch
            FROM orders o
            INNER JOIN batch b ON o.id_batch = b.id_batch
            WHERE o.status = 'bahan'
            ORDER BY o.deadline ASC
        ");
        break;

    case 'cutting':
        $result = mysqli_query($koneksi, "
            SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan,
                   b.id_batch, b.nama_batch
            FROM orders o
            INNER JOIN batch b ON o.id_batch = b.id_batch
            WHERE o.status = 'cutting'
            ORDER BY o.deadline ASC
        ");
        break;

    case 'jahit':
    $result = mysqli_query($koneksi, "
        SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan,
               b.id_batch, b.nama_batch,
               (SELECT r.alasan FROM revisi_log r
                WHERE r.id_order = o.id_order
                ORDER BY r.created_at DESC LIMIT 1) as alasan_revisi,
               (SELECT r.foto FROM revisi_log r
                WHERE r.id_order = o.id_order
                ORDER BY r.created_at DESC LIMIT 1) as foto_revisi,
               (SELECT COUNT(*) FROM revisi_log r
                WHERE r.id_order = o.id_order) as jumlah_revisi
        FROM orders o
        INNER JOIN batch b ON o.id_batch = b.id_batch
        WHERE o.status = 'jahit'
        ORDER BY o.deadline ASC
    ");
    break;

   case 'finishing':
    $result = mysqli_query($koneksi, "
        SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan,
               b.id_batch, b.nama_batch
        FROM orders o
        INNER JOIN batch b ON o.id_batch = b.id_batch
        WHERE o.status = 'finishing'
          AND NOT EXISTS (
              SELECT 1 FROM finishing f WHERE f.id_batch = b.id_batch
          )
        ORDER BY o.deadline ASC
    ");
    break;

    case 'pengiriman':
        $result = mysqli_query($koneksi, "
            SELECT o.id_order, o.jenis_baju, o.jumlah, o.deadline, o.catatan,
                   b.id_batch, b.nama_batch
            FROM orders o
            INNER JOIN batch b ON o.id_batch = b.id_batch
            WHERE o.status = 'pengiriman'
            ORDER BY o.deadline ASC
        ");
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Role tidak valid."]);
        exit;
}

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Query gagal."]);
    exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => "success", "data" => $data]);
?>