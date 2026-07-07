import { Link } from "react-router-dom";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function RegisterPage({ onRegister, loading, error, success }) {
  return (
    <AuthSplitLayout
      title="Daftar Akun"
      subtitle="Buat akun customer untuk memesan produksi"
    >
      <form onSubmit={onRegister} className="space-y-4">
        {/* Role otomatis customer */}
        <input type="hidden" name="role" value="customer" />

        <Field label="Email" name="email" type="email" placeholder="nama@gmail.com" />
        <Field label="Password" name="password" type="password" placeholder="••••••••" />
        <Field label="Konfirmasi Password" name="confirmPassword" type="password" placeholder="••••••••" />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm text-pink-600">
            {success}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-rose-600 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link to="/login" className="font-semibold text-pink-500 transition hover:underline">
          Login
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

function Field({ label, name, type, placeholder }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
        required
      />
    </label>
  );
}
