import { Card, EmptyState } from "../components/ui";

export default function ReportPage({ data }) {
  if (!data.length) {
    return (
      <EmptyState
        title="Data laporan kosong"
        subtitle="Belum ada data batch yang bisa ditampilkan."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Batch</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Jumlah Produksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((item) => (
              <tr key={item.batch} className="text-slate-600 transition hover:bg-slate-50 hover:text-slate-800">
                <td className="px-4 py-3">{item.batch}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs text-pink-600">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-800">{item.produksi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
