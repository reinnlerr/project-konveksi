<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // Ambil semua data bahan masuk
    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT id, nama_bahan, jumlah, satuan, batch_id, tanggal, keterangan 
            FROM bahan_masuk 
            ORDER BY tanggal DESC
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

    // Tambah data bahan masuk
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $nama_bahan  = isset($input['nama_bahan']) ? trim($input['nama_bahan']) : '';
        $jumlah      = isset($input['jumlah']) ? $input['jumlah'] : '';
        $satuan      = isset($input['satuan']) ? trim($input['satuan']) : '';
        $batch_id    = isset($input['batch_id']) ? $input['batch_id'] : '';
        $keterangan  = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        // Validasi
        if (empty($nama_bahan) || empty($jumlah) || empty($satuan) || empty($batch_id)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Nama bahan, jumlah, satuan, dan batch wajib diisi."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO bahan_masuk (nama_bahan, jumlah, satuan, batch_id, keterangan, tanggal) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        mysqli_stmt_bind_param($stmt, "sdsis", $nama_bahan, $jumlah, $satuan, $batch_id, $keterangan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Bahan masuk berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan bahan masuk."
            ]);
        }
        break;

    // Update data bahan masuk
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id         = isset($input['id']) ? $input['id'] : '';
        $nama_bahan = isset($input['nama_bahan']) ? trim($input['nama_bahan']) : '';
        $jumlah     = isset($input['jumlah']) ? $input['jumlah'] : '';
        $satuan     = isset($input['satuan']) ? trim($input['satuan']) : '';
        $keterangan = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        if (empty($id) || empty($nama_bahan) || empty($jumlah) || empty($satuan)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE bahan_masuk 
            SET nama_bahan = ?, jumlah = ?, satuan = ?, keterangan = ? 
            WHERE id = ?
        ");
        mysqli_stmt_bind_param($stmt, "sdssі", $nama_bahan, $jumlah, $satuan, $keterangan, $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data bahan masuk berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data."
            ]);
        }
        break;

    // Hapus data bahan masuk
    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $id = isset($input['id']) ? $input['id'] : '';

        if (empty($id)) {
            echo json_encode([
                "status"  => "error",
                "message" => "ID tidak ditemukan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM bahan_masuk WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data bahan masuk berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data."
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