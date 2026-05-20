import { useState, useEffect } from "react";
import FormPage from "./FormPage";

export default function BahanMasuk({ onSubmit, canEdit }) {
  const [dynamicBatches, setDynamicBatches] = useState([]);

  // Ambil data batch pas halaman di-load
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        // Panggil bahan_masuk.php tapi tambahin parameter ?get_batches=true
        const response = await fetch("http://localhost/backend_lu/bahan_masuk.php?get_batches=true");
        const result = await response.json();

        if (result.status === "success") {
          // Format datanya biar pas sama komponen select FormPage lu
          const formatted = result.data.map((item) => ({
            value: item.id_batch, // ID Batch untuk database (dikirim pas submit)
            label: item.nama_batch // Nama Batch yang tampil di layar (ex: Order #1 - kemeja PDH)
          }));
          setDynamicBatches(formatted);
        }
      } catch (error) {
        console.error("Gagal memuat list batch:", error);
      }
    };

    fetchBatches();
  }, []);

  return (
    <FormPage
      fields={[
        { label: "Nama Bahan", name: "nama_bahan", type: "text", placeholder: "Cotton Combed 24s" },
        { label: "Jumlah", name: "jumlah", type: "number", placeholder: "0" },
        { label: "Tanggal", name: "tanggal", type: "date" },
        // Pakai data dynamicBatches hasil fetch database tadi
        { label: "Pilih Batch", name: "id_batch", type: "select", options: dynamicBatches }
      ]}
      submitText="Simpan Bahan"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data bahan masuk tersimpan.")}
    />
  );
}