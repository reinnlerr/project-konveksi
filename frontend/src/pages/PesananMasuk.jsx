import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function PesananMasuk() {
  const [orders, setOrders]       = useState([]);
  const [revisi, setRevisi]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState("pesanan");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_URL}/orders.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data);
    } catch { console.error("Gagal fetch pesanan"); }
  };

  const fetchRevisi = async () => {
    try {
      const res  = await fetch(`${API_URL}/revisi.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setRevisi(data.data);
    } catch { console.error("Gagal fetch riwayat revisi"); }
  };

  useEffect(() => {
    fetchOrders();
    fetchRevisi();
  }, []);

  const handleApprove = async (id_order) => {
    if (!window.confirm("Yakin ingin proses pesanan ini ke tahap Bahan? Sistem akan otomatis membuat Batch baru.")) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/approve_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_order }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("✅ " + data.message);
        fetchOrders();
      } else {
        alert("❌ " + data.message);
      }
    } catch { alert("❌ Gagal terhubung ke server."); }
    setLoading(false);
  };

  const revisiCount = revisi.length;

  return (
    <div className="space-y-4">

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("pesanan")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "pesanan"
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          📋 Pesanan Masuk
        </button>
        <button
          onClick={() => setActiveTab("revisi")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "revisi"
              ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          🔄 Riwayat Revisi
          {revisiCount > 0 && (
            <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
              activeTab === "revisi" ? "bg-white text-red-500" : "bg-red-500 text-white"
            }`}>
              {revisiCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Pesanan Masuk */}
      {activeTab === "pesanan" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">ID Order</th>
                  <th className="p-4 font-semibold">Jenis Baju</th>
                  <th className="p-4 font-semibold">Jumlah</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">Belum ada pesanan masuk dari customer.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id_order} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">#{o.id_order}</td>
                      <td className="p-4">{o.jenis_baju}</td>
                      <td className="p-4">{o.jumlah} pcs</td>
                      <td className="p-4">{o.deadline}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          o.status === "pending"         ? "bg-yellow-100 text-yellow-700" :
                          o.status === "menunggu_revisi" ? "bg-red-100 text-red-700"       :
                          o.status === "selesai"         ? "bg-green-100 text-green-700"   :
                                                           "bg-blue-100 text-blue-700"
                        }`}>
                          {o.status === "menunggu_revisi" ? "Menunggu Revisi" : o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {o.status === "pending" ? (
                          <button
                            onClick={() => handleApprove(o.id_order)}
                            disabled={loading}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-60"
                          >
                            {loading ? "Memproses..." : "Proses ke Bahan"}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm italic">
                            {o.id_batch ? `Batch #${o.id_batch}` : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Riwayat Revisi */}
      {activeTab === "revisi" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {revisi.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Belum ada riwayat revisi.
            </div>
          ) : (
            <div className="space-y-4">
              {revisi.map((r) => (
                <div key={r.id_revisi} className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        Order #{r.id_order} — {r.jenis_baju}
                      </p>
                      <p className="text-sm text-slate-500">
                        Batch: <span className="font-medium">{r.nama_batch}</span> · Customer: <span className="font-medium">{r.email_customer}</span>
                      </p>
                      <div className="mt-2 bg-white border border-red-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Alasan Revisi:</p>
                        <p className="text-sm text-slate-700">{r.alasan}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "jahit"    ? "bg-pink-100 text-pink-700"   :
                        r.status === "selesai"  ? "bg-green-100 text-green-700" :
                                                  "bg-slate-100 text-slate-600"
                      }`}>
                        {r.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{r.created_at?.split(" ")[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}