import DatePicker, { registerLocale } from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('ru', ru)

export function AdminDateTime({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const selected = value ? new Date(value) : null
  return (
    <DatePicker
      selected={selected}
      onChange={(date: Date | null) => onChange(date ? toInput(date) : '')}
      showTimeSelect
      timeIntervals={15}
      timeCaption="Время"
      dateFormat="d MMM yyyy, HH:mm"
      locale="ru"
      placeholderText="Выберите дату"
      isClearable
      wrapperClassName="admin-datetime-wrap"
      className="admin-datetime"
      popperClassName="admin-datetime-popper"
      calendarClassName="admin-datetime-calendar"
    />
  )
}

function toInput(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
