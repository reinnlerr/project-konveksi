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

$headers  = getallheaders();
$auth     = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$authUser = verifyToken($auth);

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $id_batch_filter = isset($_GET['id_batch']) ? (int)$_GET['id_batch'] : 0;

        if ($id_batch_filter) {
            $result = mysqli_query($koneksi, "
                SELECT f.id_finishing, f.id_batch, ba.nama_batch,
                       f.jumlah_hasil, f.status, f.tanggal, f.id_user, f.foto,
                       u.Email as nama_user
                FROM finishing f
                LEFT JOIN batch ba ON f.id_batch = ba.id_batch
                LEFT JOIN users u ON f.id_user = u.id_user
                WHERE f.id_batch = $id_batch_filter
                ORDER BY f.id_finishing DESC
                LIMIT 1
            ");
        } else {
            $result = mysqli_query($koneksi, "
                SELECT f.id_finishing, f.id_batch, ba.nama_batch,
                       f.jumlah_hasil, f.status, f.tanggal, f.id_user, f.foto,
                       u.Email as nama_user
                FROM finishing f
                LEFT JOIN batch ba ON f.id_batch = ba.id_batch
                LEFT JOIN users u ON f.id_user = u.id_user
                ORDER BY f.tanggal DESC
            ");
        }

        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break;

    case 'POST':
        // Multipart/form-data karena ada file upload
        $id_batch     = isset($_POST['id_batch'])     ? (int)$_POST['id_batch']     : 0;
        $jumlah_hasil = isset($_POST['jumlah_hasil']) ? (int)$_POST['jumlah_hasil'] : 0;
        $id_user      = isset($_POST['id_user'])      ? (int)$_POST['id_user']      : 0;
        $tanggal      = isset($_POST['tanggal'])      ? $_POST['tanggal']            : date('Y-m-d');
        $status       = 'Selesai';

        if (!$id_batch || !$jumlah_hasil || !$id_user) {
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
            exit;
        }

        // Foto WAJIB
        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status" => "error", "message" => "Foto hasil finishing wajib diupload."]);
            exit;
        }

        $upload_dir = __DIR__ . '/uploads/finishing/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

        $ext     = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(["status" => "error", "message" => "Format foto tidak valid. Gunakan JPG/PNG."]);
            exit;
        }

        $filename = 'finishing_' . time() . '_' . uniqid() . '.' . $ext;
        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $upload_dir . $filename)) {
            echo json_encode(["status" => "error", "message" => "Gagal upload foto."]);
            exit;
        }

        $foto = 'uploads/finishing/' . $filename;

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO finishing (id_batch, jumlah_hasil, status, tanggal, id_user, foto)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        mysqli_stmt_bind_param($stmt, "iissis", $id_batch, $jumlah_hasil, $status, $tanggal, $id_user, $foto);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(["status" => "success", "message" => "Data finishing berhasil disimpan."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan data finishing."]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Method tidak diizinkan."]);
        break;
}
?>