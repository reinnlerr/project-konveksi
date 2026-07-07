import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";

function RefreshBar({ onRefresh, isRefreshing, lastRefresh }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs text-slate-500">Live</span>
        {lastRefresh && (
          <span className="text-xs text-slate-400">
            · {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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

export default function BahanMasuk({ canEdit }) {
  const [history, setHistory]           = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [namaBahan, setNamaBahan]       = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=bahan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch { /* silent */ }
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=bahan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setTasks(data.data);
    } catch { /* silent */ }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchHistory(), fetchTasks()]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => { handleRefresh(); }, []);

  const handleQuickProcess = async (task) => {
    const nama = (namaBahan[task.id_batch] || "").trim();
    if (!nama) { alert("Masukkan nama bahan dulu!"); return; }

    setProcessingId(task.id_batch);
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API_URL}/bahan_masuk.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_batch:   task.id_batch,
          nama_bahan: nama,
          jumlah:     task.jumlah,
          tanggal:    today,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_batch: task.id_batch, new_status: "cutting" }),
        });
        fetchHistory();
        fetchTasks();
        setNamaBahan(prev => ({ ...prev, [task.id_batch]: "" }));
      } else {
        alert("Gagal simpan: " + data.message);
      }
    } catch { /* silent */ }
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      <RefreshBar onRefresh={handleRefresh} isRefreshing={isRefreshing} lastRefresh={lastRefresh} />

      {/* Tugas Aktif */}
      <div className="card p-5 border-l-4 border-pink-500">
        <h3 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
          ⚡ Tugas Aktif
          {tasks.length > 0 && (
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600 font-medium">
              {tasks.length} order
            </span>
          )}
        </h3>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-400">Tidak ada tugas aktif saat ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id_batch} className="rounded-xl border border-slate-200 p-4 hover:border-pink-300 transition">
                <div className="mb-3">
                  <p className="font-semibold text-slate-800">{task.nama_batch}</p>
                  <p className="text-sm text-slate-600">
                    {task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span>
                  </p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && (
                    <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama bahan (misal: Cotton Combed 24s)"
                    value={namaBahan[task.id_batch] || ""}
                    onChange={e => setNamaBahan(prev => ({ ...prev, [task.id_batch]: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                  <button
                    onClick={() => handleQuickProcess(task)}
                    disabled={processingId === task.id_batch}
                    className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 transition whitespace-nowrap"
                  >
                    {processingId === task.id_batch ? "Menyimpan..." : "✅ Simpan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat */}
      <div className="card p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-800">Riwayat Bahan Masuk</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data bahan masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Batch</th>
                  <th className="py-2 pr-4 font-semibold">Nama Bahan</th>
                  <th className="py-2 pr-4 font-semibold">Jumlah</th>
                  <th className="py-2 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id_bahan} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4">{row.nama_batch}</td>
                    <td className="py-2 pr-4">{row.nama_bahan}</td>
                    <td className="py-2 pr-4">{row.jumlah} pcs</td>
                    <td className="py-2">{row.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
