import { Search } from "lucide-react";
import { Card } from "./ui";


export default function PageHeader({ title, user, onLogout, searchVal, onSearchChange }) {
  const initials = (user?.name || "User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">Pantau proses produksi secara real-time</p>
      </div>

      <div className="flex w-full items-center gap-3 md:w-auto">
        <label className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-pink-300 focus-within:border-pink-500 focus-within:shadow-md focus-within:ring-2 focus-within:ring-pink-200 md:w-72">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            placeholder={title === "Manajemen User" ? "Cari user..." : "Cari batch..."}
            value={searchVal || ""}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </label>


        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-xs md:block">
            <p className="font-semibold text-slate-800">{user?.name || "Pengguna"}</p>
            <p className="text-slate-500">{user?.role === "admin" ? "Administrator" : "Operator"}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </Card>
  );
}
