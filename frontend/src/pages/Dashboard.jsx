import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { Toast } from "../components/ui";
import BahanMasuk from "./BahanMasuk";
import Cutting from "./Cutting";
import DashboardPage from "./DashboardPage";
import Finishing from "./Finishing";
import Jahit from "./Jahit";
import ManajemenUser from "./ManajemenUser"; // ← baru
import Pengiriman from "./Pengiriman";
import PesananMasuk from "./PesananMasuk";
import ReportPage from "./ReportPage";

const pageTitles = {
  Dashboard:         "Ringkasan Produksi",
  "Pesanan Masuk":   "Daftar Pesanan Customer",
  "Manajemen User":  "Manajemen User",
  Laporan:           "Laporan Produksi",
  "Bahan Masuk":     "Input Bahan Masuk",
  Cutting:           "Input Hasil Cutting",
  Jahit:             "Input Hasil Jahit",
  Finishing:         "Input Hasil Finishing",
  Pengiriman:        "Input Data Pengiriman",
};

const navByRole = {
  admin:      ["Dashboard", "Pesanan Masuk", "Manajemen User", "Laporan"], // ← tambah
  bahan:      ["Dashboard", "Bahan Masuk"],
  cutting:    ["Dashboard", "Cutting"],
  jahit:      ["Dashboard", "Jahit"],
  finishing:  ["Dashboard", "Finishing"],
  pengiriman: ["Dashboard", "Pengiriman"],
};

export default function Dashboard({ user, initialPage = "Dashboard", onLogout, dashboardRole }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [toast, setToast]           = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const currentRole = dashboardRole || user?.role || "cutting";
  const currentNav  = navByRole[currentRole] || ["Dashboard"];

  const handlePageChange = (page) => {
    setActivePage(page);
    setSearchQuery("");
  };

  const content = useMemo(() => {
    if (activePage === "Dashboard")        return <DashboardPage user={user} searchQuery={searchQuery} />;
    if (activePage === "Pesanan Masuk")    return <PesananMasuk searchQuery={searchQuery} />;
    if (activePage === "Manajemen User")   return <ManajemenUser searchQuery={searchQuery} />;
    if (activePage === "Laporan")          return <ReportPage searchQuery={searchQuery} />;
    if (activePage === "Bahan Masuk")      return <BahanMasuk />;
    if (activePage === "Cutting")          return <Cutting />;
    if (activePage === "Jahit")            return <Jahit />;
    if (activePage === "Finishing")        return <Finishing />;
    if (activePage === "Pengiriman")       return <Pengiriman />;
    return <DashboardPage user={user} searchQuery={searchQuery} />;
  }, [activePage, user, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar navItems={currentNav} activePage={activePage} onChange={handlePageChange} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-full space-y-5">
          <PageHeader
            title={pageTitles[activePage] || activePage}
            user={user}
            onLogout={onLogout}
            searchVal={searchQuery}
            onSearchChange={setSearchQuery}
          />
          {content}
        </div>
      </main>
      {toast && <Toast message={toast} />}
    </div>
  );
}
