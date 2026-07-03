import { useEffect, useState } from "react";

const API_URL     = "http://localhost/project-konveksi/Backend";
const BACKEND_URL = "http://localhost/project-konveksi/Backend";

const statusColor = {
  pending:             "bg-yellow-100 text-yellow-700",
  bahan:               "bg-blue-100 text-blue-700",
  cutting:             "bg-purple-100 text-purple-700",
  jahit:               "bg-pink-100 text-pink-700",
  finishing:           "bg-orange-100 text-orange-700",
  menunggu_pembayaran: "bg-red-100 text-red-700",
  menunggu_konfirmasi: "bg-amber-100 text-amber-700",
  pengiriman:          "bg-teal-100 text-teal-700",
  selesai:             "bg-green-100 text-green-700",
};

const statusLabel = {
  pending:             "Menunggu",
  bahan:               "Bahan Masuk",
  cutting:             "Cutting",
  jahit:               "Jahit",
  finishing:           "Finishing",
  menunggu_pembayaran: "Tagihan",
  pengiriman:          "Pengiriman",
  selesai:             "Selesai",
};

const progressStatus = ["pending","bahan","cutting","jahit","finishing","menunggu_pembayaran","pengiriman","selesai"];

const fmt = (n) => n ? `Rp ${parseInt(n).toLocaleString('id-ID')}` : '-';
const nomorNota = (id, tgl) => {
  const d = new Date(tgl);
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(id).padStart(4,'0')}`;
};

export default function CustomerPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState("order");
  const [orders, setOrders]         = useState([]);
  const [payments, setPayments]     = useState({}); // {id_order: pembayaran}
  const [finishingPhotos, setFinishingPhotos] = useState({});
  const [nota, setNota]             = useState({}); // {id_order: nota}
  const [showNota, setShowNota]     = useState(null);

  // Order form
  const [form, setForm]       = useState({ jenis_baju:"", jumlah:"", deadline:"", catatan:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Revisi
  const [alasanRevisi, setAlasanRevisi]             = useState({});
  const [fotoRevisi, setFotoRevisi]                 = useState({});
  const [fotoPreview, setFotoPreview]               = useState({});
  const [submittingRevisi, setSubmittingRevisi]     = useState(null);
  const [revisiError, setRevisiError]               = useState({});
  const [revisiSuccess, setRevisiSuccess]           = useState({});
  const [showRevisiForm, setShowRevisiForm]         = useState({});
  const [approvingId, setApprovingId]               = useState(null);
  const [approveSuccess, setApproveSuccess]         = useState({});

  // Bukti transfer
  const [buktiBayar, setBuktiBayar]     = useState({});
  const [buktiPreview2, setBuktiPreview2] = useState({});
  const [uploadingBukti, setUploadingBukti] = useState(null);
  const [buktiError, setBuktiError]     = useState({});
  const [buktiSuccess, setBuktiSuccess] = useState({});

  // Profile
  const [profile, setProfile]           = useState({ nama:"", no_hp:"", alamat:"" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError]   = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_URL}/orders.php`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data);
    } catch { console.error("Gagal fetch orders"); }
  };

  const fetchPayments = async () => {
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") {
        const map = {};
        data.data.forEach(p => { map[p.id_order] = p; });
        setPayments(map);
      }
    } catch { console.error("Gagal fetch payments"); }
  };

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API_URL}/profile.php`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setProfile({ nama: data.data.nama||"", no_hp: data.data.no_hp||"", alamat: data.data.alamat||"" });
      }
    } catch { console.error("Gagal fetch profile"); }
  };

  const fetchFinishingPhoto = async (id_batch) => {
    try {
      const res  = await fetch(`${API_URL}/finishing.php?id_batch=${id_batch}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success" && data.data.length > 0 && data.data[0].foto)
        setFinishingPhotos(prev => ({ ...prev, [id_batch]: data.data[0].foto }));
    } catch {}
  };

  const fetchNota = async (id_order) => {
    try {
      const res  = await fetch(`${API_URL}/nota.php?id_order=${id_order}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") { setNota(prev => ({ ...prev, [id_order]: data.data })); setShowNota(id_order); }
    } catch {}
  };

  useEffect(() => { fetchOrders(); fetchPayments(); fetchProfile(); }, []);
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === "finishing" && order.id_batch && !finishingPhotos[order.id_batch])
        fetchFinishingPhoto(order.id_batch);
    });
  }, [orders]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.jenis_baju || !form.jumlah || !form.deadline) { setError("Semua field wajib diisi."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/orders.php`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify(form) });
      const data = await res.json();
      if (data.status === "success") { setSuccess("Order berhasil dibuat!"); setForm({jenis_baju:"",jumlah:"",deadline:"",catatan:""}); fetchOrders(); }
      else setError(data.message);
    } catch { setError("Gagal terhubung ke server."); }
    setLoading(false);
  };

  const handleApprove = async (id_order) => {
    if (!window.confirm("Yakin pesanan sudah sesuai?")) return;
    setApprovingId(id_order);
    try {
      const res  = await fetch(`${API_URL}/approve_finishing.php`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({id_order}) });
      const data = await res.json();
      if (data.status === "success") { setApproveSuccess(prev=>({...prev,[id_order]:data.message})); fetchOrders(); fetchPayments(); }
      else alert(data.message);
    } catch { alert("Gagal."); }
    setApprovingId(null);
  };

  const handleFotoRevisiChange = (id_order, file) => {
    if (!file) return;
    setFotoRevisi(prev=>({...prev,[id_order]:file}));
    setFotoPreview(prev=>({...prev,[id_order]:URL.createObjectURL(file)}));
  };

  const handleSubmitRevisi = async (id_order) => {
    const alasan = (alasanRevisi[id_order]||"").trim();
    if (!alasan) { setRevisiError(prev=>({...prev,[id_order]:"Alasan wajib diisi."})); return; }
    if (!fotoRevisi[id_order]) { setRevisiError(prev=>({...prev,[id_order]:"Foto referensi wajib diupload."})); return; }
    setSubmittingRevisi(id_order); setRevisiError(prev=>({...prev,[id_order]:""}));
    const fd = new FormData(); fd.append("id_order",id_order); fd.append("alasan",alasan); fd.append("foto",fotoRevisi[id_order]);
    try {
      const res  = await fetch(`${API_URL}/revisi.php`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd });
      const data = await res.json();
      if (data.status === "success") {
        setRevisiSuccess(prev=>({...prev,[id_order]:data.message}));
        setAlasanRevisi(prev=>({...prev,[id_order]:""}));
        setFotoRevisi(prev=>{const n={...prev};delete n[id_order];return n;});
        setFotoPreview(prev=>{const n={...prev};delete n[id_order];return n;});
        setShowRevisiForm(prev=>({...prev,[id_order]:false}));
        fetchOrders();
      } else setRevisiError(prev=>({...prev,[id_order]:data.message}));
    } catch { setRevisiError(prev=>({...prev,[id_order]:"Gagal terhubung."})); }
    setSubmittingRevisi(null);
  };

  const handleBuktiBayarChange = (id_pembayaran, file) => {
    if (!file) return;
    setBuktiBayar(prev=>({...prev,[id_pembayaran]:file}));
    setBuktiPreview2(prev=>({...prev,[id_pembayaran]:URL.createObjectURL(file)}));
  };

  const handleUploadBukti = async (id_pembayaran) => {
    if (!buktiBayar[id_pembayaran]) { setBuktiError(prev=>({...prev,[id_pembayaran]:"Pilih file dulu!"})); return; }
    setUploadingBukti(id_pembayaran); setBuktiError(prev=>({...prev,[id_pembayaran]:""}));
    const fd = new FormData(); fd.append("id_pembayaran",id_pembayaran); fd.append("bukti",buktiBayar[id_pembayaran]);
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php?action=upload_bukti`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd });
      const data = await res.json();
      if (data.status === "success") {
        setBuktiSuccess(prev=>({...prev,[id_pembayaran]:data.message}));
        fetchOrders(); fetchPayments();
      } else setBuktiError(prev=>({...prev,[id_pembayaran]:data.message}));
    } catch { setBuktiError(prev=>({...prev,[id_pembayaran]:"Gagal terhubung."})); }
    setUploadingBukti(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setProfileError(""); setProfileSuccess("");
    if (!profile.nama || !profile.no_hp || !profile.alamat) { setProfileError("Semua field wajib diisi."); return; }
    setProfileLoading(true);
    try {
      const res  = await fetch(`${API_URL}/profile.php`, { method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify(profile) });
      const data = await res.json();
      if (data.status === "success") setProfileSuccess(data.message);
      else setProfileError(data.message);
    } catch { setProfileError("Gagal terhubung."); }
    setProfileLoading(false);
  };

  const handlePrintNota = (data) => {
    const noNota = nomorNota(data.id_order, data.tanggal_order);
    const w = window.open('','_blank');
    w.document.write(`
      <html><head><title>Nota ${noNota}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;max-width:400px;margin:0 auto}
        h1{text-align:center;font-size:18px}
        .sub{text-align:center;color:#666;font-size:12px;margin-top:4px}
        .divider{border-top:1px dashed #999;margin:12px 0}
        .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
        .label{color:#666}.bold{font-weight:bold;font-size:15px}
        .total{background:#f9f9f9;padding:8px;border-radius:4px;margin-top:8px}
      </style></head><body>
      <h1>SIM Konveksi</h1>
      <p class="sub">NOTA PEMBAYARAN</p>
      <p class="sub">${noNota}</p>
      <div class="divider"></div>
      <div class="row"><span class="label">Tanggal Order</span><span>${data.tanggal_order?.split(' ')[0]||'-'}</span></div>
      <div class="row"><span class="label">Nama Customer</span><span>${data.nama_customer||data.email_customer}</span></div>
      <div class="row"><span class="label">No HP</span><span>${data.no_hp||'-'}</span></div>
      <div class="row"><span class="label">Alamat</span><span style="max-width:200px;text-align:right">${data.alamat||'-'}</span></div>
      <div class="divider"></div>
      <div class="row"><span class="label">Jenis Baju</span><span>${data.jenis_baju}</span></div>
      <div class="row"><span class="label">Jumlah</span><span>${data.jumlah} pcs</span></div>
      <div class="row"><span class="label">Harga Satuan</span><span>${fmt(data.harga_satuan)}</span></div>
      <div class="total">
        <div class="row"><span class="label">Total Harga</span><span class="bold">${fmt(data.total_harga)}</span></div>
        <div class="row"><span class="label">Status Bayar</span><span style="color:green;font-weight:bold">${data.status_bayar==='lunas'?'LUNAS':'Belum Lunas'}</span></div>
      </div>
      ${data.catatan ? `<div class="divider"></div><div class="row"><span class="label">Catatan</span><span>${data.catatan}</span></div>` : ''}
      <div class="divider"></div>
      <p style="text-align:center;font-size:11px;color:#999">Terima kasih telah berbelanja!</p>
      </body></html>
    `);
    w.document.close();
    setTimeout(()=>{w.print();w.close();},500);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 gap-4">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Sistem Produksi</p>
          <h1 className="text-xl font-bold leading-tight mt-1">Konveksi<br/>Customer</h1>
        </div>
        {[
          { key:"order",  icon:"📋", label:"Buat Order" },
          { key:"status", icon:"📦", label:"Status Pesanan" },
          { key:"profil", icon:"👤", label:"Profil Saya" },
        ].map(item => (
          <button key={item.key} onClick={()=>setActivePage(item.key)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
              ${activePage===item.key?"bg-pink-500 text-white":"text-gray-400 hover:text-white hover:bg-gray-800"}`}
          >{item.icon} {item.label}</button>
        ))}
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full text-sm text-gray-400 hover:text-white border border-gray-700 rounded-xl px-4 py-2 transition hover:bg-gray-800">
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
              {activePage==="order"?"Buat Order":activePage==="status"?"Status Pesanan":"Profil Saya"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activePage==="order"?"Pesan produksi baju konveksi":
               activePage==="status"?"Pantau status pesananmu":"Lengkapi data dirimu"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase()??"C"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.email??"Customer"}</p>
              <p className="text-xs text-gray-400">Customer</p>
            </div>
          </div>
        </div>

        {/* ── Buat Order ── */}
        {activePage === "order" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Form Pesanan Baru</h3>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {[
                {label:"Jenis Baju",type:"text",key:"jenis_baju",placeholder:"Kaos polos, Kemeja, dll"},
                {label:"Jumlah (pcs)",type:"number",key:"jumlah",placeholder:"100"},
                {label:"Deadline",type:"date",key:"deadline"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder||""} min={f.type==="number"?1:undefined}
                    value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea placeholder="Warna, ukuran, detail lainnya..." value={form.catatan}
                  onChange={e=>setForm({...form,catatan:e.target.value})} rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                />
              </div>
              {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}
              <button disabled={loading} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-60">
                {loading?"Mengirim...":"Buat Order"}
              </button>
            </form>
          </div>
        )}

        {/* ── Status Pesanan ── */}
        {activePage === "status" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Belum ada pesanan.</div>
            ) : orders.map(order => {
              const pay = payments[order.id_order];
              const pidx = progressStatus.indexOf(order.status === "menunggu_konfirmasi" ? "menunggu_pembayaran" : order.status);
              return (
                <div key={order.id_order} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                          #{order.id_order}
                        </span>
                        <p className="font-semibold text-gray-800">{order.jenis_baju}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{order.jumlah} pcs · Deadline: {order.deadline}</p>
                      {order.catatan && <p className="text-sm text-gray-400 mt-1">📝 {order.catatan}</p>}
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[order.status]||"bg-gray-100 text-gray-600"}`}>
                      {order.status==="menunggu_pembayaran"?"Menunggu Pembayaran":
                       order.status==="menunggu_konfirmasi"?"Menunggu Konfirmasi":
                       statusLabel[order.status]||order.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      {progressStatus.map(s=><span key={s}>{statusLabel[s]}</span>)}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full transition-all"
                        style={{width:`${(pidx+1)/progressStatus.length*100}%`}} />
                    </div>
                  </div>

                  {/* Finishing → foto + approve/revisi */}
                  {order.status === "finishing" && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-orange-700">🎉 Pesananmu selesai diproses! Cek foto hasilnya:</p>
                      {finishingPhotos[order.id_batch] ? (
                        <img src={`${BACKEND_URL}/${finishingPhotos[order.id_batch]}`} alt="Hasil"
                          className="w-full max-w-sm rounded-xl border border-orange-200 object-cover" style={{maxHeight:280}} />
                      ) : (
                        <div className="bg-white border border-orange-200 rounded-xl p-4 text-center text-sm text-gray-400">⏳ Memuat foto...</div>
                      )}
                      {approveSuccess[order.id_order] ? (
                        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">✅ {approveSuccess[order.id_order]}</p>
                      ) : !showRevisiForm[order.id_order] ? (
                        <div className="flex gap-2">
                          <button onClick={()=>handleApprove(order.id_order)} disabled={approvingId===order.id_order}
                            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition">
                            {approvingId===order.id_order?"Memproses...":"✅ Setuju & Lanjut"}
                          </button>
                          <button onClick={()=>setShowRevisiForm(prev=>({...prev,[order.id_order]:true}))}
                            className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 px-4 py-2 text-sm font-semibold text-white transition">
                            🔄 Minta Revisi
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-orange-700">Ajukan Permintaan Revisi</p>
                          <textarea placeholder="Jelaskan perubahan yang diinginkan..."
                            value={alasanRevisi[order.id_order]||""} rows={3}
                            onChange={e=>setAlasanRevisi(prev=>({...prev,[order.id_order]:e.target.value}))}
                            className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none bg-white"
                          />
                          <div>
                            <label className="block text-sm font-medium text-orange-700 mb-1">📸 Foto Referensi *</label>
                            <input type="file" accept="image/jpeg,image/png,image/webp"
                              onChange={e=>handleFotoRevisiChange(order.id_order,e.target.files[0])}
                              className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-600"
                            />
                            {fotoPreview[order.id_order] && (
                              <img src={fotoPreview[order.id_order]} className="mt-2 rounded-xl border border-orange-200" style={{maxHeight:150,maxWidth:"100%"}} />
                            )}
                          </div>
                          {revisiError[order.id_order] && <p className="text-xs text-red-600">{revisiError[order.id_order]}</p>}
                          {revisiSuccess[order.id_order] && <p className="text-xs text-green-600">{revisiSuccess[order.id_order]}</p>}
                          <div className="flex gap-2">
                            <button onClick={()=>handleSubmitRevisi(order.id_order)} disabled={submittingRevisi===order.id_order}
                              className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                              {submittingRevisi===order.id_order?"Mengirim...":"📨 Kirim Revisi"}
                            </button>
                            <button onClick={()=>setShowRevisiForm(prev=>({...prev,[order.id_order]:false}))}
                              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500">Batal</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Menunggu Pembayaran → tagihan + upload bukti */}
                  {order.status === "menunggu_pembayaran" && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                      {!pay ? (
                        <div className="text-center py-2">
                          <p className="text-sm font-semibold text-red-700">⏳ Admin sedang menetapkan harga...</p>
                          <p className="text-xs text-red-500 mt-1">Kami akan segera memberi tahu total tagihan kamu.</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-red-700">💳 Tagihan Pesanan</p>
                          <div className="bg-white border border-red-200 rounded-xl p-3 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Harga Satuan</span><span>{fmt(pay.harga_satuan)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Jumlah</span><span>{order.jumlah} pcs</span></div>
                            <div className="flex justify-between border-t pt-2"><span className="font-bold">Total</span><span className="font-bold text-red-700">{fmt(pay.total_harga)}</span></div>
                          </div>
                          {buktiSuccess[pay.id_pembayaran] ? (
                            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">✅ {buktiSuccess[pay.id_pembayaran]}</p>
                          ) : (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-red-700">📷 Upload Bukti Transfer</label>
                              <input type="file" accept="image/jpeg,image/png,image/webp"
                                onChange={e=>handleBuktiBayarChange(pay.id_pembayaran,e.target.files[0])}
                                className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-red-100 file:text-red-600"
                              />
                              {buktiPreview2[pay.id_pembayaran] && (
                                <img src={buktiPreview2[pay.id_pembayaran]} className="rounded-xl border border-red-200" style={{maxHeight:150,maxWidth:"100%"}} />
                              )}
                              {buktiError[pay.id_pembayaran] && <p className="text-xs text-red-600">{buktiError[pay.id_pembayaran]}</p>}
                              <button onClick={()=>handleUploadBukti(pay.id_pembayaran)} disabled={uploadingBukti===pay.id_pembayaran}
                                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition">
                                {uploadingBukti===pay.id_pembayaran?"Mengirim...":"📨 Kirim Bukti Transfer"}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Menunggu Konfirmasi */}
                  {order.status === "menunggu_konfirmasi" && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-700">⏳ Bukti transfer telah diterima</p>
                      <p className="text-xs text-amber-600 mt-1">Admin sedang memverifikasi pembayaranmu. Mohon tunggu.</p>
                    </div>
                  )}

                  {/* Selesai → lihat nota */}
                  {order.status === "selesai" && (
                    <div className="mt-4">
                      <button onClick={()=>fetchNota(order.id_order)}
                        className="text-sm text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-xl px-4 py-2 transition font-medium">
                        🧾 Lihat & Cetak Nota
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Profil ── */}
        {activePage === "profil" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-700 mb-1">Data Diri</h3>
            <p className="text-sm text-gray-400 mb-4">Lengkapi profilmu agar nota pesanan bisa dicetak dengan lengkap.</p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {[
                {label:"Nama Lengkap",key:"nama",placeholder:"Nama lengkap kamu"},
                {label:"No HP / WhatsApp",key:"no_hp",placeholder:"08xxxxxxxxxx"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={profile[f.key]}
                    onChange={e=>setProfile({...profile,[f.key]:e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea placeholder="Jalan, No. Rumah, Kelurahan, Kota..." value={profile.alamat}
                  onChange={e=>setProfile({...profile,alamat:e.target.value})} rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                />
              </div>
              {profileError   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{profileError}</p>}
              {profileSuccess && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✅ {profileSuccess}</p>}
              <button disabled={profileLoading}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-60">
                {profileLoading?"Menyimpan...":"Simpan Profil"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── Modal Nota ── */}
      {showNota && nota[showNota] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowNota(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">🧾 Nota Pesanan</h2>
              <button onClick={()=>setShowNota(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-bold">SIM Konveksi</h1>
                <p className="text-xs text-gray-400">Nota Pembayaran</p>
                <p className="font-mono text-sm font-bold mt-1">{nomorNota(nota[showNota].id_order, nota[showNota].tanggal_order)}</p>
              </div>
              {[
                {l:"Tanggal Order",v:nota[showNota].tanggal_order?.split(' ')[0]},
                {l:"Nama Customer",v:nota[showNota].nama_customer||nota[showNota].email_customer},
                {l:"No HP",v:nota[showNota].no_hp||'-'},
                {l:"Alamat",v:nota[showNota].alamat||'-'},
              ].map(r=>(
                <div key={r.l} className="flex justify-between text-sm">
                  <span className="text-gray-500">{r.l}</span>
                  <span className="text-gray-800 max-w-[200px] text-right">{r.v}</span>
                </div>
              ))}
              <div className="border-t border-b py-3 space-y-2">
                {[
                  {l:"Jenis Baju",v:nota[showNota].jenis_baju},
                  {l:"Jumlah",v:`${nota[showNota].jumlah} pcs`},
                  {l:"Harga Satuan",v:fmt(nota[showNota].harga_satuan)},
                  {l:"Catatan",v:nota[showNota].catatan||'-'},
                ].map(r=>(
                  <div key={r.l} className="flex justify-between text-sm">
                    <span className="text-gray-500">{r.l}</span>
                    <span className="text-gray-800">{r.v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-bold">Total Harga</span>
                  <span className="font-bold text-pink-600">{fmt(nota[showNota].total_harga)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status Bayar</span>
                  <span className={nota[showNota].status_bayar==='lunas'?"text-green-600 font-bold":"text-red-600"}>
                    {nota[showNota].status_bayar==='lunas'?"✅ LUNAS":"Belum Lunas"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-2">
              <button onClick={()=>handlePrintNota(nota[showNota])}
                className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white">
                🖨️ Cetak Nota
              </button>
              <button onClick={()=>setShowNota(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}