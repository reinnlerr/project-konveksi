<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include "koneksi.php";

// Total batch
$total_batch = mysqli_fetch_assoc(mysqli_query($koneksi, "
    SELECT COUNT(*) as total FROM batch
"));

// Batch aktif (status = proses)
$batch_aktif = mysqli_fetch_assoc(mysqli_query($koneksi, "
    SELECT COUNT(*) as total FROM batch WHERE status = 'proses'
"));

// Batch selesai (status = selesai)
$batch_selesai = mysqli_fetch_assoc(mysqli_query($koneksi, "
    SELECT COUNT(*) as total FROM batch WHERE status = 'selesai'
"));

// Chart produksi mingguan (dari tabel cutting sebagai acuan produksi)
$chart = mysqli_query($koneksi, "
    SELECT 
        DAYNAME(tanggal) as hari,
        COUNT(*) as total
    FROM cutting
    WHERE tanggal >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DAYNAME(tanggal), tanggal
    ORDER BY tanggal ASC
");
$chart_data = [];
while ($row = mysqli_fetch_assoc($chart)) {
    $chart_data[] = $row;
}

// Recent activity gabungan dari semua tabel produksi
$activity = mysqli_query($koneksi, "
    SELECT 'Bahan Masuk' as aktivitas, nama_bahan as deskripsi, tanggal FROM bahan_masuk
    UNION ALL
    SELECT 'Cutting' as aktivitas, CONCAT('Hasil cutting ', jumlah_hasil, ' pcs') as deskripsi, tanggal FROM cutting
    UNION ALL
    SELECT 'Jahit' as aktivitas, CONCAT('Hasil jahit ', jumlah_hasil, ' pcs - ', status) as deskripsi, tanggal FROM jahit
    UNION ALL
    SELECT 'Finishing' as aktivitas, CONCAT('Hasil finishing ', jumlah_hasil, ' pcs - ', status) as deskripsi, tanggal FROM finishing
    UNION ALL
    SELECT 'Pengiriman' as aktivitas, CONCAT('Dikirim ', jumlah_kirim, ' pcs') as deskripsi, tanggal_kirim as tanggal FROM pengiriman
    ORDER BY tanggal DESC
    LIMIT 5
");
$activity_data = [];
while ($row = mysqli_fetch_assoc($activity)) {
    $activity_data[] = $row;
}

// Progress batch yang masih proses
$progress = mysqli_query($koneksi, "
    SELECT 
        b.id_batch,
        b.nama_batch,
        b.status,
        COALESCE(f.jumlah_hasil, 0) as jumlah_finishing,
        COALESCE(c.jumlah_hasil, 0) as jumlah_cutting,
        CASE 
            WHEN f.jumlah_hasil IS NOT NULL THEN 'Finishing'
            WHEN j.jumlah_hasil IS NOT NULL THEN 'Jahit'
            WHEN c.jumlah_hasil IS NOT NULL THEN 'Cutting'
            ELSE 'Bahan Masuk'
        END as tahap_sekarang,
        CASE 
            WHEN f.jumlah_hasil IS NOT NULL AND c.jumlah_hasil > 0 
                THEN ROUND((f.jumlah_hasil / c.jumlah_hasil) * 100)
            WHEN j.jumlah_hasil IS NOT NULL AND c.jumlah_hasil > 0 
                THEN ROUND((j.jumlah_hasil / c.jumlah_hasil) * 100)
            ELSE 0
        END as progress_persen
    FROM batch b
    LEFT JOIN cutting c ON b.id_batch = c.id_batch
    LEFT JOIN jahit j ON b.id_batch = j.id_batch
    LEFT JOIN finishing f ON b.id_batch = f.id_batch
    WHERE b.status = 'proses'
    ORDER BY b.tanggal_mulai ASC
    LIMIT 3
");
$progress_data = [];
while ($row = mysqli_fetch_assoc($progress)) {
    $progress_data[] = $row;
}

// Notifikasi batch yang terlambat (lebih dari 7 hari masih proses)
$notif = mysqli_query($koneksi, "
    SELECT 
        nama_batch,
        DATEDIFF(NOW(), tanggal_mulai) as hari_berjalan
    FROM batch
    WHERE status = 'proses'
    AND DATEDIFF(NOW(), tanggal_mulai) > 7
    ORDER BY tanggal_mulai ASC
");
$notif_data = [];
while ($row = mysqli_fetch_assoc($notif)) {
    $notif_data[] = [
        "judul" => $row['nama_batch'] . " terlambat " . $row['hari_berjalan'] . " hari",
        "level" => "Perlu perhatian"
    ];
}

echo json_encode([
    "status" => "success",
    "data"   => [
        "stats" => [
            ["label" => "Total Batch",   "value" => (int)$total_batch['total']],
            ["label" => "Batch Aktif",   "value" => (int)$batch_aktif['total']],
            ["label" => "Batch Selesai", "value" => (int)$batch_selesai['total']]
        ],
        "chart_mingguan"  => $chart_data,
        "recent_activity" => $activity_data,
        "progress_batch"  => $progress_data,
        "notifikasi"      => $notif_data
    ]
]);
?>