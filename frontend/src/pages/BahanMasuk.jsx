import { useEffect, useState } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function BahanMasuk({ onSubmit, canEdit }) {
  const [dynamicBatches, setDynamicBatches] = useState([]);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  const fetchBatches = async () => {
    try {
      const response = await fetch(`${API_URL}/bahan_masuk.php?get_batches=true`);
      const result = await response.json();
      if (result.status === "success") {
        setDynamicBatches(result.data.map((item) => ({
          value: item.id_batch,
          label: item.nama_batch
        })));
      }
    } catch (error) {
      console.error("Gagal memuat list batch:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=bahan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch (err) {
      console.error("Gagal fetch history bahan masuk");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    await onSubmit(e, "Data bahan masuk tersimpan.");
    fetchBatches();
    fetchHistory();
  };

  return (
    <div className="space-y-4">
      <FormPage
        fields={[
          { label: "Nama Bahan", name: "nama_bahan", type: "text", placeholder: "Cotton Combed 24s" },
          { label: "Jumlah", name: "jumlah", type: "number", placeholder: "0" },
          { label: "Tanggal", name: "tanggal", type: "date" },
          { label: "Pilih Batch", name: "id_batch", type: "select", options: dynamicBatches }
        ]}
        submitText="Simpan Bahan"
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

      {/* History */}
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