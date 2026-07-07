import { Link } from "react-router-dom";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function LoginPage({ onLogin, loading, error, success }) {
  return (
    <AuthSplitLayout
      title="Welcome Back!"
      subtitle="Sign in untuk melanjutkan ke sistem produksi"
    >
      <form onSubmit={onLogin} className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="nama@gmail.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-500">
            <input
              type="checkbox"
              name="remember"
              className="rounded border-slate-300"
            />
            Remember me
          </label>
        </div>

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
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="font-semibold text-pink-500 transition hover:underline"
        >
          Register
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
