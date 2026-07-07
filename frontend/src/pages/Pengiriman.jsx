import { useEffect, useState } from "react";

const API_URL     = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";
const BACKEND_URL = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";

const fmt = (n) => n ? `Rp ${parseInt(n).toLocaleString('id-ID')}` : '-';
const nomorNota = (id, tgl) => {
  const d = new Date(tgl);
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(id).padStart(4,'0')}`;
};

function RefreshBar({ onRefresh, isRefreshing, lastRefresh }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs text-slate-500">Live</span>
        {lastRefresh && (
          <span className="text-xs text-slate-400">
            · {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 text-xs text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 rounded-xl px-3 py-1.5 transition disabled:opacity-50 font-medium"
      >
        <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isRefreshing ? "Memuat..." : "Refresh"}
      </button>
    </div>
  );
}

export default function Pengiriman() {
  const [history, setHistory]           = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [nota, setNota]                 = useState({});
  const [showNota, setShowNota]         = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_URL}/history.php?type=pengiriman`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      if (data.status === "success") setHistory(data.data);
    } catch {}
  };

  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API_URL}/pending_work.php?role=pengiriman`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      if (data.status === "success") setTasks(data.data);
    } catch {}
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchHistory(), fetchTasks()]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const fetchNota = async (id_order) => {
    if (nota[id_order]) { setShowNota(id_order); return; }
    try {
      const res  = await fetch(`${API_URL}/nota.php?id_order=${id_order}`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      if (data.status === "success") { setNota(prev=>({...prev,[id_order]:data.data})); setShowNota(id_order); }
    } catch {}
  };

  useEffect(() => { handleRefresh(); }, []);

  const handleQuickProcess = async (task) => {
    setProcessingId(task.id_batch);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`${API_URL}/pengiriman.php`, {
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({ id_batch:task.id_batch, jumlah_kirim:task.jumlah, tanggal_kirim:today })
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetch(`${API_URL}/orders.php`, {
          method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
          body:JSON.stringify({id_batch:task.id_batch, new_status:"selesai"})
        });
        fetchHistory(); fetchTasks();
      }
    } catch {}
    setProcessingId(null);
  };

  const handlePrintNota = (data) => {
    const noNota = nomorNota(data.id_order, data.tanggal_order);
    const w = window.open('','_blank');
    w.document.write(`
      <html><head><title>Nota ${noNota}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;max-width:400px;margin:0 auto}
        h1{text-align:center;font-size:18px}.sub{text-align:center;color:#666;font-size:12px;margin-top:4px}
        .divider{border-top:1px dashed #999;margin:12px 0}
        .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
        .label{color:#666}.bold{font-weight:bold}.total{background:#f9f9f9;padding:8px;border-radius:4px;margin:8px 0}
      </style></head><body>
      <h1>SIM Konveksi</h1><p class="sub">NOTA PEMBAYARAN</p><p class="sub">${noNota}</p>
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
      ${data.catatan?`<div class="divider"></div><div class="row"><span class="label">Catatan</span><span>${data.catatan}</span></div>`:''}
      <div class="divider"></div>
      <p style="text-align:center;font-size:11px;color:#999">Terima kasih telah berbelanja!</p>
      </body></html>
    `);
    w.document.close();
    setTimeout(()=>{w.print();w.close();},500);
  };

  return (
    <div className="space-y-4">
      <RefreshBar onRefresh={handleRefresh} isRefreshing={isRefreshing} lastRefresh={lastRefresh} />

      {/* Tugas Aktif */}
      <div className="card p-5 border-l-4 border-pink-500">
        <h3 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
          ⚡ Tugas Aktif
          {tasks.length > 0 && (
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600 font-medium">{tasks.length} order</span>
          )}
        </h3>
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-400">Tidak ada tugas aktif saat ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task=>(
              <div key={task.id_batch} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-pink-300 hover:bg-pink-50/20 transition">
                <div>
                  <p className="font-semibold text-slate-800">{task.nama_batch}</p>
                  <p className="text-sm text-slate-600">{task.jenis_baju} · <span className="font-medium">{task.jumlah} pcs</span></p>
                  <p className="text-xs text-slate-400">Deadline: {task.deadline}</p>
                  {task.catatan && <p className="text-xs text-slate-400 mt-0.5">📝 {task.catatan}</p>}
                </div>
                <button onClick={()=>handleQuickProcess(task)} disabled={processingId===task.id_batch}
                  className="ml-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 transition whitespace-nowrap">
                  {processingId===task.id_batch?"Memproses...":"🚚 Kirim"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat */}
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
                  <th className="py-2 pr-4 font-semibold">Jumlah</th>
                  <th className="py-2 pr-4 font-semibold">Tanggal</th>
                  <th className="py-2 font-semibold">Nota</th>
                </tr>
              </thead>
              <tbody>
                {history.map(row=>(
                  <tr key={row.id_pengiriman} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4">{row.nama_batch}</td>
                    <td className="py-2 pr-4">{row.jenis_baju||"-"}</td>
                    <td className="py-2 pr-4">{row.jumlah_kirim} pcs</td>
                    <td className="py-2 pr-4">{row.tanggal_kirim}</td>
                    <td className="py-2">
                      {row.id_order ? (
                        <button onClick={()=>fetchNota(row.id_order)}
                          className="text-xs text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-lg px-2 py-1 transition">
                          🧾 Nota
                        </button>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nota */}
      {showNota && nota[showNota] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowNota(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">🧾 Nota Pesanan</h2>
              <button onClick={()=>setShowNota(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="text-center border-b pb-4">
                <h1 className="text-lg font-bold">SIM Konveksi</h1>
                <p className="text-xs text-gray-400">Nota Pembayaran</p>
                <p className="font-mono text-sm font-bold mt-1">
                  {nomorNota(nota[showNota].id_order, nota[showNota].tanggal_order)}
                </p>
              </div>
              {[
                {l:"Tanggal Order",v:nota[showNota].tanggal_order?.split(' ')[0]},
                {l:"Nama Customer",v:nota[showNota].nama_customer||nota[showNota].email_customer},
                {l:"No HP",v:nota[showNota].no_hp||'-'},
                {l:"Alamat",v:nota[showNota].alamat||'-'},
              ].map(r=>(<div key={r.l} className="flex justify-between"><span className="text-gray-500">{r.l}</span><span className="text-gray-800 max-w-[200px] text-right">{r.v}</span></div>))}
              <div className="border-t border-b py-3 space-y-2">
                {[
                  {l:"Jenis Baju",v:nota[showNota].jenis_baju},
                  {l:"Jumlah",v:`${nota[showNota].jumlah} pcs`},
                  {l:"Harga Satuan",v:fmt(nota[showNota].harga_satuan)},
                ].map(r=>(<div key={r.l} className="flex justify-between"><span className="text-gray-500">{r.l}</span><span>{r.v}</span></div>))}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Total Harga</span>
                  <span className="font-bold text-pink-600">{fmt(nota[showNota].total_harga)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status Bayar</span>
                  <span className={nota[showNota].status_bayar==='lunas'?"text-green-600 font-bold":"text-red-600"}>
                    {nota[showNota].status_bayar==='lunas'?"✅ LUNAS":"Belum Lunas"}
                  </span>
                </div>
                {nota[showNota].catatan && (
                  <div className="flex justify-between"><span className="text-gray-500">Catatan</span><span>{nota[showNota].catatan}</span></div>
                )}
              </div>
            </div>
            <div className="p-4 flex gap-2">
              <button onClick={()=>handlePrintNota(nota[showNota])}
                className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white">
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
