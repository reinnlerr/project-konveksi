import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function Finishing() {
  const [history, setHistory]           = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=finishing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch { console.error("Gagal fetch history finishing"); }
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=finishing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setTasks(data.data);
    } catch { console.error("Gagal fetch tugas finishing"); }
  };

  useEffect(() => { fetchHistory(); fetchTasks(); }, []);

  const handleQuickProcess = async (task) => {
    setProcessingId(task.id_batch);
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API_URL}/finishing.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_batch:     task.id_batch,
          jumlah_hasil: task.jumlah,
          status:       "Selesai",
          id_user:      user?.id_user,
          tanggal:      today,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_batch: task.id_batch, new_status: "finishing" }),
        });
        fetchHistory();
        fetchTasks();
      }
    } catch { console.error("Quick process finishing gagal"); }
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">

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
              <div key={task.id_batch} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-pink-300 hover:bg-pink-50/20 transition">
                <div>
                  <p className="font-semibold text-slate-800">{task.nama_batch}</p>
                  <p className="text-sm text-slate-600">{task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span></p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>}
                </div>
                <button
                  onClick={() => handleQuickProcess(task)}
                  disabled={processingId === task.id_batch}
                  className="ml-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 transition whitespace-nowrap"
                >
                  {processingId === task.id_batch ? "Memproses..." : "✅ Selesai"}
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