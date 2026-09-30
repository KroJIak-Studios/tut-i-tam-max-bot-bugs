import React from 'react'
import { Link } from 'react-router-dom'
import styles from './AssistantText.module.css'

const LINK = /\[([^\]]+)\]\((\/[^)\s]+)\)/g
const IMAGE = /!\[[^\]]*\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g

export const AssistantText: React.FC<{ text: string }> = ({ text }) => {
  const nodes: React.ReactNode[] = []
  let last = 0
  const pattern = new RegExp(`${IMAGE.source}|${LINK.source}`, 'g')
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    if (match[1] !== undefined) {
      nodes.push(<img key={`img-${index}`} src={match[1]} alt="" className={styles.photo} />)
    } else {
      const path = match[3]
      nodes.push(path ? <Link key={`${path}-${index}`} to={path} className={styles.link}>{match[2]}</Link> : match[0])
    }
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <div className={styles.text}>{nodes}</div>
}
