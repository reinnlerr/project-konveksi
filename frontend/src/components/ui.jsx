export function SelectField({ label, name, options = [] }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select name={name} className="input-base" defaultValue="" required>
        <option value="" disabled>
          Pilih {label.toLowerCase()}
        </option>
        {options.map((opt) => {
          // ── Handle dua format: string biasa atau {value, label} ──
          const val   = typeof opt === "object" ? opt.value : opt;
          const text  = typeof opt === "object" ? opt.label : opt;
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