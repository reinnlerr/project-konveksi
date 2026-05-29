import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function Cutting({ batchOptions, onSubmit, canEdit }) {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=cutting`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch (err) {
      console.error("Gagal fetch history cutting");
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data cutting berhasil disimpan.");
    fetchHistory();
  };

  return (
    <div className="space-y-4">
      <FormPage
        fields={[
          { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
          { label: "Jumlah Hasil Cutting", name: "hasil", type: "number", placeholder: "0" }
        ]}
        submitText="Simpan Cutting"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

      {/* History */}
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