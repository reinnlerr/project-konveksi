import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { LoadingOverlay, Toast } from "../components/ui";
import BahanMasuk from "./BahanMasuk";
import Cutting from "./Cutting";
import DashboardPage from "./DashboardPage";
import Finishing from "./Finishing";
import Jahit from "./Jahit";
import Pengiriman from "./Pengiriman";
import PesananMasuk from "./PesananMasuk";
import ReportPage from "./ReportPage"; // ← tambah ini

const API_URL = "http://localhost/project-konveksi/Backend";

const pageTitles = {
  Dashboard:      "Ringkasan Produksi",
  "Pesanan Masuk":"Daftar Pesanan Customer",
  "Bahan Masuk":  "Input Bahan Masuk",
  Cutting:        "Input Hasil Cutting",
  Jahit:          "Input Hasil Jahit",
  Finishing:      "Input Hasil Finishing",
  Pengiriman:     "Input Data Pengiriman",
  Laporan:        "Laporan Produksi",  // ← tambah ini
};

const navByRole = {
  admin:      ["Dashboard", "Pesanan Masuk", "Laporan"],
  bahan:      ["Dashboard", "Bahan Masuk"],
  cutting:    ["Dashboard", "Cutting"],
  jahit:      ["Dashboard", "Jahit"],
  finishing:  ["Dashboard", "Finishing"],
  pengiriman: ["Dashboard", "Pengiriman"]
};

const endpointMap = {
  "Bahan Masuk": "bahan_masuk.php",
  "Cutting":     "cutting.php",
  "Jahit":       "jahit.php",
  "Finishing":   "finishing.php",
  "Pengiriman":  "pengiriman.php",
};

const statusMap = {
  "Bahan Masuk": "bahan",
  "Cutting":     "cutting",
  "Jahit":       "jahit",
  "Finishing":   "finishing",
  "Pengiriman":  "selesai",
};

export default function Dashboard({ user, initialPage = "Dashboard", onLogout, dashboardRole }) {
  const [activePage, setActivePage]     = useState(initialPage);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState("");
  const [toastType, setToastType]       = useState("success");
  const [batchOptions, setBatchOptions] = useState([]);

  const currentRole = dashboardRole || user?.role || "cutting";
  const currentNav  = navByRole[currentRole] || ["Dashboard"];
  const token       = localStorage.getItem("token");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res  = await fetch(`${API_URL}/bahan_masuk.php?get_batches=true`);
        const data = await res.json();
        if (data.status === "success") {
          setBatchOptions(data.data.map((item) => ({
            value: item.id_batch,
            label: item.nama_batch,
          })));
        }
      } catch (err) {
        console.error("Gagal fetch batch:", err);
      }
    };
    fetchBatches();
  }, []);

  const canEditModule = (moduleRole) => {
    return user?.role === "admin" || user?.role === "karyawan" || user?.role === moduleRole;
  };

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    window.setTimeout(() => setToast(""), 2200);
  };

  const onSubmitForm = async (e, successMessage) => {
    e.preventDefault();
    setLoading(true);

    const form     = new FormData(e.currentTarget);
    const endpoint = endpointMap[activePage];
    let newStatus  = statusMap[activePage];

    if (!endpoint) { setLoading(false); return; }

    let payload = {};

    if (activePage === "Bahan Masuk") {
      payload = {
        id_batch:   form.get("id_batch"),
        nama_bahan: form.get("nama_bahan"),
        jumlah:     form.get("jumlah"),
        tanggal:    form.get("tanggal"),
      };
    } else if (activePage === "Cutting") {
      payload = {
        id_batch:     form.get("batch"),
        jumlah_hasil: form.get("hasil"),
        id_user:      user?.id_user,
        tanggal:      new Date().toISOString().split("T")[0],
      };
    } else if (activePage === "Jahit") {
      payload = {
        id_batch:     form.get("batch"),
        jumlah_hasil: form.get("hasil"),
        id_user:      user?.id_user,
        tanggal:      new Date().toISOString().split("T")[0],
      };
    } else if (activePage === "Finishing") {
      const finishingStatus = form.get("status");
      payload = {
        id_batch:     form.get("batch"),
        jumlah_hasil: form.get("hasil"),
        status:       finishingStatus,
        id_user:      user?.id_user,
        tanggal:      new Date().toISOString().split("T")[0],
      };
      newStatus = finishingStatus === "Selesai" ? "pengiriman" : "jahit";
    } else if (activePage === "Pengiriman") {
      payload = {
        id_batch:      form.get("batch"),
        jumlah_kirim:  form.get("jumlah"),
        tanggal_kirim: form.get("tanggal"),
        id_user:       user?.id_user,
      };
      newStatus = "selesai";
    }

    try {
      const res  = await fetch(`${API_URL}/${endpoint}`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.status === "success") {
        if (newStatus && payload.id_batch) {
          await fetch(`${API_URL}/orders.php`, {
            method:  "PUT",
            headers: {
              "Content-Type":  "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_batch:   payload.id_batch,
              new_status: newStatus,
            }),
          });
        }
        showToast(successMessage, "success");

        const batchRes  = await fetch(`${API_URL}/bahan_masuk.php?get_batches=true`);
        const batchData = await batchRes.json();
        if (batchData.status === "success") {
          setBatchOptions(batchData.data.map((item) => ({
            value: item.id_batch,
            label: item.nama_batch,
          })));
        }
      } else {
        showToast(data.message || "Gagal menyimpan data.", "error");
      }
    } catch (err) {
      showToast("Gagal terhubung ke server.", "error");
    }

    setLoading(false);
  };

  const content = useMemo(() => {
    if (activePage === "Dashboard")     return <DashboardPage user={user} />;
    if (activePage === "Pesanan Masuk") return <PesananMasuk />;
    if (activePage === "Laporan")       return <ReportPage />; // ← tambah ini
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
    return <DashboardPage user={user} />;
  }, [activePage, user, batchOptions]);

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar navItems={currentNav} activePage={activePage} onChange={setActivePage} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-full space-y-5">
          <PageHeader title={pageTitles[activePage] || activePage} user={user} onLogout={onLogout} />
          {content}
        </div>
      </main>
      {loading && <LoadingOverlay />}
      {toast && <Toast message={toast} />}
    </div>
  );
}