import React, { useRef } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import { IconClose, IconPlus } from '../Icons'
import styles from './EventPhotoGrid.module.css'

export interface EventPhotoItem {
  id: string
  url: string
  file?: File
}

const LIMIT = 10

function SortablePhoto({ photo, onRemove }: { photo: EventPhotoItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })
  const { t } = useTranslation()
  return (
    <div
      ref={setNodeRef}
      className={`${styles.tile} ${isDragging ? styles.dragging : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <img src={photo.url} alt="" draggable={false} />
      <button
        type="button"
        className={styles.remove}
        aria-label={t('eventPhotos.remove')}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onRemove(photo.id)}
      >
        <IconClose size={12} color="#FFFFFF" strokeWidth={2.75} />
      </button>
    </div>
  )
}

interface EventPhotoGridProps {
  photos: EventPhotoItem[]
  onChange: (photos: EventPhotoItem[]) => void
  onReject?: (message: string) => void
}

export const EventPhotoGrid: React.FC<EventPhotoGridProps> = ({ photos, onChange, onReject }) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const room = LIMIT - photos.length
    const accepted = [...files].filter((file) => file.type.startsWith('image/')).slice(0, room)
    if (accepted.length < files.length) onReject?.(t('eventPhotos.limit'))
    const next = accepted.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, url: URL.createObjectURL(file), file }))
    onChange([...photos, ...next])
    if (inputRef.current) inputRef.current.value = ''
  }

  const reorder = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = photos.findIndex((photo) => photo.id === active.id)
    const to = photos.findIndex((photo) => photo.id === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(photos, from, to))
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
        <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
          <div className={styles.grid}>
            {photos.map((photo) => <SortablePhoto key={photo.id} photo={photo} onRemove={(id) => onChange(photos.filter((item) => item.id !== id))} />)}
            {photos.length < LIMIT && (
              <button type="button" className={styles.add} aria-label={t('eventPhotos.add')} onClick={() => inputRef.current?.click()}>
                <IconPlus size={24} color="#2563EB" />
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <input ref={inputRef} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => addFiles(event.target.files)} />
    </div>
  )
}
