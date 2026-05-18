<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "koneksi.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // Ambil semua data pengiriman
    case 'GET':
        $result = mysqli_query($koneksi, "
            SELECT id, batch_id, nama_penerima, alamat, 
                   jumlah_kirim, status, tanggal_kirim, keterangan 
            FROM pengiriman 
            ORDER BY tanggal_kirim DESC
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

    // Tambah data pengiriman
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        $batch_id      = isset($input['batch_id']) ? $input['batch_id'] : '';
        $nama_penerima = isset($input['nama_penerima']) ? trim($input['nama_penerima']) : '';
        $alamat        = isset($input['alamat']) ? trim($input['alamat']) : '';
        $jumlah_kirim  = isset($input['jumlah_kirim']) ? $input['jumlah_kirim'] : '';
        $status        = isset($input['status']) ? trim($input['status']) : 'menunggu';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        // Validasi
        if (empty($batch_id) || empty($nama_penerima) || empty($alamat) || empty($jumlah_kirim)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Batch, nama penerima, alamat, dan jumlah kirim wajib diisi."
            ]);
            exit;
        }

        // Validasi jumlah kirim harus lebih dari 0
        if ($jumlah_kirim <= 0) {
            echo json_encode([
                "status"  => "error",
                "message" => "Jumlah kirim harus lebih dari 0."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            INSERT INTO pengiriman (batch_id, nama_penerima, alamat, jumlah_kirim, status, keterangan, tanggal_kirim) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        mysqli_stmt_bind_param($stmt, "ississ", $batch_id, $nama_penerima, $alamat, $jumlah_kirim, $status, $keterangan);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil ditambahkan."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menambahkan data pengiriman."
            ]);
        }
        break;

    // Update data pengiriman
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);

        $id            = isset($input['id']) ? $input['id'] : '';
        $nama_penerima = isset($input['nama_penerima']) ? trim($input['nama_penerima']) : '';
        $alamat        = isset($input['alamat']) ? trim($input['alamat']) : '';
        $jumlah_kirim  = isset($input['jumlah_kirim']) ? $input['jumlah_kirim'] : '';
        $status        = isset($input['status']) ? trim($input['status']) : '';
        $keterangan    = isset($input['keterangan']) ? trim($input['keterangan']) : '';

        if (empty($id) || empty($nama_penerima) || empty($alamat) || empty($jumlah_kirim) || empty($status)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Data tidak lengkap."
            ]);
            exit;
        }

        // Validasi status pengiriman
        $allowed_status = ['menunggu', 'dikirim', 'sampai', 'dibatalkan'];
        if (!in_array($status, $allowed_status)) {
            echo json_encode([
                "status"  => "error",
                "message" => "Status tidak valid. Pilih: menunggu, dikirim, sampai, atau dibatalkan."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "
            UPDATE pengiriman 
            SET nama_penerima = ?, alamat = ?, jumlah_kirim = ?, status = ?, keterangan = ? 
            WHERE id = ?
        ");
        mysqli_stmt_bind_param($stmt, "ssissi", $nama_penerima, $alamat, $jumlah_kirim, $status, $keterangan, $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil diupdate."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal mengupdate data pengiriman."
            ]);
        }
        break;

    // Hapus data pengiriman
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

        // Cek status sebelum hapus, tidak boleh hapus yang sudah dikirim
        $cek = mysqli_prepare($koneksi, "SELECT status FROM pengiriman WHERE id = ?");
        mysqli_stmt_bind_param($cek, "i", $id);
        mysqli_stmt_execute($cek);
        $result = mysqli_stmt_get_result($cek);
        $row = mysqli_fetch_assoc($result);

        if ($row && $row['status'] === 'dikirim') {
            echo json_encode([
                "status"  => "error",
                "message" => "Data pengiriman yang sudah dikirim tidak bisa dihapus."
            ]);
            exit;
        }

        $stmt = mysqli_prepare($koneksi, "DELETE FROM pengiriman WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status"  => "success",
                "message" => "Data pengiriman berhasil dihapus."
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Gagal menghapus data pengiriman."
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