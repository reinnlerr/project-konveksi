import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function Pengiriman({ batchOptions, onSubmit, canEdit }) {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=pengiriman`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch (err) {
      console.error("Gagal fetch history pengiriman");
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data pengiriman berhasil disimpan.");
    fetchHistory();
  };

  return (
    <div className="space-y-4">
      <FormPage
        fields={[
          { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
          { label: "Jumlah Kirim", name: "jumlah", type: "number", placeholder: "0" },
          { label: "Tanggal Kirim", name: "tanggal", type: "date" }
        ]}
        submitText="Simpan Pengiriman"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

      {/* History */}
      <div className="card p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-800">Riwayat Pengiriman</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data pengiriman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Batch</th>
                  <th className="py-2 pr-4 font-semibold">Jenis Baju</th>
                  <th className="py-2 pr-4 font-semibold">Jumlah Kirim</th>
                  <th className="py-2 pr-4 font-semibold">Tanggal</th>
                  <th className="py-2 font-semibold">Catatan Customer</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id_pengiriman} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4">{row.nama_batch}</td>
                    <td className="py-2 pr-4">{row.jenis_baju || "-"}</td>
                    <td className="py-2 pr-4">{row.jumlah_kirim} pcs</td>
                    <td className="py-2 pr-4">{row.tanggal_kirim}</td>
                    <td className="py-2 text-slate-400 text-xs">{row.deskripsi_customer || "-"}</td>
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