import { useState } from "react";
import { Link } from "react-router-dom";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function RegisterPage({ onRegister, loading, error, success }) {
  const [selectedRole, setSelectedRole] = useState("");

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "karyawan", label: "Karyawan" },
    { value: "customer", label: "Customer" },
  ];

  return (
    <AuthSplitLayout
      title="Create Account"
      subtitle="Daftar akun baru untuk mengakses sistem"
    >
      <form onSubmit={onRegister} className="space-y-4">
        
        {/* Pilihan Role */}
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-800">Daftar sebagai</span>
          <div className="flex gap-2">
            {roleOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition
                  ${
                    selectedRole === r.value
                      ? "border-pink-500 bg-pink-50 text-pink-600"
                      : "border-[#E5E7EB] text-slate-600 hover:border-pink-300"
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Hidden input biar keikirim ke backend form */}
          <input type="hidden" name="role" value={selectedRole} />
        </div>

        <Field label="Email" name="email" type="email" placeholder="nama@gmail.com" />
        <Field label="Password" name="password" type="password" placeholder="••••••••" />
        <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" />

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
          disabled={loading || !selectedRole}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-rose-600 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? "Mendaftarkan..." : "Register"}
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