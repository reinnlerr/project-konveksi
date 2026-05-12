import FormPage from "./FormPage";

export default function Cutting({ batchOptions, onSubmit, canEdit }) {
  return (
    <FormPage
      fields={[
        { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
        { label: "Jumlah Hasil Cutting", name: "hasil", type: "number", placeholder: "0" }
      ]}
      submitText="Simpan Cutting"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data cutting berhasil disimpan.")}
    />
  );
}
