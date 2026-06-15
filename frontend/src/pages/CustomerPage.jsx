import { useEffect, useState } from "react";

const API_URL     = "http://localhost/project-konveksi/Backend";
const BACKEND_URL = "http://localhost/project-konveksi/Backend";

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

const progressStatus = ["pending","bahan","cutting","jahit","finishing","pengiriman","selesai"];

export default function CustomerPage({ user, onLogout }) {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [activePage, setActivePage]     = useState("order");
  const [finishingPhotos, setFinishingPhotos] = useState({});

  // Revisi
  const [alasanRevisi, setAlasanRevisi]       = useState({});
  const [fotoRevisi, setFotoRevisi]           = useState({});
  const [fotoPreview, setFotoPreview]         = useState({});
  const [submittingRevisi, setSubmittingRevisi] = useState(null);
  const [revisiError, setRevisiError]         = useState({});
  const [revisiSuccess, setRevisiSuccess]     = useState({});
  const [showRevisiForm, setShowRevisiForm]   = useState({});

  // Approve
  const [approvingId, setApprovingId]     = useState(null);
  const [approveSuccess, setApproveSuccess] = useState({});

  const [form, setForm] = useState({ jenis_baju: "", jumlah: "", deadline: "", catatan: "" });
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_URL}/orders.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data);
    } catch { console.error("Gagal fetch orders"); }
  };

  const fetchFinishingPhoto = async (id_batch) => {
    try {
      const res  = await fetch(`${API_URL}/finishing.php?id_batch=${id_batch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success" && data.data.length > 0 && data.data[0].foto) {
        setFinishingPhotos(prev => ({ ...prev, [id_batch]: data.data[0].foto }));
      }
    } catch { console.error("Gagal fetch finishing photo"); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    orders.forEach(order => {
      if (order.status === "finishing" && order.id_batch && !finishingPhotos[order.id_batch]) {
        fetchFinishingPhoto(order.id_batch);
      }
    });
  }, [orders]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.jenis_baju || !form.jumlah || !form.deadline) {
      setError("Semua field wajib diisi."); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess("Order berhasil dibuat!");
        setForm({ jenis_baju: "", jumlah: "", deadline: "", catatan: "" });
        fetchOrders();
      } else { setError(data.message); }
    } catch { setError("Gagal terhubung ke server."); }
    setLoading(false);
  };

  const handleApprove = async (id_order) => {
    if (!window.confirm("Yakin pesanan sudah sesuai dan siap dikirim?")) return;
    setApprovingId(id_order);
    try {
      const res  = await fetch(`${API_URL}/approve_finishing.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_order }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setApproveSuccess(prev => ({ ...prev, [id_order]: data.message }));
        fetchOrders();
      } else { alert(data.message); }
    } catch { alert("Gagal menyetujui pesanan."); }
    setApprovingId(null);
  };

  const handleFotoRevisiChange = (id_order, file) => {
    if (!file) return;
    setFotoRevisi(prev  => ({ ...prev, [id_order]: file }));
    setFotoPreview(prev => ({ ...prev, [id_order]: URL.createObjectURL(file) }));
  };

  const handleSubmitRevisi = async (id_order) => {
    const alasan = (alasanRevisi[id_order] || "").trim();
    if (!alasan) {
      setRevisiError(prev => ({ ...prev, [id_order]: "Alasan revisi wajib diisi." }));
      return;
    }
    if (!fotoRevisi[id_order]) {
      setRevisiError(prev => ({ ...prev, [id_order]: "Foto referensi wajib diupload." }));
      return;
    }

    setSubmittingRevisi(id_order);
    setRevisiError(prev => ({ ...prev, [id_order]: "" }));

    const formData = new FormData();
    formData.append("id_order", id_order);
    formData.append("alasan",   alasan);
    formData.append("foto",     fotoRevisi[id_order]);

    try {
      const res  = await fetch(`${API_URL}/revisi.php`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // NO Content-Type untuk multipart
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        setRevisiSuccess(prev => ({ ...prev, [id_order]: data.message }));
        setAlasanRevisi(prev  => ({ ...prev, [id_order]: "" }));
        setFotoRevisi(prev    => { const n = {...prev}; delete n[id_order]; return n; });
        setFotoPreview(prev   => { const n = {...prev}; delete n[id_order]; return n; });
        setShowRevisiForm(prev => ({ ...prev, [id_order]: false }));
        fetchOrders();
      } else {
        setRevisiError(prev => ({ ...prev, [id_order]: data.message }));
      }
    } catch {
      setRevisiError(prev => ({ ...prev, [id_order]: "Gagal terhubung ke server." }));
    }
    setSubmittingRevisi(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 gap-4">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Sistem Produksi</p>
          <h1 className="text-xl font-bold leading-tight mt-1">Konveksi<br />Customer</h1>
        </div>
        <button onClick={() => setActivePage("order")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
            ${activePage === "order" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >📋 Buat Order</button>
        <button onClick={() => setActivePage("status")}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
            ${activePage === "status" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >📦 Status Pesanan</button>
        <div className="mt-auto">
          <button onClick={onLogout}
            className="w-full text-sm text-gray-400 hover:text-white border border-gray-700 rounded-xl px-4 py-2 transition hover:bg-gray-800"
          >Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
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
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Baju</label>
                <input type="text" placeholder="Contoh: Kaos polos, Kemeja, dll"
                  value={form.jenis_baju} onChange={e => setForm({...form, jenis_baju: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (pcs)</label>
                <input type="number" placeholder="Contoh: 100" min="1"
                  value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea placeholder="Warna, ukuran, atau detail lainnya..."
                  value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})}
                  rows={3} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                />
              </div>
              {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}
              <button disabled={loading}
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
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      {progressStatus.map(s => <span key={s}>{statusLabel[s]}</span>)}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(progressStatus.indexOf(order.status) + 1) / progressStatus.length * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Status finishing → tampil foto + tombol approve/revisi */}
                  {order.status === "finishing" && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-orange-700">
                        🎉 Pesananmu sudah selesai diproses! Cek foto hasilnya:
                      </p>

                      {/* Foto hasil finishing dari karyawan */}
                      {finishingPhotos[order.id_batch] ? (
                        <img
                          src={`${BACKEND_URL}/${finishingPhotos[order.id_batch]}`}
                          alt="Hasil Finishing"
                          className="w-full max-w-sm rounded-xl border border-orange-200 object-cover"
                          style={{ maxHeight: 280 }}
                        />
                      ) : (
                        <div className="bg-white border border-orange-200 rounded-xl p-4 text-center text-sm text-gray-400">
                          ⏳ Memuat foto...
                        </div>
                      )}

                      {approveSuccess[order.id_order] ? (
                        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                          ✅ {approveSuccess[order.id_order]}
                        </p>
                      ) : !showRevisiForm[order.id_order] ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(order.id_order)}
                            disabled={approvingId === order.id_order}
                            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 transition"
                          >
                            {approvingId === order.id_order ? "Memproses..." : "✅ Setuju, Kirim Pesanan"}
                          </button>
                          <button
                            onClick={() => setShowRevisiForm(prev => ({ ...prev, [order.id_order]: true }))}
                            className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 px-4 py-2 text-sm font-semibold text-white hover:from-orange-500 hover:to-red-500 transition"
                          >
                            🔄 Minta Revisi
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-orange-700">Ajukan Permintaan Revisi</p>
                          <p className="text-xs text-orange-500">
                            Jelaskan perubahan yang diinginkan & upload foto referensi. Pesanan akan kembali ke proses jahit.
                          </p>

                          <textarea
                            placeholder="Contoh: Tolong ubah warna menjadi hitam, ukuran M saja..."
                            value={alasanRevisi[order.id_order] || ""}
                            onChange={e => setAlasanRevisi(prev => ({ ...prev, [order.id_order]: e.target.value }))}
                            rows={3}
                            className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none bg-white"
                          />

                          <div>
                            <label className="block text-sm font-medium text-orange-700 mb-1">
                              📸 Foto Referensi <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={e => handleFotoRevisiChange(order.id_order, e.target.files[0])}
                              className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-600 file:font-medium hover:file:bg-orange-200 cursor-pointer"
                            />
                            {fotoPreview[order.id_order] && (
                              <img
                                src={fotoPreview[order.id_order]}
                                alt="Preview Revisi"
                                className="mt-2 rounded-xl border border-orange-200 object-cover"
                                style={{ maxHeight: 150, maxWidth: "100%" }}
                              />
                            )}
                          </div>

                          {revisiError[order.id_order] && (
                            <p className="text-xs text-red-600">{revisiError[order.id_order]}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitRevisi(order.id_order)}
                              disabled={submittingRevisi === order.id_order}
                              className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-60 transition"
                            >
                              {submittingRevisi === order.id_order ? "Mengirim..." : "📨 Kirim Revisi"}
                            </button>
                            <button
                              onClick={() => {
                                setShowRevisiForm(prev => ({ ...prev, [order.id_order]: false }));
                                setRevisiError(prev => ({ ...prev, [order.id_order]: "" }));
                              }}
                              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}