import { Card, InputField, PrimaryButton, SelectField } from "../components/ui";

export default function FormPage({ fields, submitText, onSubmit, canEdit = true }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card className="grid gap-4 p-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="md:col-span-1">
            {field.type === "select" ? (
              <SelectField label={field.label} name={field.name} options={field.options} />
            ) : (
              <InputField
                label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder ?? ""}
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2">
          <PrimaryButton disabled={!canEdit}>{canEdit ? submitText : "Akses Edit Dibatasi"}</PrimaryButton>
        </div>
      </Card>
      <Card className="flex items-center justify-between p-4 text-xs text-slate-500">
        <p>{canEdit ? "Pastikan data batch sudah benar sebelum menyimpan." : "Role Anda hanya memiliki akses baca."}</p>
        <span className="rounded-full bg-pink-100 px-2.5 py-1 text-pink-600">
          Live validation
        </span>
      </Card>
    </form>
  );
}
