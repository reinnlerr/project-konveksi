import { CheckCircle2, LayoutGrid, PackagePlus, Scissors, Send, Shirt, Inbox } from "lucide-react";

const iconMap = {
  Dashboard: LayoutGrid,
  "Pesanan Masuk": Inbox,
  "Bahan Masuk": PackagePlus,
  Cutting: Scissors,
  Jahit: Shirt,
  Finishing: CheckCircle2,
  Pengiriman: Send
};

// PINDAH KE ATAS: Biar React kenal duluan sebelum dipakai
function SidebarButton({ item, active, onClick }) {
  const Icon = iconMap[item] || Inbox; 

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-full px-3 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-soft"
          : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
      }`}
    >
      <span
        className={`rounded-full p-1.5 transition ${
          active
            ? "bg-white/20 text-white"
            : "bg-pink-500/10 text-pink-300 group-hover:bg-pink-500/20"
        }`}
      >
        <Icon size={16} />
      </span>
      <span>{item}</span>
    </button>
  );
}

// KOMPONEN UTAMA DI BAWAH
export default function Sidebar({ navItems, activePage, onChange }) {
  return (
    <aside className="w-full bg-slate-900 p-4 md:w-72 md:p-6">
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800 p-4 text-slate-100">
        <p className="text-xs uppercase tracking-wider text-slate-400">Sistem Produksi</p>
        <h2 className="mt-1 text-lg font-semibold">Konveksi Dashboard</h2>
      </div>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <SidebarButton key={item} item={item} active={activePage === item} onClick={() => onChange(item)} />
        ))}
      </nav>
    </aside>
  );
}