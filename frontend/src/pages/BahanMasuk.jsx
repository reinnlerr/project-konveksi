import FormPage from "./FormPage";

export default function BahanMasuk({ batchOptions, onSubmit, canEdit }) {
  return (
    <FormPage
      fields={[
        { label: "Nama Bahan", name: "nama", type: "text", placeholder: "Cotton Combed 24s" },
        { label: "Jumlah", name: "jumlah", type: "number", placeholder: "0" },
        { label: "Tanggal", name: "tanggal", type: "date" },
        { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions }
      ]}
      submitText="Simpan Bahan"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data bahan masuk tersimpan.")}
    />
  );
}
