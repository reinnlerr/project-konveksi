import { useEffect, useState } from "react";

const API_URL     = "http://localhost/project-konveksi/Backend";
const BACKEND_URL = "http://localhost/project-konveksi/Backend";

const fmt = (n) => n ? `Rp ${parseInt(n).toLocaleString('id-ID')}` : '-';

export default function PesananMasuk() {
  const [orders, setOrders]           = useState([]);
  const [revisi, setRevisi]           = useState([]);
  const [needPricing, setNeedPricing] = useState([]);
  const [pembayaran, setPembayaran]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState("pesanan");
  const [hargaInput, setHargaInput]   = useState({}); // {id_order: string}
  const [hargaLoading, setHargaLoading] = useState(null);
  const [hargaMsg, setHargaMsg]       = useState({});
  const [konfirmasiLoading, setKonfirmasiLoading] = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_URL}/orders.php`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data);
    } catch {}
  };

  const fetchRevisi = async () => {
    try {
      const res  = await fetch(`${API_URL}/revisi.php`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setRevisi(data.data);
    } catch {}
  };

  const fetchNeedPricing = async () => {
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php?action=need_pricing`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setNeedPricing(data.data);
    } catch {}
  };

  const fetchPembayaran = async () => {
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setPembayaran(data.data);
    } catch {}
  };

  useEffect(() => { fetchOrders(); fetchRevisi(); fetchNeedPricing(); fetchPembayaran(); }, []);

  const handleApprove = async (id_order) => {
    if (!window.confirm("Proses pesanan ini ke tahap Bahan?")) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/approve_order.php`, {
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({id_order})
      });
      const data = await res.json();
      if (data.status === "success") { alert("✅ "+data.message); fetchOrders(); }
      else alert("❌ "+data.message);
    } catch { alert("❌ Gagal."); }
    setLoading(false);
  };

  const handleSetHarga = async (id_order) => {
    const harga = parseInt(hargaInput[id_order]);
    if (!harga || harga <= 0) { setHargaMsg(prev=>({...prev,[id_order]:{type:"error",msg:"Masukkan harga yang valid."}})); return; }
    setHargaLoading(id_order); setHargaMsg(prev=>({...prev,[id_order]:{}}));
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php`, {
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({id_order, harga_satuan: harga})
      });
      const data = await res.json();
      setHargaMsg(prev=>({...prev,[id_order]:{type:data.status==="success"?"success":"error",msg:data.message}}));
      if (data.status === "success") { fetchNeedPricing(); fetchPembayaran(); }
    } catch { setHargaMsg(prev=>({...prev,[id_order]:{type:"error",msg:"Gagal terhubung."}})); }
    setHargaLoading(null);
  };

  const handleKonfirmasi = async (id_pembayaran, id_order) => {
    if (!window.confirm("Konfirmasi pembayaran ini sudah LUNAS?")) return;
    setKonfirmasiLoading(id_pembayaran);
    try {
      const res  = await fetch(`${API_URL}/pembayaran.php?action=konfirmasi`, {
        method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({id_pembayaran, id_order})
      });
      const data = await res.json();
      if (data.status === "success") { alert("✅ "+data.message); fetchPembayaran(); fetchOrders(); }
      else alert("❌ "+data.message);
    } catch { alert("Gagal terhubung."); }
    setKonfirmasiLoading(null);
  };

  const revisiCount  = revisi.length;
  const perluKonfirmasi = pembayaran.filter(p => p.status_order === "menunggu_konfirmasi");
  const lunasList    = pembayaran.filter(p => p.status === "lunas");

  const tabs = [
    { key:"pesanan",    label:"📋 Pesanan Masuk" },
    { key:"revisi",     label:"🔄 Riwayat Revisi", badge:revisiCount },
    { key:"pembayaran", label:"💰 Pembayaran",     badge:perluKonfirmasi.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab===t.key
                ? t.key==="revisi"?"bg-gradient-to-r from-red-500 to-rose-500 text-white shadow":
                  t.key==="pembayaran"?"bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow":
                  "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                activeTab===t.key?"bg-white text-gray-700":"bg-red-500 text-white"
              }`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pesanan Masuk ── */}
      {activeTab === "pesanan" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  {["ID Order","Jenis Baju","Jumlah","Deadline","Status","Aksi"].map(h=>(
                    <th key={h} className={`p-4 font-semibold${h==="Aksi"?" text-center":""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">Belum ada pesanan.</td></tr>
                ) : orders.map(o=>(
                  <tr key={o.id_order} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">#{o.id_order}</td>
                    <td className="p-4">{o.jenis_baju}</td>
                    <td className="p-4">{o.jumlah} pcs</td>
                    <td className="p-4">{o.deadline}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        o.status==="pending"?"bg-yellow-100 text-yellow-700":
                        o.status==="menunggu_pembayaran"?"bg-red-100 text-red-700":
                        o.status==="menunggu_konfirmasi"?"bg-amber-100 text-amber-700":
                        o.status==="selesai"?"bg-green-100 text-green-700":
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {o.status==="menunggu_pembayaran"?"Menunggu Pembayaran":
                         o.status==="menunggu_konfirmasi"?"Menunggu Konfirmasi":
                         o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {o.status === "pending" ? (
                        <button onClick={()=>handleApprove(o.id_order)} disabled={loading}
                          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60">
                          {loading?"Memproses...":"Proses ke Bahan"}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm italic">{o.id_batch?`Batch #${o.id_batch}`:"-"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Riwayat Revisi ── */}
      {activeTab === "revisi" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {revisi.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Belum ada riwayat revisi.</div>
          ) : (
            <div className="space-y-4">
              {revisi.map(r=>(
                <div key={r.id_revisi} className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-slate-800">Order #{r.id_order} — {r.jenis_baju}</p>
                      <p className="text-sm text-slate-500">
                        Batch: <span className="font-medium">{r.nama_batch}</span> · Customer: <span className="font-medium">{r.email_customer}</span>
                      </p>
                      <div className="mt-2 bg-white border border-red-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Alasan Revisi:</p>
                        <p className="text-sm text-slate-700">{r.alasan}</p>
                      </div>
                      {r.foto && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-1">📸 Foto Referensi:</p>
                          <img src={`${BACKEND_URL}/${r.foto}`} className="rounded-xl border border-red-200" style={{maxHeight:150,maxWidth:"100%"}} />
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status==="jahit"?"bg-pink-100 text-pink-700":"bg-slate-100 text-slate-600"}`}>
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

      {/* ── Pembayaran ── */}
      {activeTab === "pembayaran" && (
        <div className="space-y-4">

          {/* Belum ditagih */}
          {needPricing.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-4">💡 Perlu Penetapan Harga</h3>
              <div className="space-y-4">
                {needPricing.map(o=>(
                  <div key={o.id_order} className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800">Order #{o.id_order} — {o.jenis_baju}</p>
                        <p className="text-sm text-slate-500">{o.jumlah} pcs · {o.email_customer}</p>
                        {o.catatan && <p className="text-xs text-slate-400 mt-1">📝 {o.catatan}</p>}
                      </div>
                      <div className="flex gap-2 items-center">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Harga Satuan (Rp)</label>
                          <input type="number" placeholder="150000"
                            value={hargaInput[o.id_order]||""}
                            onChange={e=>setHargaInput(prev=>({...prev,[o.id_order]:e.target.value}))}
                            className="rounded-lg border border-yellow-300 px-3 py-2 text-sm outline-none focus:border-yellow-500 w-40"
                          />
                        </div>
                        <div className="mt-5">
                          <button onClick={()=>handleSetHarga(o.id_order)} disabled={hargaLoading===o.id_order}
                            className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                            {hargaLoading===o.id_order?"...":"✅ Tetapkan"}
                          </button>
                        </div>
                      </div>
                    </div>
                    {hargaMsg[o.id_order]?.msg && (
                      <p className={`text-xs mt-2 ${hargaMsg[o.id_order].type==="success"?"text-green-600":"text-red-600"}`}>
                        {hargaMsg[o.id_order].msg}
                      </p>
                    )}
                    {hargaInput[o.id_order] && parseInt(hargaInput[o.id_order]) > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Total: {fmt(parseInt(hargaInput[o.id_order]) * o.jumlah)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perlu konfirmasi */}
          {perluKonfirmasi.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-4">🔍 Bukti Transfer Masuk — Perlu Konfirmasi</h3>
              <div className="space-y-4">
                {perluKonfirmasi.map(p=>(
                  <div key={p.id_pembayaran} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800">Order #{p.id_order} — {p.jenis_baju}</p>
                        <p className="text-sm text-slate-500">{p.nama_customer||p.email_customer} · {p.no_hp||'-'}</p>
                        <div className="text-sm space-y-0.5">
                          <p>Harga Satuan: <span className="font-medium">{fmt(p.harga_satuan)}</span></p>
                          <p>Total: <span className="font-bold text-amber-700">{fmt(p.total_harga)}</span></p>
                        </div>
                        {p.bukti_transfer && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-500 mb-1">Bukti Transfer:</p>
                            <img src={`${BACKEND_URL}/${p.bukti_transfer}`} className="rounded-xl border border-amber-200" style={{maxHeight:200,maxWidth:"100%"}} />
                          </div>
                        )}
                      </div>
                      <button onClick={()=>handleKonfirmasi(p.id_pembayaran, p.id_order)} disabled={konfirmasiLoading===p.id_pembayaran}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition self-start">
                        {konfirmasiLoading===p.id_pembayaran?"Memproses...":"✅ Konfirmasi Lunas"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lunas */}
          {lunasList.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-4">✅ Sudah Lunas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      {["Order","Jenis Baju","Customer","Total","Tanggal"].map(h=>(
                        <th key={h} className="p-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lunasList.map(p=>(
                      <tr key={p.id_pembayaran} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium">#{p.id_order}</td>
                        <td className="p-3">{p.jenis_baju}</td>
                        <td className="p-3 text-xs text-slate-400">{p.nama_customer||p.email_customer}</td>
                        <td className="p-3 font-semibold text-green-600">{fmt(p.total_harga)}</td>
                        <td className="p-3 text-xs text-slate-400">{p.created_at?.split(" ")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {needPricing.length===0 && perluKonfirmasi.length===0 && lunasList.length===0 && (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm border border-slate-100">
              Belum ada data pembayaran.
            </div>
          )}
        </div>
      )}
    </div>
  );
}