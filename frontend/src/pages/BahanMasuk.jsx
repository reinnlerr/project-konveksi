import { useState, useEffect } from "react";
import FormPage from "./FormPage";

const API_URL = "http://localhost/project-konveksi/Backend";

export default function BahanMasuk({ onSubmit, canEdit }) {
  const [dynamicBatches, setDynamicBatches] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(`${API_URL}/bahan_masuk.php?get_batches=true`);
        const result = await response.json();
        if (result.status === "success") {
          const formatted = result.data.map((item) => ({
            value: item.id_batch,
            label: item.nama_batch
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
        { label: "Pilih Batch", name: "id_batch", type: "select", options: dynamicBatches }
      ]}
      submitText="Simpan Bahan"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data bahan masuk tersimpan.")}
    />
  );
}