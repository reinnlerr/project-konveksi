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
            SELECT c.id_cutting, c.id_batch, ba.nama_batch,
                   c.jumlah_hasil, c.tanggal, c.id_user,
                   u.Email as nama_user
            FROM cutting c
            LEFT JOIN batch ba ON c.id_batch = ba.id_batch
            LEFT JOIN users u ON c.id_user = u.id_user
            ORDER BY c.tanggal DESC
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
            INSERT INTO cutting (id_batch, jumlah_hasil, tanggal, id_user) 
            VALUES (?, ?, ?, ?)
        ");
        mysqli_stmt_bind_param($stmt, "iisi", $id_batch, $jumlah_hasil, $tanggal, $id_user);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data cutting."
            ]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id_cutting   = isset($input['id_cutting']) ? $input['id_cutting'] : '';
        $jumlah_hasil = isset($input['jumlah_hasil']) ? $input['jumlah_hasil'] : '';
        $tanggal      = isset($input['tanggal']) ? $input['tanggal'] : '';
        $id_user      = isset($input['id_user']) ? $input['id_user'] : '';

        if (empty($id_cutting) || empty($jumlah_hasil) || empty($id_user)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE cutting 
            SET jumlah_hasil = ?, tanggal = ?, id_user = ? 
            WHERE id_cutting = ?
        ");
        mysqli_stmt_bind_param($stmt, "iisi", $jumlah_hasil, $tanggal, $id_user, $id_cutting);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data cutting."
            ]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id_cutting = isset($input['id_cutting']) ? $input['id_cutting'] : '';

        if (empty($id_cutting)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM cutting WHERE id_cutting = ?");
        mysqli_stmt_bind_param($stmt, "i", $id_cutting);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data cutting berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data cutting."
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