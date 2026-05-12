import FormPage from "./FormPage";

export default function Pengiriman({ batchOptions, onSubmit, canEdit }) {
  return (
    <FormPage
      fields={[
        { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
        { label: "Jumlah Kirim", name: "jumlah", type: "number", placeholder: "0" },
        { label: "Tanggal Kirim", name: "tanggal", type: "date" }
      ]}
      submitText="Simpan Pengiriman"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data pengiriman berhasil disimpan.")}
    />
  );
}
