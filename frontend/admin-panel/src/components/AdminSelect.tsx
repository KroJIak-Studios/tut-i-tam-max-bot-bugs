import Select, { type StylesConfig } from 'react-select'

export interface AdminOption {
  value: string
  label: string
}

const styles: StylesConfig<AdminOption, false> = {
  container: (base) => ({ ...base, width: '100%' }),
  control: (base, state) => ({
    ...base,
    width: '100%',
    minHeight: 42,
    height: 42,
    borderRadius: 12,
    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, .12)' : 'none',
    fontWeight: 450,
    background: '#fff',
  }),
  valueContainer: (base) => ({ ...base, height: 40, padding: '0 12px' }),
  menuPortal: (base) => ({ ...base, zIndex: 1600 }),
  menu: (base) => ({
    ...base,
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(15, 23, 42, .14)',
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 280,
  }),
  option: (base, state) => ({
    ...base,
    minHeight: 40,
    margin: 0,
    padding: '10px 12px',
    borderRadius: 8,
    background: state.isSelected ? '#2563eb' : state.isFocused ? '#f8fafc' : '#fff',
    color: state.isSelected ? '#fff' : '#0f172a',
    fontSize: 14,
    lineHeight: '20px',
  }),
  singleValue: (base) => ({ ...base, fontWeight: 450, color: '#0f172a' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontWeight: 450 }),
  indicatorSeparator: () => ({ display: 'none' }),
}

export function AdminSelect({
  value,
  options,
  onChange,
  placeholder = 'Выберите',
  disabled = false,
}: {
  value: string
  options: AdminOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <Select
      value={options.find((option) => option.value === value) ?? null}
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      isSearchable={false}
      menuPortalTarget={typeof document === 'undefined' ? null : document.body}
      menuPosition="fixed"
      styles={styles}
      onChange={(option) => onChange(option?.value ?? '')}
    />
  )
}