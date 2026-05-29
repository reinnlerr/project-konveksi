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

// ── Laporan per batch ──
$result = mysqli_query($koneksi, "
    SELECT 
        b.id_batch,
        b.nama_batch,
        b.status as status_batch,
        b.tanggal_mulai,
        o.jenis_baju,
        o.jumlah as jumlah_order,
        o.deadline,
        o.catatan,
        u.Email as customer_email,
        -- Cutting
        (SELECT SUM(c.jumlah_hasil) FROM cutting c WHERE c.id_batch = b.id_batch) as total_cutting,
        -- Jahit
        (SELECT SUM(j.jumlah_hasil) FROM jahit j WHERE j.id_batch = b.id_batch) as total_jahit,
        -- Finishing
        (SELECT SUM(f.jumlah_hasil) FROM finishing f WHERE f.id_batch = b.id_batch) as total_finishing,
        (SELECT f.status FROM finishing f WHERE f.id_batch = b.id_batch ORDER BY f.id_finishing DESC LIMIT 1) as status_finishing,
        -- Pengiriman
        (SELECT SUM(p.jumlah_kirim) FROM pengiriman p WHERE p.id_batch = b.id_batch) as total_kirim,
        (SELECT p.tanggal_kirim FROM pengiriman p WHERE p.id_batch = b.id_batch ORDER BY p.id_pengiriman DESC LIMIT 1) as tanggal_kirim
    FROM batch b
    LEFT JOIN orders o ON o.id_batch = b.id_batch
    LEFT JOIN users u ON u.id_user = o.id_user
    ORDER BY b.id_batch DESC
");

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => "success", "data" => $data]);
?>