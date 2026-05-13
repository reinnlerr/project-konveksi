import { Factory, Sparkles } from "lucide-react";

export default function AuthSplitLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4 md:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-premium md:grid-cols-2">
        <section className="relative hidden bg-slate-800 px-12 py-12 text-white md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/8 to-transparent" />
          <div className="pointer-events-none absolute -right-10 top-1/2 h-72 w-32 -translate-y-1/2 rounded-l-[100px] bg-gradient-to-b from-pink-500/20 to-rose-500/20 blur-sm" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm">
              <Factory size={16} />
              Konveksi Pro Suite
            </div>
            <h2 className="mt-6 text-3xl font-semibold leading-tight">Sistem Manajemen Produksi Konveksi</h2>
            <p className="mt-4 text-sm text-white/75">
              Kelola batch produksi, bahan masuk, cutting, jahit, finishing, dan pengiriman dalam satu dashboard.
            </p>
          </div>

          <div className="relative z-10 inline-flex items-center gap-2 text-sm text-pink-300">
            <Sparkles size={16} />
            Modern. Efisien. Terintegrasi.
          </div>
        </section>

        <section className="relative bg-white px-8 py-10 md:px-12 md:py-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8">
            <h1 className="text-3xl font-semibold text-slate-800">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
