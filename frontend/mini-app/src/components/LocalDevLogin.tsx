import React, { useState } from 'react'
import styles from './LocalDevLogin.module.css'

interface Props { onLogin: (user: { id: number; first_name: string; language_code: string }) => void }

export const LocalDevLogin: React.FC<Props> = ({ onLogin }) => {
  const [id, setId] = useState('10001')
  const [firstName, setFirstName] = useState('Local Tester')
  const [language, setLanguage] = useState('ru-ru')
  return <main className={styles.page}>
    <form className={styles.card} onSubmit={(event) => { event.preventDefault(); onLogin({ id: Number(id), first_name: firstName.trim() || 'Local Tester', language_code: language }) }}>
      <h1>Local Mini App</h1>
      <p>Этот вход доступен только с адресов из списка локальной разработки. Он использует локальный API и не обращается к боту.</p>
      <label>User ID<input type="number" min="1" required value={id} onChange={(event) => setId(event.target.value)} /></label>
      <label>Имя<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
      <label>Язык<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="ru-ru">Русский</option><option value="en-us">English</option></select></label>
      <button type="submit">Открыть приложение</button>
    </form>
  </main>
}
