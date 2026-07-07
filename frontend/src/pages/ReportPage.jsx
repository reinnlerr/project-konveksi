import { useEffect, useState, useMemo } from "react";
import { Card, EmptyState } from "../components/ui";
import { Download, Filter, X } from "lucide-react";

const API_URL = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

const statusColor = {
  proses:  "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
};

const finishingColor = {
  Selesai: "bg-green-100 text-green-700",
  Revisi:  "bg-red-100 text-red-700",
  selesai: "bg-green-100 text-green-700",
  revisi:  "bg-red-100 text-red-700",
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportPage({ searchQuery }) {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // State filter
  const [filterBulan,  setFilterBulan]  = useState("");   // "" = semua, "1"–"12"
  const [filterTahun,  setFilterTahun]  = useState("");   // "" = semua
  const [filterDariTgl, setFilterDariTgl] = useState(""); // YYYY-MM-DD
  const [filterSampaiTgl, setFilterSampaiTgl] = useState(""); // YYYY-MM-DD

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res  = await fetch(`${API_URL}/report.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === "success") setData(json.data);
      } catch (err) {
        console.error("Gagal fetch laporan");
      }
      setLoading(false);
    };
    fetchReport();
  }, [token]);

  const hasActiveFilter = filterBulan || filterTahun || filterDariTgl || filterSampaiTgl;

  const resetFilter = () => {
    setFilterBulan("");
    setFilterTahun("");
    setFilterDariTgl("");
    setFilterSampaiTgl("");
  };

  // Filter gabungan: searchQuery + filter tanggal
  const filteredData = useMemo(() => {
    let result = data;

    // --- Filter keyword pencarian ---
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        String(item.id_batch || "").toLowerCase().includes(query) ||
        String(item.nama_batch || "").toLowerCase().includes(query) ||
        String(item.customer_email || "").toLowerCase().includes(query) ||
        String(item.jenis_baju || "").toLowerCase().includes(query) ||
        String(item.status_batch || "").toLowerCase().includes(query) ||
        String(item.id_order || "").toLowerCase().includes(query)
      );
    }

    // --- Filter bulan ---
    if (filterBulan) {
      result = result.filter((item) => {
        const tgl = item.tanggal_mulai || "";
        if (!tgl) return false;
        const bulan = parseInt(tgl.split("-")[1], 10); // ambil bulan dari YYYY-MM-DD
        return bulan === parseInt(filterBulan, 10);
      });
    }

    // --- Filter tahun ---
    if (filterTahun) {
      result = result.filter((item) => {
        const tgl = item.tanggal_mulai || "";
        if (!tgl) return false;
        const tahun = tgl.split("-")[0];
        return tahun === filterTahun;
      });
    }

    // --- Filter rentang tanggal (dari tgl – sampai tgl) ---
    if (filterDariTgl) {
      result = result.filter((item) => {
        const tgl = item.tanggal_mulai || "";
        return tgl >= filterDariTgl;
      });
    }
    if (filterSampaiTgl) {
      result = result.filter((item) => {
        const tgl = item.tanggal_mulai || "";
        return tgl <= filterSampaiTgl;
      });
    }

    return result;
  }, [data, searchQuery, filterBulan, filterTahun, filterDariTgl, filterSampaiTgl]);

  // Fungsi download CSV — hanya data yang sudah terfilter
  const downloadCSV = () => {
    const headers = [
      "ID Batch","Nama Batch","Tgl Mulai","Customer","Jenis Baju",
      "Jumlah Order (pcs)","Total Cutting (pcs)","Total Jahit (pcs)",
      "Status Finishing","Total Kirim (pcs)","Deadline","Status Batch","Catatan"
    ];
    const escape = (val) => `"${String(val ?? "-").replace(/"/g, '""')}"`;
    const rows = filteredData.map((item) => [
      escape(item.id_batch),
      escape(item.nama_batch),
      escape(item.tanggal_mulai),
      escape(item.customer_email),
      escape(item.jenis_baju),
      escape(item.jumlah_order),
      escape(item.total_cutting),
      escape(item.total_jahit),
      escape(item.status_finishing),
      escape(item.total_kirim),
      escape(item.deadline),
      escape(item.status_batch),
      escape(item.catatan),
    ].join(","));

    const csv  = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href     = url;
    link.download = `laporan-produksi-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-sm text-slate-400">Memuat laporan...</p>;

  if (!data.length) {
    return (
      <EmptyState
        title="Data laporan kosong"
        subtitle="Belum ada data batch yang bisa ditampilkan."
      />
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Batch"   value={filteredData.length} color="pink" />
        <SummaryCard label="Batch Selesai" value={filteredData.filter(d => d.status_batch === "selesai").length} color="green" />
        <SummaryCard label="Batch Proses"  value={filteredData.filter(d => d.status_batch === "proses").length} color="blue" />
        <SummaryCard label="Total Dikirim" value={filteredData.reduce((a, d) => a + (parseInt(d.total_kirim) || 0), 0) + " pcs"} color="teal" />
      </div>

      {/* Toolbar: Filter + Download */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            showFilter || hasActiveFilter
              ? "border-pink-400 bg-pink-50 text-pink-600"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Filter size={15} />
          Filter
          {hasActiveFilter && (
            <span className="ml-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              aktif
            </span>
          )}
        </button>

        {hasActiveFilter && (
          <button
            onClick={resetFilter}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 hover:text-red-500 hover:border-red-300 transition-all"
          >
            <X size={14} /> Reset Filter
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={downloadCSV}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>

      {/* Panel Filter */}
      {showFilter && (
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-slate-700">Filter berdasarkan Tanggal Mulai Batch</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Filter Bulan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Bulan</label>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
              >
                <option value="">Semua Bulan</option>
                {MONTHS.map((bln, i) => (
                  <option key={i + 1} value={i + 1}>{bln}</option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Tahun</label>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
              >
                <option value="">Semua Tahun</option>
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>

            {/* Dari Tanggal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Dari Tanggal</label>
              <input
                type="date"
                value={filterDariTgl}
                onChange={(e) => setFilterDariTgl(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Sampai Tanggal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Sampai Tanggal</label>
              <input
                type="date"
                value={filterSampaiTgl}
                onChange={(e) => setFilterSampaiTgl(e.target.value)}
                min={filterDariTgl || undefined}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>

          </div>

          {/* Info hasil filter */}
          <p className="mt-4 text-xs text-slate-400">
            Menampilkan <strong className="text-slate-600">{filteredData.length}</strong> dari <strong className="text-slate-600">{data.length}</strong> batch
            {hasActiveFilter && " sesuai filter yang dipilih"}
          </p>
        </Card>
      )}

      {/* Tabel Laporan */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Tgl Mulai</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Jenis Baju</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Cutting</th>
                <th className="px-4 py-3 font-semibold">Jahit</th>
                <th className="px-4 py-3 font-semibold">Finishing</th>
                <th className="px-4 py-3 font-semibold">Kirim</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-10 text-center text-slate-400">
                    {searchQuery || hasActiveFilter
                      ? "Tidak ada data yang cocok dengan filter yang dipilih."
                      : "Belum ada data laporan."}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id_batch} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.nama_batch}{" "}
                      <span className="text-xs text-slate-400 font-mono">(ID: {item.id_batch})</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{item.tanggal_mulai || "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{item.customer_email || "-"}</td>
                    <td className="px-4 py-3">{item.jenis_baju || "-"}</td>
                    <td className="px-4 py-3">{item.jumlah_order ? `${item.jumlah_order} pcs` : "-"}</td>
                    <td className="px-4 py-3">{item.total_cutting ? `${item.total_cutting} pcs` : "-"}</td>
                    <td className="px-4 py-3">{item.total_jahit ? `${item.total_jahit} pcs` : "-"}</td>
                    <td className="px-4 py-3">
                      {item.status_finishing ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${finishingColor[item.status_finishing] || "bg-slate-100 text-slate-600"}`}>
                          {item.status_finishing}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">{item.total_kirim ? `${item.total_kirim} pcs` : "-"}</td>
                    <td className="px-4 py-3">{item.deadline || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[item.status_batch] || "bg-slate-100 text-slate-600"}`}>
                        {item.status_batch}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Catatan Customer */}
      {filteredData.some(d => d.catatan) && (
        <Card className="p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">Catatan Customer</h3>
          <div className="space-y-2">
            {filteredData.filter(d => d.catatan).map((item) => (
              <div key={item.id_batch} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">{item.nama_batch}</p>
                <p className="text-sm text-slate-500 mt-1">📝 {item.catatan}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    pink:  "bg-pink-50 text-pink-600 border-pink-200",
    green: "bg-green-50 text-green-600 border-green-200",
    blue:  "bg-blue-50 text-blue-600 border-blue-200",
    teal:  "bg-teal-50 text-teal-600 border-teal-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
