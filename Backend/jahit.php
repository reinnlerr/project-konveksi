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

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT j.id_jahit, j.id_batch, ba.nama_batch,
                   j.jumlah_hasil, j.status, j.tanggal, j.id_user,
                   u.Email as nama_user
            FROM jahit j
            LEFT JOIN batch ba ON j.id_batch = ba.id_batch
            LEFT JOIN users u ON j.id_user = u.id_user
            ORDER BY j.tanggal DESC
        ");

        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }

        echo json_encode([
            "status" => "success",
            "data"   => $data
        ]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_batch     = isset($input['id_batch']) ? $input['id_batch'] : '';
        $jumlah_hasil = isset($input['jumlah_hasil']) ? $input['jumlah_hasil'] : '';
        $status       = isset($input['status']) ? trim($input['status']) : 'proses';
        $id_user      = isset($input['id_user']) ? $input['id_user'] : '';
        $tanggal      = isset($input['tanggal']) ? $input['tanggal'] : date('Y-m-d');

        if (empty($id_batch) || empty($jumlah_hasil) || empty($id_user)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch, jumlah hasil, dan user wajib diisi."
            ]);
            exit;
        }

        if ($jumlah_hasil <= 0) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah hasil harus lebih dari 0."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO jahit (id_batch, jumlah_hasil, status, tanggal, id_user) 
            VALUES (?, ?, ?, ?, ?)
        ");
        mysqli_stmt_bind_param($stmt, "iissi", $id_batch, $jumlah_hasil, $status, $tanggal, $id_user);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data jahit."
            ]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_jahit     = isset($input['id_jahit']) ? $input['id_jahit'] : '';
        $jumlah_hasil = isset($input['jumlah_hasil']) ? $input['jumlah_hasil'] : '';
        $status       = isset($input['status']) ? trim($input['status']) : '';
        $tanggal      = isset($input['tanggal']) ? $input['tanggal'] : '';
        $id_user      = isset($input['id_user']) ? $input['id_user'] : '';

        if (empty($id_jahit) || empty($jumlah_hasil) || empty($status) || empty($id_user)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE jahit 
            SET jumlah_hasil = ?, status = ?, tanggal = ?, id_user = ? 
            WHERE id_jahit = ?
        ");
        mysqli_stmt_bind_param($stmt, "issii", $jumlah_hasil, $status, $tanggal, $id_user, $id_jahit);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data jahit."
            ]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id_jahit = isset($input['id_jahit']) ? $input['id_jahit'] : '';

        if (empty($id_jahit)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM jahit WHERE id_jahit = ?");
        mysqli_stmt_bind_param($stmt, "i", $id_jahit);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data jahit berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data jahit."
            ]);
        }
        break;

    default:
        echo json_encode([
            "status"  => "error",
            "message" => "Method tidak diizinkan."
        ]);
        break;
}
?>