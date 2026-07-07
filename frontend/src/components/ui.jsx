export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button className={`btn-primary ${className}`} {...props}>
      {children}
    </button>
  );
}

export function InputField({ label, name, type = "text", placeholder = "", required = true }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input name={name} type={type} placeholder={placeholder} className="input-base" required={required} />
    </label>
  );
}

export function SelectField({ label, name, options = [] }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select name={name} className="input-base" defaultValue="" required>
        <option value="" disabled>
          Pilih {label.toLowerCase()}
        </option>
        {options.map((opt) => {
          const val  = typeof opt === "object" ? opt.value : opt;
          const text = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 backdrop-blur-sm">
      <Card className="px-5 py-3 text-sm text-slate-700 shadow-premium">Menyimpan data...</Card>
    </div>
  );
}

export function Toast({ message }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-premium">
      {message}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </Card>
  );
}
