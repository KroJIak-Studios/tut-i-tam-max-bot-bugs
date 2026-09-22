import type { ChatResponse } from '../types'
import { getMapEvents } from './mapService'

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  // Simulate AI thinking and network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 500))

  const normalized = query.toLowerCase().trim()
  const events = await getMapEvents()

  // 1. Вечер / сегодня / куда пойти
  if (
    normalized.includes('вечер') ||
    normalized.includes('сегодня') ||
    normalized.includes('пойти') ||
    normalized.includes('набережн')
  ) {
    const event = events.find((e) => e.id === 'event-naberezhnaya')
    return {
      text: 'Рекомендую «Вечер на набережной»! Сегодня в 19:00 на Кремлёвской набережной. Живая музыка, уютная атмосфера у воды и красивый вид на Кремль.',
      event,
      suggestions: ['Что есть бесплатного рядом?', 'Куда сходить с детьми?', 'Есть волонтёрство?'],
    }
  }

  // 2. Бесплатно
  if (
    normalized.includes('бесплатн') ||
    normalized.includes('без денег') ||
    normalized.includes('халяв')
  ) {
    const event = events.find((e) => e.id === 'event-yoga-park')
    return {
      text: 'Отличный бесплатный вариант на свежем воздухе — «Йога на траве» в парке «Чёрное озеро»! Начало в 19:30, участие свободное для всех желающих.',
      event,
      suggestions: ['Куда пойти вечером?', 'Спортивные активности', 'Покажи что-нибудь рядом'],
    }
  }

  // 3. Дети / семья
  if (
    normalized.includes('дет') ||
    normalized.includes('ребён') ||
    normalized.includes('семь')
  ) {
    const event = events.find((e) => e.id === 'event-kremlin')
    return {
      text: 'Для семейной прогулки с детьми прекрасно подойдёт экскурсия «Тайны Казанского Кремля». Увлекательные легенды, древняя крепость и безопасная пешеходная зона.',
      event,
      suggestions: ['Куда пойти вечером?', 'Бесплатно рядом', 'Парки Казани'],
    }
  }

  // 4. Волонтёрство / экология
  if (
    normalized.includes('волонтёр') ||
    normalized.includes('эко') ||
    normalized.includes('помощ') ||
    normalized.includes('субботник')
  ) {
    const event = events.find((e) => e.id === 'event-volunteer-kazanka')
    return {
      text: 'Приглашаю присоединиться к эко-десанту «Чистая Казанка»! Сбор волонтёров для раздельного сбора и наведения порядка у береговой линии. Полезное дело и отличная команда.',
      event,
      suggestions: ['Спорт на воздухе', 'Бесплатно рядом', 'Куда сходить вечером?'],
    }
  }

  // 5. Спорт / тренировка
  if (
    normalized.includes('спорт') ||
    normalized.includes('стритбол') ||
    normalized.includes('баскетбол') ||
    normalized.includes('тренировк')
  ) {
    const event = events.find((e) => e.id === 'event-streetball')
    return {
      text: 'Для любителей спорта сегодня в 20:00 стартует открытый «Турнир 3х3 по стритболу» на корте «Трудовые резервы». Отличное покрытие, можно играть или поболеть!',
      event,
      suggestions: ['Йога в парке', 'Куда пойти вечером?', 'Что есть бесплатного?'],
    }
  }

  // 6. Рядом / близко / недалеко
  if (
    normalized.includes('ряд') ||
    normalized.includes('близк') ||
    normalized.includes('окол') ||
    normalized.includes('недалек')
  ) {
    const event = events.find((e) => e.id === 'event-user-boardgames')
    return {
      text: 'Недалеко от вас проходит уютная встреча «Настольные игры в кофейне». Играем в Catan и Кодовые имена, чай и печенье включены в компанию!',
      event,
      suggestions: ['Вечер на набережной', 'Что есть бесплатного?', 'Куда сходить с детьми?'],
    }
  }

  // 7. Культура / Пушкинская карта / лекции
  if (
    normalized.includes('культур') ||
    normalized.includes('лекци') ||
    normalized.includes('архитектур') ||
    normalized.includes('пушкин')
  ) {
    const event = events.find((e) => e.id === 'event-art-lecture')
    return {
      text: 'Ценителям культуры советую лекцию-дискуссию «Архитектура старой Казани». Доступна оплата по Пушкинской карте!',
      event,
      suggestions: ['Экскурсия в Кремль', 'Куда пойти вечером?', 'Бесплатно рядом'],
    }
  }

  // Fallback
  const defaultEvent = events.find((e) => e.id === 'event-naberezhnaya') || events[0]
  return {
    text: `Я подобрал для вас популярное событие на сегодня — «${defaultEvent?.title || 'Вечер на набережной'}». Могу также найти бесплатные варианты, активности с детьми или спортивные события рядом!`,
    event: defaultEvent,
    suggestions: ['Куда пойти вечером?', 'Что есть бесплатного рядом?', 'Куда сходить с детьми?', 'Есть волонтёрство?'],
  }
}
