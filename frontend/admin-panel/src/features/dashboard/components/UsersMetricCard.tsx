import React from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Users } from 'lucide-react'
import type { UsersStats } from '../types'
import styles from './UsersMetricCard.module.css'

interface UsersMetricCardProps {
  stats: UsersStats
}

function dayLabel(value: string): string {
  const [, month, day] = value.split('-')
  return `${Number(day)}.${month}`
}

export const UsersMetricCard: React.FC<UsersMetricCardProps> = ({ stats }) => {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.heading}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <Users size={18} />
          </div>
          <h3 className={styles.cardTitle}>Пользователи</h3>
        </div>
        <div className={styles.totalInline}>
          <span className={styles.totalValue}>{stats.total.toLocaleString('ru-RU')}</span>
          <span className={styles.totalLabel}>зарегистрировано</span>
        </div>
      </header>

      <div className={styles.chart} aria-label="Регистрации за последние 30 дней">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.registrations} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="userRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={dayLabel}
              interval={6}
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString('ru-RU'), 'Регистрации']}
              labelFormatter={(label) => dayLabel(String(label))}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#userRegistrations)"
              dot={false}
              activeDot={{ r: 4, fill: '#2563EB' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
