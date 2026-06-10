import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function Cutting({ batchOptions, onSubmit, canEdit }) {
  const [history, setHistory]           = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=cutting`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch { console.error("Gagal fetch history cutting"); }
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=cutting`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setTasks(data.data);
    } catch { console.error("Gagal fetch tugas cutting"); }
  };

  useEffect(() => { fetchHistory(); fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data cutting berhasil disimpan.");
    fetchHistory();
    fetchTasks();
  };

  const handleQuickProcess = async (task) => {
    setProcessingId(task.id_batch);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`${API_URL}/cutting.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_batch:     task.id_batch,
          jumlah_hasil: task.jumlah,
          id_user:      user?.id_user,
          tanggal:      today,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_batch: task.id_batch, new_status: "jahit" }), // ← fix: cutting → jahit
        });
        fetchHistory();
        fetchTasks();
      }
    } catch { console.error("Quick process cutting gagal"); }
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
                  className="ml-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 transition whitespace-nowrap"
                >
                  {processingId === task.id_batch ? "Memproses..." : "✅ Proses"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <FormPage
        fields={[
          { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
          { label: "Jumlah Hasil Cutting", name: "hasil", type: "number", placeholder: "0" },
        ]}
        submitText="Simpan Cutting"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

      <div className="card p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-800">Riwayat Cutting</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data cutting.</p>
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
                  <tr key={row.id_cutting} className="border-b border-slate-100 hover:bg-slate-50">
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