-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 07 Jul 2026 pada 08.16
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_konveksi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bahan_masuk`
--

CREATE TABLE `bahan_masuk` (
  `id_bahan` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `nama_bahan` varchar(100) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bahan_masuk`
--

INSERT INTO `bahan_masuk` (`id_bahan`, `id_batch`, `nama_bahan`, `jumlah`, `tanggal`) VALUES
(1, 1, 'Kain Katun Combed 30s', 150, '2026-05-12'),
(2, 2, 'Bahan kemeja PDH', 3, '2026-05-20'),
(3, 3, 'Bahan kaos poloss', 3, '2026-06-01'),
(4, 3, 'Cotton Combed', 3, '2026-06-06'),
(7, 5, 'cotton combed', 5, '2026-06-10'),
(8, 6, 'Bahan Kaos Persib', 5, '2026-07-04'),
(9, 6, 'Kain Sutra', 5, '2026-07-04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `batch`
--

CREATE TABLE `batch` (
  `id_batch` int(11) NOT NULL,
  `nama_batch` varchar(100) NOT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `status` enum('proses','selesai') DEFAULT 'proses',
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `batch`
--

INSERT INTO `batch` (`id_batch`, `nama_batch`, `tanggal_mulai`, `status`, `created_by`) VALUES
(1, 'Order Kemeja Polos 100pcs', '2026-05-12', 'proses', 1),
(2, 'Order #1 - kemeja PDH', '2026-05-20', 'selesai', 2),
(3, 'Order #2 - kaos poloss', '2026-06-01', 'selesai', 2),
(4, 'Order #3 - Kaos oblong', '2026-06-08', 'selesai', 2),
(5, 'Order #4 - kaos garuda', '2026-06-09', 'selesai', 2),
(6, 'Order #5 - Kaos Persib', '2026-07-04', 'proses', 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cutting`
--

CREATE TABLE `cutting` (
  `id_cutting` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cutting`
--

INSERT INTO `cutting` (`id_cutting`, `id_batch`, `jumlah_hasil`, `tanggal`, `id_user`) VALUES
(1, 1, 105, '2026-05-13', 1),
(7, 3, 3, '2026-06-01', 9),
(8, 4, 3, '2026-06-08', 9),
(10, 5, 5, '2026-06-10', 9);

-- --------------------------------------------------------

--
-- Struktur dari tabel `finishing`
--

CREATE TABLE `finishing` (
  `id_finishing` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `finishing`
--

INSERT INTO `finishing` (`id_finishing`, `id_batch`, `jumlah_hasil`, `status`, `tanggal`, `id_user`, `foto`) VALUES
(1, 1, 100, 'selesai', '2026-05-16', 1, NULL),
(2, 2, 2, 'Selesai', '2026-05-24', 9, NULL),
(6, 3, 3, 'Selesai', '2026-06-01', 9, NULL),
(11, 4, 3, 'Revisi', '2026-06-08', 9, NULL),
(12, 4, 3, 'Selesai', '2026-06-09', 9, NULL),
(13, 5, 5, 'Revisi', '2026-06-10', 9, NULL),
(17, 5, 5, 'Selesai', '2026-06-15', 6, 'uploads/finishing/finishing_1781502525_6a2f923dd524d.png');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jahit`
--

CREATE TABLE `jahit` (
  `id_jahit` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_hasil` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jahit`
--

INSERT INTO `jahit` (`id_jahit`, `id_batch`, `jumlah_hasil`, `status`, `tanggal`, `id_user`) VALUES
(1, 1, 102, 'selesai', '2026-05-15', 1),
(2, 2, 3, 'proses', '2026-05-24', 9),
(3, 3, 3, 'proses', '2026-06-01', 9),
(4, 4, 3, 'proses', '2026-06-08', 9),
(6, 5, 5, 'proses', '2026-06-10', 9),
(7, 5, 5, 'proses', '2026-06-10', 9),
(8, 5, 5, 'proses', '2026-06-14', 9),
(9, 5, 5, 'proses', '2026-06-15', 9),
(10, 5, 5, 'proses', '2026-06-15', 9),
(11, 5, 5, 'proses', '2026-06-15', 9);

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id_order` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `jenis_baju` varchar(100) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `deadline` date NOT NULL,
  `status` enum('pending','bahan','cutting','jahit','finishing','menunggu_pembayaran','menunggu_konfirmasi','pengiriman','selesai') NOT NULL DEFAULT 'pending',
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_batch` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id_order`, `id_user`, `jenis_baju`, `jumlah`, `deadline`, `status`, `catatan`, `created_at`, `id_batch`) VALUES
(1, 6, 'kemeja PDH', 3, '2026-05-21', 'selesai', 'test', '2026-05-20 05:48:25', 2),
(2, 6, 'kaos poloss', 3, '2026-06-05', 'selesai', 'warna biru, xxl', '2026-06-01 05:12:32', 3),
(3, 6, 'Kaos oblong', 3, '2026-06-12', 'bahan', 'Warna putih,XXL', '2026-06-08 10:48:20', 4),
(4, 6, 'kaos garuda', 5, '2026-06-12', 'selesai', 'all varian size(S,M,L,XL,XXL) WARNA TERSERAH adminn', '2026-06-09 16:43:13', 5),
(5, 6, 'Kaos Persib', 5, '2026-07-08', 'cutting', 'warna nya Yang cerah, Kain nya yang halus dan juga ukuran nya XL,XXL,M,S', '2026-07-04 03:42:25', 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment`
--

CREATE TABLE `payment` (
  `id_payment` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `total_bayar` decimal(12,2) DEFAULT NULL,
  `metode_bayar` varchar(50) DEFAULT NULL,
  `tanggal_bayar` date DEFAULT NULL,
  `status_bayar` enum('belum','lunas') DEFAULT 'belum'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `payment`
--

INSERT INTO `payment` (`id_payment`, `id_batch`, `total_bayar`, `metode_bayar`, `tanggal_bayar`, `status_bayar`) VALUES
(1, 1, 5000000.00, 'Transfer BCA', '2026-05-12', 'lunas');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id_pembayaran` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `harga_satuan` int(11) NOT NULL,
  `total_harga` int(11) NOT NULL,
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `status` enum('menunggu_pembayaran','menunggu_konfirmasi','lunas') DEFAULT 'menunggu_pembayaran',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pembayaran`
--

INSERT INTO `pembayaran` (`id_pembayaran`, `id_order`, `harga_satuan`, `total_harga`, `bukti_transfer`, `status`, `created_at`) VALUES
(1, 4, 50000, 250000, 'uploads/bukti/bukti_1783088150_6a47c416b6c43.png', 'lunas', '2026-07-03 14:15:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengiriman`
--

CREATE TABLE `pengiriman` (
  `id_pengiriman` int(11) NOT NULL,
  `id_batch` int(11) DEFAULT NULL,
  `jumlah_kirim` int(11) DEFAULT NULL,
  `tanggal_kirim` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pengiriman`
--

INSERT INTO `pengiriman` (`id_pengiriman`, `id_batch`, `jumlah_kirim`, `tanggal_kirim`) VALUES
(1, 1, 100, '2026-05-17'),
(2, 2, 2, '2026-05-25'),
(3, 3, 3, '2026-06-06'),
(4, 4, 3, '2026-06-09'),
(5, 5, 5, '2026-07-04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `revisi_log`
--

CREATE TABLE `revisi_log` (
  `id_revisi` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `alasan` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `revisi_log`
--

INSERT INTO `revisi_log` (`id_revisi`, `id_order`, `alasan`, `created_at`, `foto`) VALUES
(1, 4, 'kurang menarik di bajunya, tolong ubah', '2026-06-14 12:16:27', NULL),
(2, 4, 'test', '2026-06-15 05:19:23', NULL),
(3, 4, 'mungkin kurang ini', '2026-06-15 05:45:58', 'uploads/revisi/revisi_1781502358_6a2f9196d762c.png');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer','karyawan','bahan','cutting','jahit','finishing','pengiriman') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `nama` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `Email`, `password`, `role`, `created_at`, `nama`, `no_hp`, `alamat`) VALUES
(1, 'bayu@gmail.com', '123456', 'admin', '2026-05-12 10:18:02', NULL, NULL, NULL),
(2, 'admin@konveksi.com', '$2y$10$waHxsITc0y7LQ2.Ri88xyuD.YAkWOvVbZUjp3IjHiA/44URs1Zno2', 'admin', '2026-05-18 08:40:23', NULL, NULL, NULL),
(6, 'nana@gmail.com', '$2y$10$Ove11pzpIzXFMVu2U6/hy.p.UpLYs5ROzVunOB50HN2nfVYcINbZe', 'customer', '2026-05-20 04:55:00', 'Nana Nunu', '087665716254', 'jln antah berantah'),
(9, 'jokoanwar@gmail.com', '$2y$10$KX0rmv0oYBCpZxlE4c2qQu.iclWgJuLS0wMgv7Az6iyl6EP3OUFQu', 'karyawan', '2026-05-22 03:53:03', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  ADD PRIMARY KEY (`id_bahan`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indeks untuk tabel `batch`
--
ALTER TABLE `batch`
  ADD PRIMARY KEY (`id_batch`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `cutting`
--
ALTER TABLE `cutting`
  ADD PRIMARY KEY (`id_cutting`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `finishing`
--
ALTER TABLE `finishing`
  ADD PRIMARY KEY (`id_finishing`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `jahit`
--
ALTER TABLE `jahit`
  ADD PRIMARY KEY (`id_jahit`),
  ADD KEY `id_batch` (`id_batch`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `fk_order_batch` (`id_batch`);

--
-- Indeks untuk tabel `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id_payment`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indeks untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id_pembayaran`),
  ADD KEY `id_order` (`id_order`);

--
-- Indeks untuk tabel `pengiriman`
--
ALTER TABLE `pengiriman`
  ADD PRIMARY KEY (`id_pengiriman`),
  ADD KEY `id_batch` (`id_batch`);

--
-- Indeks untuk tabel `revisi_log`
--
ALTER TABLE `revisi_log`
  ADD PRIMARY KEY (`id_revisi`),
  ADD KEY `id_order` (`id_order`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  MODIFY `id_bahan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `batch`
--
ALTER TABLE `batch`
  MODIFY `id_batch` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `cutting`
--
ALTER TABLE `cutting`
  MODIFY `id_cutting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `finishing`
--
ALTER TABLE `finishing`
  MODIFY `id_finishing` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `jahit`
--
ALTER TABLE `jahit`
  MODIFY `id_jahit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `payment`
--
ALTER TABLE `payment`
  MODIFY `id_payment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `pengiriman`
--
ALTER TABLE `pengiriman`
  MODIFY `id_pengiriman` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `revisi_log`
--
ALTER TABLE `revisi_log`
  MODIFY `id_revisi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `bahan_masuk`
--
ALTER TABLE `bahan_masuk`
  ADD CONSTRAINT `bahan_masuk_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `batch`
--
ALTER TABLE `batch`
  ADD CONSTRAINT `batch_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `cutting`
--
ALTER TABLE `cutting`
  ADD CONSTRAINT `cutting_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `cutting_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Ketidakleluasaan untuk tabel `finishing`
--
ALTER TABLE `finishing`
  ADD CONSTRAINT `finishing_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `finishing_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Ketidakleluasaan untuk tabel `jahit`
--
ALTER TABLE `jahit`
  ADD CONSTRAINT `jahit_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE,
  ADD CONSTRAINT `jahit_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_batch` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Ketidakleluasaan untuk tabel `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);

--
-- Ketidakleluasaan untuk tabel `pengiriman`
--
ALTER TABLE `pengiriman`
  ADD CONSTRAINT `pengiriman_ibfk_1` FOREIGN KEY (`id_batch`) REFERENCES `batch` (`id_batch`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `revisi_log`
--
ALTER TABLE `revisi_log`
  ADD CONSTRAINT `revisi_log_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
