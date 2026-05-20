import { Card } from "../components/ui";

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconByLabel = {
  "Total Batch": "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z",
  "Batch Aktif": "M8 5v14l11-7z",
  "Batch Selesai": "M5 12l4 4L19 6"
};

const productionData = [
  { label: "Sen", value: 42 },
  { label: "Sel", value: 57 },
  { label: "Rab", value: 64 },
  { label: "Kam", value: 58 },
  { label: "Jum", value: 76 },
  { label: "Sab", value: 69 }
];

const recentActivities = [
  { type: "Bahan Masuk", desc: "Cotton Combed 24s ditambahkan ke Batch A-01", time: "10 menit lalu" },
  { type: "Cutting", desc: "Hasil cutting 120 pcs untuk Batch B-02", time: "28 menit lalu" },
  { type: "Jahit", desc: "Progress jahit 90 pcs di Batch C-03", time: "45 menit lalu" },
  { type: "Finishing", desc: "Batch A-01 status revisi minor", time: "1 jam lalu" },
  { type: "Pengiriman", desc: "80 pcs Batch B-02 siap dikirim", time: "2 jam lalu" }
];

const batchProgress = [
  { name: "Batch A-01", progress: 82, stage: "Finishing" },
  { name: "Batch B-02", progress: 61, stage: "Jahit" },
  { name: "Batch C-03", progress: 47, stage: "Cutting" }
];

const alerts = [
  { title: "Batch C-03 terlambat 1 hari", level: "Perlu perhatian" },
  { title: "2 item revisi di Finishing", level: "Tindak lanjuti" }
];

export default function DashboardPage({ stats }) {
  return (
    <section className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats && stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      {/* Chart & Alerts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Chart Produksi Mingguan</h3>
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-1 text-xs text-white">
              Real-time
            </span>
          </div>
          <div className="flex h-52 items-end justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            {productionData.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-pink-500 to-rose-500" style={{ height: `${point.value * 2}px` }} />
                <span className="text-xs text-slate-500">{point.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="text-base font-semibold text-slate-800">Notifikasi</h3>
          {alerts.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 p-3 transition hover:border-pink-300 hover:bg-pink-50/30">
              <p className="text-sm font-medium text-slate-700">{item.title}</p>
              <p className="mt-1 text-xs text-pink-500">{item.level}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* Activities & Progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="space-y-3 p-5 xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-800">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div key={`${activity.type}-${activity.time}`} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-pink-300 hover:bg-pink-50/30">
                <span className="mt-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-1.5 text-white">
                  <Icon path="M12 6v6l4 2M22 12A10 10 0 112 12a10 10 0 0120 0z" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.type}</p>
                  <p className="text-sm text-slate-500">{activity.desc}</p>
                  <p className="mt-1 text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="text-base font-semibold text-slate-800">Progress Batch</h3>
          {batchProgress.map((batch) => (
            <div key={batch.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{batch.name}</span>
                <span className="text-xs text-slate-500">{batch.stage}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${batch.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{batch.progress}% selesai</p>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  const iconPath = iconByLabel[label];

  return (
    <Card className="group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
        </div>
        <span className="rounded-2xl bg-pink-100 p-2.5 text-pink-600 transition group-hover:bg-pink-200">
          <Icon path={iconPath} />
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-200">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
      </div>
    </Card>
  );
}