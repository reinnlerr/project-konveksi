import FormPage from "./FormPage";

export default function Finishing({ batchOptions, onSubmit, canEdit }) {
  return (
    <FormPage
      fields={[
        { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
        { label: "Jumlah Hasil", name: "hasil", type: "number", placeholder: "0" },
        { label: "Status", name: "status", type: "select", options: ["Selesai", "Revisi"] }
      ]}
      submitText="Simpan Finishing"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data finishing berhasil disimpan.")}
    />
  );
}
