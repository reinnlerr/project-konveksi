import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi/Backend";

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

export default function Finishing() {
  const [history, setHistory]           = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [fotoFile, setFotoFile]         = useState({});
  const [fotoPreview, setFotoPreview]   = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=finishing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch { /* silent */ }
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=finishing`, {
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

  const handleFotoChange = (id_batch, file) => {
    if (!file) return;
    setFotoFile(prev => ({ ...prev, [id_batch]: file }));
    setFotoPreview(prev => ({ ...prev, [id_batch]: URL.createObjectURL(file) }));
  };

  const handleQuickProcess = async (task) => {
    if (!fotoFile[task.id_batch]) {
      alert("Upload foto hasil finishing dulu!");
      return;
    }

    setProcessingId(task.id_batch);
    const today = new Date().toISOString().split("T")[0];

    // Pakai FormData karena ada file upload
    const formData = new FormData();
    formData.append("id_batch",     task.id_batch);
    formData.append("jumlah_hasil", task.jumlah);
    formData.append("id_user",      user?.id_user);
    formData.append("tanggal",      today);
    formData.append("foto",         fotoFile[task.id_batch]);

    try {
      const res = await fetch(`${API_URL}/finishing.php`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // jangan set Content-Type, biar browser auto-set boundary
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_batch: task.id_batch, new_status: "finishing" }),
        });
        setFotoFile(prev  => { const n = {...prev};  delete n[task.id_batch]; return n; });
        setFotoPreview(prev => { const n = {...prev}; delete n[task.id_batch]; return n; });
        fetchHistory();
        fetchTasks();
      } else {
        alert("Gagal: " + data.message);
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
                  <p className="text-sm text-slate-600">{task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span></p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>}
                </div>

                {/* Upload Foto Hasil */}
                <div className="mb-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    📸 Foto Hasil Finishing <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => handleFotoChange(task.id_batch, e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-pink-50 file:text-pink-600 file:font-medium hover:file:bg-pink-100 cursor-pointer"
                  />
                  {fotoPreview[task.id_batch] && (
                    <img
                      src={fotoPreview[task.id_batch]}
                      alt="Preview"
                      className="mt-2 rounded-xl border border-slate-200 object-cover"
                      style={{ maxHeight: 200, maxWidth: "100%" }}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleQuickProcess(task)}
                  disabled={processingId === task.id_batch || !fotoFile[task.id_batch]}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 transition"
                >
                  {processingId === task.id_batch ? "Mengirim..." : "✅ Selesai & Kirim ke Customer"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat */}
      <div className="card p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-800">Riwayat Finishing</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data finishing.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Batch</th>
                  <th className="py-2 pr-4 font-semibold">Jumlah</th>
                  <th className="py-2 pr-4 font-semibold">Tanggal</th>
                  <th className="py-2 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id_finishing} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4">{row.nama_batch}</td>
                    <td className="py-2 pr-4">{row.jumlah_hasil} pcs</td>
                    <td className="py-2 pr-4">{row.tanggal}</td>
                    <td className="py-2 text-slate-400 text-xs">{row.nama_user}</td>
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
