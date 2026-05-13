import FormPage from "./FormPage";

export default function Jahit({ batchOptions, onSubmit, canEdit }) {
  return (
    <FormPage
      fields={[
        { label: "Pilih Batch", name: "batch", type: "select", options: batchOptions },
        { label: "Jumlah Hasil Jahit", name: "hasil", type: "number", placeholder: "0" }
      ]}
      submitText="Simpan Jahit"
      canEdit={canEdit}
      onSubmit={(e) => onSubmit(e, "Data jahit berhasil disimpan.")}
    />
  );
}
