import { useNavigate } from "react-router-dom";
import { CheckCircle2, PackagePlus, Scissors, Send, Shirt, LogOut } from "lucide-react";

// ID-nya gua ubah jadi huruf kecil semua biar cocok sama Route di App.jsx
const roles = [
  { id: "bahan", label: "Bahan", icon: PackagePlus, desc: "Kelola data bahan masuk produksi" },
  { id: "cutting", label: "Cutting", icon: Scissors, desc: "Input hasil potong per batch" },
  { id: "jahit", label: "Jahit", icon: Shirt, desc: "Kelola hasil jahit produksi" },
  { id: "finishing", label: "Finishing", icon: CheckCircle2, desc: "Update hasil akhir dan revisi" },
  { id: "pengiriman", label: "Pengiriman", icon: Send, desc: "Input pengiriman batch siap kirim" }
];

export default function RoleSelectionPage({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Header + Tombol Logout Gua Selipin di Sini */}
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-premium sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Pilih Role Produksi</h1>
            <p className="mt-2 text-sm text-white/85">Pilih modul kerja yang ingin Anda akses hari ini.</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                // Begitu diklik, langsung pindah ke dashboard divisinya
                onClick={() => navigate(`/role/${role.id}`)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-premium"
              >
                <span className="inline-flex rounded-xl bg-pink-100 p-2 text-pink-600">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{role.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{role.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}