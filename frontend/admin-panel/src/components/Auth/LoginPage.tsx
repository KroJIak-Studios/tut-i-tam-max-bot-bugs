import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { IconLogo, IconLock, IconAlertCircle, IconInfo, IconEye, IconEyeOff } from '../Icons'
import styles from './LoginPage.module.css'

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrorMessage('Введите пароль администратора')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login(password)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось выполнить вход'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <IconLogo size={28} />
            <span className={styles.title}>Тут и Там</span>
            <span className={styles.adminBadge}>Панель</span>
          </div>
          <p className={styles.subtitle}>
            Вход в систему управления городскими мероприятиями и справочниками
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBox} role="alert">
            <IconAlertCircle size={18} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              Пароль администратора
            </label>
            <div className={styles.inputWrapper}>
              <IconLock size={16} className={styles.inputIcon} />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Введите пароль администратора"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !password.trim()}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                <span>Проверка...</span>
              </>
            ) : (
              <span>Войти в панель</span>
            )}
          </button>
        </form>

        <div className={styles.infoBox}>
          <IconInfo size={16} className={styles.infoIcon} />
          <span>
            Сессионный доступ управляется токенами без сохранения пароля в браузере.
          </span>
        </div>
      </div>
    </div>
  )
}
