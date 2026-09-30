import Select, { type StylesConfig } from 'react-select'

export interface AdminOption {
  value: string
  label: string
}

const styles: StylesConfig<AdminOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 10,
    borderColor: state.isFocused ? '#2563eb' : '#dbe3ee',
    boxShadow: 'none',
    fontWeight: 450,
  }),
  menu: (base) => ({ ...base, borderRadius: 10, overflow: 'hidden', zIndex: 20 }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : '#fff',
    color: state.isSelected ? '#fff' : '#0f172a',
    fontWeight: 450,
  }),
  singleValue: (base) => ({ ...base, fontWeight: 450, color: '#0f172a' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontWeight: 450 }),
}

export function AdminSelect({
  value,
  options,
  onChange,
  placeholder = 'Выберите',
}: {
  value: string
  options: AdminOption[]
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <Select
      value={options.find((option) => option.value === value) ?? null}
      options={options}
      placeholder={placeholder}
      isSearchable={false}
      styles={styles}
      onChange={(option) => onChange(option?.value ?? '')}
    />
  )
}
