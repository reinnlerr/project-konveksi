import { useEffect, useState } from "react";
import { Card, EmptyState } from "../components/ui";

const API_URL = "http://localhost/project-konveksi/Backend";

const statusColor = {
  proses:  "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
};

const finishingColor = {
  Selesai: "bg-green-100 text-green-700",
  Revisi:  "bg-red-100 text-red-700",
  selesai: "bg-green-100 text-green-700",
  revisi:  "bg-red-100 text-red-700",
};

export default function ReportPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res  = await fetch(`${API_URL}/report.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === "success") setData(json.data);
      } catch (err) {
        console.error("Gagal fetch laporan");
      }
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Memuat laporan...</p>;

  if (!data.length) {
    return (
      <EmptyState
        title="Data laporan kosong"
        subtitle="Belum ada data batch yang bisa ditampilkan."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Batch"    value={data.length} color="pink" />
        <SummaryCard label="Batch Selesai"  value={data.filter(d => d.status_batch === "selesai").length} color="green" />
        <SummaryCard label="Batch Proses"   value={data.filter(d => d.status_batch === "proses").length} color="blue" />
        <SummaryCard label="Total Dikirim"  value={data.reduce((a, d) => a + (parseInt(d.total_kirim) || 0), 0) + " pcs"} color="teal" />
      </div>

      {/* Tabel Laporan */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Jenis Baju</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Cutting</th>
                <th className="px-4 py-3 font-semibold">Jahit</th>
                <th className="px-4 py-3 font-semibold">Finishing</th>
                <th className="px-4 py-3 font-semibold">Kirim</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr key={item.id_batch} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.nama_batch}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{item.customer_email || "-"}</td>
                  <td className="px-4 py-3">{item.jenis_baju || "-"}</td>
                  <td className="px-4 py-3">{item.jumlah_order ? `${item.jumlah_order} pcs` : "-"}</td>
                  <td className="px-4 py-3">{item.total_cutting ? `${item.total_cutting} pcs` : "-"}</td>
                  <td className="px-4 py-3">{item.total_jahit ? `${item.total_jahit} pcs` : "-"}</td>
                  <td className="px-4 py-3">
                    {item.status_finishing ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${finishingColor[item.status_finishing] || "bg-slate-100 text-slate-600"}`}>
                        {item.status_finishing}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">{item.total_kirim ? `${item.total_kirim} pcs` : "-"}</td>
                  <td className="px-4 py-3">{item.deadline || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[item.status_batch] || "bg-slate-100 text-slate-600"}`}>
                      {item.status_batch}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Catatan Customer */}
      {data.some(d => d.catatan) && (
        <Card className="p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">Catatan Customer</h3>
          <div className="space-y-2">
            {data.filter(d => d.catatan).map((item) => (
              <div key={item.id_batch} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">{item.nama_batch}</p>
                <p className="text-sm text-slate-500 mt-1">📝 {item.catatan}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    pink:  "bg-pink-50 text-pink-600 border-pink-200",
    green: "bg-green-50 text-green-600 border-green-200",
    blue:  "bg-blue-50 text-blue-600 border-blue-200",
    teal:  "bg-teal-50 text-teal-600 border-teal-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}