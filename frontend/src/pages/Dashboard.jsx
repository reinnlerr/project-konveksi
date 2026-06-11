import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { Toast } from "../components/ui";
import BahanMasuk from "./BahanMasuk";
import Cutting from "./Cutting";
import DashboardPage from "./DashboardPage";
import Finishing from "./Finishing";
import Jahit from "./Jahit";
import Pengiriman from "./Pengiriman";
import PesananMasuk from "./PesananMasuk";
import ReportPage from "./ReportPage";

const pageTitles = {
  Dashboard:       "Ringkasan Produksi",
  "Pesanan Masuk": "Daftar Pesanan Customer",
  "Bahan Masuk":   "Input Bahan Masuk",
  Cutting:         "Input Hasil Cutting",
  Jahit:           "Input Hasil Jahit",
  Finishing:       "Input Hasil Finishing",
  Pengiriman:      "Input Data Pengiriman",
  Laporan:         "Laporan Produksi",
};

const navByRole = {
  admin:      ["Dashboard", "Pesanan Masuk", "Laporan"],
  bahan:      ["Dashboard", "Bahan Masuk"],
  cutting:    ["Dashboard", "Cutting"],
  jahit:      ["Dashboard", "Jahit"],
  finishing:  ["Dashboard", "Finishing"],
  pengiriman: ["Dashboard", "Pengiriman"],
};

export default function Dashboard({ user, initialPage = "Dashboard", onLogout, dashboardRole }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [toast, setToast]           = useState("");

  const currentRole = dashboardRole || user?.role || "cutting";
  const currentNav  = navByRole[currentRole] || ["Dashboard"];

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const content = useMemo(() => {
    if (activePage === "Dashboard")     return <DashboardPage user={user} />;
    if (activePage === "Pesanan Masuk") return <PesananMasuk />;
    if (activePage === "Laporan")       return <ReportPage />;
    if (activePage === "Bahan Masuk")   return <BahanMasuk />;
    if (activePage === "Cutting")       return <Cutting />;
    if (activePage === "Jahit")         return <Jahit />;
    if (activePage === "Finishing")     return <Finishing />;
    if (activePage === "Pengiriman")    return <Pengiriman />;
    return <DashboardPage user={user} />;
  }, [activePage, user]);

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar navItems={currentNav} activePage={activePage} onChange={setActivePage} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-full space-y-5">
          <PageHeader title={pageTitles[activePage] || activePage} user={user} onLogout={onLogout} />
          {content}
        </div>
      </main>
      {toast && <Toast message={toast} />}
    </div>
  );
}