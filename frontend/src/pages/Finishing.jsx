import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function Finishing({ batchOptions, onSubmit, canEdit }) {
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

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data finishing berhasil disimpan.");
    fetchHistory();
    fetchTasks();
  };

  const handleQuickProcess = async (task, status) => {
    setProcessingId(`${task.id_batch}-${status}`);
    const today = new Date().toISOString().split("T")[0];
    const newOrderStatus = status === "Selesai" ? "pengiriman" : "jahit";

    try {
      const res = await fetch(`${API_URL}/finishing.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_batch:     task.id_batch,
          jumlah_hasil: task.jumlah,
          status:       status,
          id_user:      user?.id_user,
          tanggal:      today,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_batch: task.id_batch, new_status: newOrderStatus }),
        });
        fetchHistory();
        fetchTasks();
      }
    } catch { console.error("Quick process finishing gagal"); }
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {tasks.length > 0 && (
        <div className="card p-5 border-l-4 border-pink-500">
          <h3 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
            ⚡ Tugas Aktif
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600 font-medium">{tasks.length} order</span>
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id_batch} className="rounded-xl border border-slate-200 p-4 hover:border-pink-300 transition">
                <div className="mb-3">
                  <p className="font-semibold text-slate-800">{task.nama_batch}</p>
                  <p className="text-sm text-slate-600">{task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span></p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickProcess(task, "Selesai")}
                    disabled={!!processingId}
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 transition"
                  >
                    {processingId === `${task.id_batch}-Selesai` ? "Memproses..." : "✅ Selesai"}
                  </button>
                  <button
                    onClick={() => handleQuickProcess(task, "Revisi")}
                    disabled={!!processingId}
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 px-3 py-2 text-sm font-semibold text-white hover:from-orange-500 hover:to-red-500 disabled:opacity-60 transition"
                  >
                    {processingId === `${task.id_batch}-Revisi` ? "Memproses..." : "🔄 Revisi"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FormPage
        fields={[
          { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
          { label: "Jumlah Hasil", name: "hasil", type: "number", placeholder: "0" },
          { label: "Status", name: "status", type: "select", options: ["Selesai", "Revisi"] },
        ]}
        submitText="Simpan Finishing"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

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
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Tanggal</th>
                  <th className="py-2 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id_finishing} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4">{row.nama_batch}</td>
                    <td className="py-2 pr-4">{row.jumlah_hasil} pcs</td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.status?.toLowerCase() === "revisi" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {row.status || "-"}
                      </span>
                    </td>
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