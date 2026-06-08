import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function BahanMasuk({ onSubmit, canEdit }) {
  const [dynamicBatches, setDynamicBatches] = useState([]);
  const [history, setHistory]               = useState([]);
  const [tasks, setTasks]                   = useState([]);
  const [processingId, setProcessingId]     = useState(null);
  const [namaBahan, setNamaBahan]           = useState({});
  const token = localStorage.getItem("token");

  const fetchBatches = async () => {
    try {
      const response = await fetch(`${API_URL}/bahan_masuk.php?get_batches=true`);
      const result = await response.json();
      if (result.status === "success") {
        setDynamicBatches(result.data.map((item) => ({
          value: item.id_batch,
          label: item.nama_batch,
        })));
      }
    } catch { console.error("Gagal memuat list batch"); }
  };

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=bahan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch { console.error("Gagal fetch history bahan masuk"); }
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=bahan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setTasks(data.data);
    } catch { console.error("Gagal fetch tugas bahan"); }
  };

  useEffect(() => { fetchBatches(); fetchHistory(); fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data bahan masuk tersimpan.");
    fetchBatches();
    fetchHistory();
    fetchTasks();
  };

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
        fetchBatches();
        fetchHistory();
        fetchTasks();
        setNamaBahan(prev => ({ ...prev, [task.id_batch]: "" }));
      }
    } catch { console.error("Quick process bahan gagal"); }
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">

      {/* ── Tugas Aktif ── */}
      {tasks.length > 0 && (
        <div className="card p-5 border-l-4 border-pink-500">
          <h3 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
            ⚡ Tugas Aktif
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600 font-medium">
              {tasks.length} order
            </span>
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id_batch} className="rounded-xl border border-slate-200 p-4 hover:border-pink-300 transition">
                <div className="mb-3">
                  <p className="font-semibold text-slate-800">{task.nama_batch}</p>
                  <p className="text-sm text-slate-600">
                    {task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span>
                  </p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>}
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
        </div>
      )}

      <FormPage
        fields={[
          { label: "Nama Bahan", name: "nama_bahan", type: "text", placeholder: "Cotton Combed 24s" },
          { label: "Jumlah", name: "jumlah", type: "number", placeholder: "0" },
          { label: "Tanggal", name: "tanggal", type: "date" },
          { label: "Pilih Batch", name: "id_batch", type: "select", options: dynamicBatches },
        ]}
        submitText="Simpan Bahan"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

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