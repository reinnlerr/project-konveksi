import { useCallback, useEffect, useState, useMemo } from "react";
import { Card } from "../components/ui";

const API_URL = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshBar({ onRefresh, isRefreshing, lastRefresh }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs text-slate-500">Live</span>
        {lastRefresh && (
          <span className="text-xs text-slate-400">
            · Terakhir: {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 text-xs text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 rounded-xl px-3 py-1.5 transition disabled:opacity-50 font-medium"
      >
        <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isRefreshing ? "Memuat..." : "Refresh"}
      </button>
    </div>
  );
}

const stageProgress = {
  pending:    0,
  bahan:      20,
  cutting:    40,
  jahit:      60,
  finishing:  80,
  pengiriman: 90,
  selesai:    100,
};

const stageLabel = {
  pending:    "Menunggu",
  bahan:      "Bahan Masuk",
  cutting:    "Cutting",
  jahit:      "Jahit",
  finishing:  "Finishing",
  pengiriman: "Pengiriman",
  selesai:    "Selesai",
};

export default function DashboardPage({ user, searchQuery }) {
  const [stats, setStats]           = useState({ total: 0, aktif: 0, selesai: 0 });
  const [batches, setBatches]       = useState([]);
  const [activities, setActivities] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const token = localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res  = await fetch(`${API_URL}/report.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === "success") {
        const all     = data.data;
        const selesai = all.filter(b => b.status_batch === "selesai").length;
        const aktif   = all.filter(b => b.status_batch !== "selesai").length;
        setStats({ total: all.length, aktif, selesai });
        setBatches(all);
      }

      const [hCutting, hJahit, hFinishing, hPengiriman, hBahan] = await Promise.all([
        fetch(`${API_URL}/history.php?type=cutting`,    { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_URL}/history.php?type=jahit`,      { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_URL}/history.php?type=finishing`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_URL}/history.php?type=pengiriman`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_URL}/history.php?type=bahan`,      { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);

      const allActivities = [
        ...(hBahan.data      || []).map(r => ({ type: "Bahan Masuk", desc: `${r.nama_bahan} - ${r.nama_batch}`,       tanggal: r.tanggal })),
        ...(hCutting.data    || []).map(r => ({ type: "Cutting",     desc: `${r.jumlah_hasil} pcs - ${r.nama_batch}`, tanggal: r.tanggal })),
        ...(hJahit.data      || []).map(r => ({ type: "Jahit",       desc: `${r.jumlah_hasil} pcs - ${r.nama_batch}`, tanggal: r.tanggal })),
        ...(hFinishing.data  || []).map(r => ({ type: "Finishing",   desc: `${r.status} - ${r.nama_batch}`,           tanggal: r.tanggal })),
        ...(hPengiriman.data || []).map(r => ({ type: "Pengiriman",  desc: `${r.jumlah_kirim} pcs - ${r.nama_batch}`, tanggal: r.tanggal })),
      ]
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 5);

      setActivities(allActivities);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Gagal fetch dashboard:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Memfilter batch secara dinamis berdasarkan searchQuery di Dashboard
  const filteredBatches = useMemo(() => {
    if (!searchQuery) return batches.slice(0, 5); // Tampilkan 5 teratas secara default
    const query = searchQuery.toLowerCase().trim();
    return batches.filter((b) => {
      const matchBatchId   = String(b.id_batch || "").toLowerCase().includes(query);
      const matchBatchName = String(b.nama_batch || "").toLowerCase().includes(query);
      const matchEmail     = String(b.customer_email || "").toLowerCase().includes(query);
      const matchBaju      = String(b.jenis_baju || "").toLowerCase().includes(query);
      const matchStatus    = String(b.status_batch || "").toLowerCase().includes(query);
      return matchBatchId || matchBatchName || matchEmail || matchBaju || matchStatus;
    });
  }, [batches, searchQuery]);

  const statCards = [
    { label: "Total Batch",   value: stats.total,   icon: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z" },
    { label: "Batch Aktif",   value: stats.aktif,   icon: "M8 5v14l11-7z" },
    { label: "Batch Selesai", value: stats.selesai, icon: "M5 12l4 4L19 6" },
  ];

  return (
    <section className="space-y-4">
      <RefreshBar onRefresh={fetchDashboard} isRefreshing={isRefreshing} lastRefresh={lastRefresh} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} iconPath={item.icon} />
        ))}
      </div>

      {/* Progress Batch & Recent Activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Recent Activity */}
        <Card className="space-y-3 p-5 xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-800">Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-pink-300 hover:bg-pink-50/30">
                  <span className="mt-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-1.5 text-white">
                    <Icon path="M12 6v6l4 2M22 12A10 10 0 112 12a10 10 0 0120 0z" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{activity.type}</p>
                    <p className="text-sm text-slate-500">{activity.desc}</p>
                    <p className="mt-1 text-xs text-slate-400">{activity.tanggal}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Progress Batch */}
        <Card className="space-y-3 p-5">
          <h3 className="text-base font-semibold text-slate-800">Progress Batch</h3>
          {filteredBatches.length === 0 ? (
            <p className="text-sm text-slate-400">Tidak ada batch yang cocok.</p>
          ) : (
            filteredBatches.map((batch) => {
              const progress = stageProgress[batch.status_order] || 0;
              const stage    = stageLabel[batch.status_order] || batch.status_order;
              return (
                <div key={batch.id_batch}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 truncate max-w-[120px]" title={batch.nama_batch}>
                      {batch.nama_batch}
                    </span>
                    <span className="text-xs text-slate-500">{stage}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{progress}% selesai</p>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </section>
  );
}

function StatCard({ label, value, iconPath }) {
  return (
    <Card className="group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
        </div>
        <span className="rounded-2xl bg-pink-100 p-2.5 text-pink-600 transition group-hover:bg-pink-200">
          <Icon path={iconPath} />
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-200">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
      </div>
    </Card>
  );
}
