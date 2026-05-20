import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { LoadingOverlay, Toast } from "../components/ui";
import { batchOptions, stats } from "../data/mockData";
import BahanMasuk from "./BahanMasuk";
import Cutting from "./Cutting";
import DashboardPage from "./DashboardPage";
import Finishing from "./Finishing";
import Jahit from "./Jahit";
import Pengiriman from "./Pengiriman";
import PesananMasuk from "./PesananMasuk";

const pageTitles = {
  Dashboard: "Ringkasan Produksi",
  "Pesanan Masuk": "Daftar Pesanan Customer",
  "Bahan Masuk": "Input Bahan Masuk",
  Cutting: "Input Hasil Cutting",
  Jahit: "Input Hasil Jahit",
  Finishing: "Input Hasil Finishing",
  Pengiriman: "Input Data Pengiriman"
};

const navByRole = {
  admin: ["Dashboard", "Pesanan Masuk", "Bahan Masuk", "Cutting", "Jahit", "Finishing", "Pengiriman"],
  bahan: ["Dashboard", "Bahan Masuk"],
  cutting: ["Dashboard", "Cutting"],
  jahit: ["Dashboard", "Jahit"],
  finishing: ["Dashboard", "Finishing"],
  pengiriman: ["Dashboard", "Pengiriman"]
};

export default function Dashboard({ user, initialPage = "Dashboard", onLogout, dashboardRole }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // currentRole dipakai untuk nentuin menu Sidebar (karena dashboardRole dikirim dari App.jsx)
  const currentRole = dashboardRole || user?.role || "cutting";
  const currentNav = navByRole[currentRole] || ["Dashboard"];

  // 👇 INI YANG KITA PERBAIKI 👇
  // Sekarang Karyawan dan Admin bebas ngedit di modul yang mereka buka
  const canEditModule = (moduleRole) => {
    return user?.role === "admin" || user?.role === "karyawan" || user?.role === moduleRole;
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const onSubmitForm = (e, message) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      showToast(message);
    }, 650);
  };

  const content = useMemo(() => {
    if (activePage === "Dashboard") return <DashboardPage stats={stats} />;
    if (activePage === "Pesanan Masuk") return <PesananMasuk />;
    if (activePage === "Bahan Masuk") {
      return <BahanMasuk batchOptions={batchOptions} canEdit={canEditModule("bahan")} onSubmit={onSubmitForm} />;
    }
    if (activePage === "Cutting") {
      return <Cutting batchOptions={batchOptions} canEdit={canEditModule("cutting")} onSubmit={onSubmitForm} />;
    }
    if (activePage === "Jahit") {
      return <Jahit batchOptions={batchOptions} canEdit={canEditModule("jahit")} onSubmit={onSubmitForm} />;
    }
    if (activePage === "Finishing") {
      return <Finishing batchOptions={batchOptions} canEdit={canEditModule("finishing")} onSubmit={onSubmitForm} />;
    }
    if (activePage === "Pengiriman") {
      return <Pengiriman batchOptions={batchOptions} canEdit={canEditModule("pengiriman")} onSubmit={onSubmitForm} />;
    }
    return <DashboardPage stats={stats} />;
  }, [activePage, user]);

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar navItems={currentNav} activePage={activePage} onChange={setActivePage} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <PageHeader title={pageTitles[activePage]} user={user} onLogout={onLogout} />
          {content}
        </div>
      </main>
      {loading && <LoadingOverlay />}
      {toast && <Toast message={toast} />}
    </div>
  );
}