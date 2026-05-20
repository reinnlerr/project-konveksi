import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function PesananMasuk() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Ambil semua data pesanan
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Gagal fetch pesanan");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fungsi saat admin klik Approve
  const handleApprove = async (id_order) => {
    if (!window.confirm("Yakin ingin proses pesanan ini ke tahap Bahan? Sistem akan otomatis membuat Batch baru.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/approve_order.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_order }),
      });
      const data = await res.json();
      
      if (data.status === "success") {
        alert("✅ " + data.message);
        fetchOrders(); // Refresh tabel setelah sukses
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("❌ Gagal terhubung ke server.");
    }
    setLoading(false);
  };

  return (
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
                      o.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {o.status.toUpperCase()}
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
                        Di-approve (Batch #{o.id_batch})
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
  );
}