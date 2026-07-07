import { useEffect, useState, useMemo } from "react";

const API_URL = "http://localhost/project-konveksi-main/project-konveksi-main/Backend";

// ← Hapus "karyawan (Pilih Divisi)", admin langsung assign divisi spesifik
const roleOptions = [
  { value: "bahan",      label: "Bagian Bahan Masuk" },
  { value: "cutting",    label: "Bagian Cutting" },
  { value: "jahit",      label: "Bagian Jahit" },
  { value: "finishing",  label: "Bagian Finishing" },
  { value: "pengiriman", label: "Bagian Pengiriman" },
];

const roleBadge = {
  admin:      "bg-purple-100 text-purple-700",
  customer:   "bg-blue-100 text-blue-700",
  karyawan:   "bg-yellow-100 text-yellow-700",
  bahan:      "bg-green-100 text-green-700",
  cutting:    "bg-pink-100 text-pink-700",
  jahit:      "bg-orange-100 text-orange-700",
  finishing:  "bg-teal-100 text-teal-700",
  pengiriman: "bg-indigo-100 text-indigo-700",
};

export default function ManajemenUser({ searchQuery }) {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm]             = useState({ email: "", password: "", role: "" });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res  = await fetch(`${API_URL}/manage_users.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setUsers(data.data);
    } catch { console.error("Gagal fetch users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchEmail = String(u.Email || "").toLowerCase().includes(query);
      const matchRole  = String(u.role || "").toLowerCase().includes(query);
      const matchNama  = String(u.nama || "").toLowerCase().includes(query);
      const matchId    = String(u.id_user || "").toLowerCase().includes(query);
      return matchEmail || matchRole || matchNama || matchId;
    });
  }, [users, searchQuery]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.email || !form.password || !form.role) {
      setError("Semua field wajib diisi."); return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/manage_users.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess(data.message);
        setForm({ email: "", password: "", role: "" });
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch { setError("Gagal terhubung ke server."); }
    setLoading(false);
  };

  const handleDelete = async (id_user, email) => {
    if (!window.confirm(`Hapus user ${email}?`)) return;
    setDeletingId(id_user);
    try {
      const res  = await fetch(`${API_URL}/manage_users.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_user }),
      });
      const data = await res.json();
      if (data.status === "success") fetchUsers();
      else alert(data.message);
    } catch { alert("Gagal menghapus user."); }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">

      {/* Form Tambah User */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4">➕ Tambah Karyawan Baru</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="karyawan@gmail.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="min. 6 karakter"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Divisi</label>
            <select
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            >
              <option value="">Pilih divisi...</option>
              {roleOptions.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="sm:col-span-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="sm:col-span-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <div className="sm:col-span-3">
            <button
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 transition"
            >
              {loading ? "Menyimpan..." : "Tambah Karyawan"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Daftar Semua User</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            {searchQuery ? `${filteredUsers.length} user ditemukan` : `${users.length} user terdaftar`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Nama</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Terdaftar</th>
                <th className="px-6 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada user yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id_user} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400">#{u.id_user}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{u.nama || "-"}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{u.Email}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadge[u.role] || "bg-slate-100 text-slate-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">{u.created_at?.split(" ")[0]}</td>
                    <td className="px-6 py-3 text-center">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => handleDelete(u.id_user, u.Email)}
                          disabled={deletingId === u.id_user}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 transition"
                        >
                          {deletingId === u.id_user ? "Menghapus..." : "🗑 Hapus"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 italic">protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
