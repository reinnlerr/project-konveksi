import { useEffect, useState } from "react";

const API_URL = "http://localhost/project-konveksi/Backend";

const statusColor = {
  pending:    "bg-yellow-100 text-yellow-700",
  bahan:      "bg-blue-100 text-blue-700",
  cutting:    "bg-purple-100 text-purple-700",
  jahit:      "bg-pink-100 text-pink-700",
  finishing:  "bg-orange-100 text-orange-700",
  pengiriman: "bg-teal-100 text-teal-700",
  selesai:    "bg-green-100 text-green-700",
};

const statusLabel = {
  pending:    "Menunggu",
  bahan:      "Bahan Masuk",
  cutting:    "Cutting",
  jahit:      "Jahit",
  finishing:  "Finishing",
  pengiriman: "Pengiriman",
  selesai:    "Selesai",
};

export default function CustomerPage({ user, onLogout }) {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [activePage, setActivePage] = useState("order");

  const [form, setForm] = useState({
    jenis_baju: "",
    jumlah: "",
    deadline: "",
    catatan: "",
  });

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_URL}/orders.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data);
    } catch {
      console.error("Gagal fetch orders");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.jenis_baju || !form.jumlah || !form.deadline) {
      setError("Semua field wajib diisi.");
      return;
    }

    loading(true);
    try {
      // Selesai diperbaiki: di bawah ini sudah diganti menjadi orders.php
      const res  = await fetch(`${API_URL}/orders.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess("Order berhasil dibuat!");
        setForm({ jenis_baju: "", jumlah: "", deadline: "", catatan: "" });
        fetchOrders();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 gap-4">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Sistem Produksi</p>
          <h1 className="text-xl font-bold leading-tight mt-1">Konveksi<br />Customer</h1>
        </div>

        <button
          onClick={() => setActivePage("order")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
            ${activePage === "order" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          📋 Buat Order
        </button>

        <button
          onClick={() => setActivePage("status")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
            ${activePage === "status" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          📦 Status Pesanan
        </button>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full text-sm text-gray-400 hover:text-white border border-gray-700 rounded-xl px-4 py-2 transition hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activePage === "order" ? "Buat Order" : "Status Pesanan"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activePage === "order" ? "Pesan produksi baju konveksi" : "Pantau status pesananmu"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() ?? "C"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.email ?? "Customer"}</p>
              <p className="text-xs text-gray-400">Customer</p>
            </div>
          </div>
        </div>

        {/* Form Order */}
        {activePage === "order" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Form Pesanan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Baju</label>
                <input
                  type="text"
                  placeholder="Contoh: Kaos polos, Kemeja, dll"
                  value={form.jenis_baju}
                  onChange={e => setForm({...form, jenis_baju: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (pcs)</label>
                <input
                  type="number"
                  placeholder="Contoh: 100"
                  min="1"
                  value={form.jumlah}
                  onChange={e => setForm({...form, jumlah: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  placeholder="Warna, ukuran, atau detail lainnya..."
                  value={form.catatan}
                  onChange={e => setForm({...form, catatan: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}

              <button
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-60"
              >
                {loading ? "Mengirim..." : "Buat Order"}
              </button>
            </form>
          </div>
        )}

        {/* Status Pesanan */}
        {activePage === "status" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                Belum ada pesanan. Buat order dulu!
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id_order} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{order.jenis_baju}</p>
                      <p className="text-sm text-gray-500 mt-1">{order.jumlah} pcs · Deadline: {order.deadline}</p>
                      {order.catatan && <p className="text-sm text-gray-400 mt-1">📝 {order.catatan}</p>}
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  {/* Progress bar status */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      {Object.values(statusLabel).map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(Object.keys(statusLabel).indexOf(order.status) + 1) / Object.keys(statusLabel).length * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}