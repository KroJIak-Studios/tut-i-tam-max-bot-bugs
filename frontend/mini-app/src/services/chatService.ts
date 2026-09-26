import type { ChatResponse } from '../types'
import { getMapEvents } from './mapService'
import { i18n } from '../i18n'

export async function sendChatMessage(query: string, locale?: string): Promise<ChatResponse> {
  // Simulate AI thinking and network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 500))

  const isEn = (locale || i18n.language)?.startsWith('en')
  const normalized = query.toLowerCase().trim()
  const events = await getMapEvents()

  // 1. Вечер / сегодня / куда пойти / evening
  if (
    normalized === 'evening' ||
    normalized.includes('вечер') ||
    normalized.includes('сегодня') ||
    normalized.includes('пойти') ||
    normalized.includes('набережн') ||
    normalized.includes('evening') ||
    normalized.includes('tonight')
  ) {
    const event = events.find((e) => e.id === 'event-naberezhnaya')
    return {
      text: isEn
        ? 'I recommend «Вечер на набережной»! Tonight at 7:00 PM on the Kremlin Embankment. Live music, cozy riverside vibe, and great views of the Kremlin.'
        : 'Рекомендую «Вечер на набережной»! Сегодня в 19:00 на Кремлёвской набережной. Живая музыка, уютная атмосфера у воды и красивый вид на Кремль.',
      event,
      suggestions: ['free', 'kids', 'volunteer'],
    }
  }

  // 2. Бесплатно / free
  if (
    normalized === 'free' ||
    normalized.includes('бесплатн') ||
    normalized.includes('без денег') ||
    normalized.includes('халяв') ||
    normalized.includes('free')
  ) {
    const event = events.find((e) => e.id === 'event-yoga-park')
    return {
      text: isEn
        ? 'A great free outdoor option is «Йога на траве» in Black Lake Park! Starts at 7:30 PM, open to everyone.'
        : 'Отличный бесплатный вариант на свежем воздухе — «Йога на траве» в парке «Чёрное озеро»! Начало в 19:30, участие свободное для всех желающих.',
      event,
      suggestions: ['evening', 'sports', 'nearby'],
    }
  }

  // 3. Дети / семья / kids / family
  if (
    normalized === 'kids' ||
    normalized.includes('дет') ||
    normalized.includes('ребён') ||
    normalized.includes('семь') ||
    normalized.includes('kid') ||
    normalized.includes('child') ||
    normalized.includes('family')
  ) {
    const event = events.find((e) => e.id === 'event-kremlin')
    return {
      text: isEn
        ? 'For a family walk with children, «Тайны Казанского Кремля» tour is a great fit. Engaging legends, ancient fortress, and safe pedestrian grounds.'
        : 'Для семейной прогулки с детьми прекрасно подойдёт экскурсия «Тайны Казанского Кремля». Увлекательные легенды, древняя крепость и безопасная пешеходная зона.',
      event,
      suggestions: ['evening', 'free', 'nearby'],
    }
  }

  // 4. Волонтёрство / экология / volunteer
  if (
    normalized === 'volunteer' ||
    normalized.includes('волонтёр') ||
    normalized.includes('эко') ||
    normalized.includes('помощ') ||
    normalized.includes('субботник') ||
    normalized.includes('volunteer')
  ) {
    const event = events.find((e) => e.id === 'event-volunteer-kazanka')
    return {
      text: isEn
        ? 'Join the «Чистая Казанка» eco-landing! Gathering volunteers for waste sorting and shoreline cleanup. Meaningful cause and an awesome team.'
        : 'Приглашаю присоединиться к эко-десанту «Чистая Казанка»! Сбор волонтёров для раздельного сбора и наведения порядка у береговой линии. Полезное дело и отличная команда.',
      event,
      suggestions: ['sports', 'free', 'evening'],
    }
  }

  // 5. Спорт / тренировка / sports
  if (
    normalized === 'sports' ||
    normalized.includes('спорт') ||
    normalized.includes('стритбол') ||
    normalized.includes('баскетбол') ||
    normalized.includes('тренировк') ||
    normalized.includes('sport') ||
    normalized.includes('workout')
  ) {
    const event = events.find((e) => e.id === 'event-streetball')
    return {
      text: isEn
        ? 'For sports enthusiasts, open «Турнир 3х3 по стритболу» kicks off at 8:00 PM at Trudovye Rezervy court. Great court, join to play or cheer!'
        : 'Для любителей спорта сегодня в 20:00 стартует открытый «Турнир 3х3 по стритболу» на корте «Трудовые резервы». Отличное покрытие, можно играть или поболеть!',
      event,
      suggestions: ['evening', 'free', 'nearby'],
    }
  }

  // 6. Рядом / близко / недалеко / nearby
  if (
    normalized === 'nearby' ||
    normalized.includes('ряд') ||
    normalized.includes('близк') ||
    normalized.includes('окол') ||
    normalized.includes('недалек') ||
    normalized.includes('near') ||
    normalized.includes('close')
  ) {
    const event = events.find((e) => e.id === 'event-user-boardgames')
    return {
      text: isEn
        ? 'Nearby is a cozy gathering «Настольные игры в кофейне». Playing Catan and Codenames, tea and cookies included!'
        : 'Недалеко от вас проходит уютная встреча «Настольные игры в кофейне». Играем в Catan и Кодовые имена, чай и печенье включены в компанию!',
      event,
      suggestions: ['evening', 'free', 'kids'],
    }
  }

  // 7. Культура / Пушкинская карта / лекции / culture
  if (
    normalized === 'culture' ||
    normalized.includes('культур') ||
    normalized.includes('лекци') ||
    normalized.includes('архитектур') ||
    normalized.includes('пушкин') ||
    normalized.includes('cultur') ||
    normalized.includes('pushkin') ||
    normalized.includes('lecture')
  ) {
    const event = events.find((e) => e.id === 'event-art-lecture')
    return {
      text: isEn
        ? 'For culture enthusiasts, I recommend lecture and discussion «Архитектура старой Казани». Eligible for Pushkin Card!'
        : 'Ценителям культуры советую лекцию-дискуссию «Архитектура старой Казани». Доступна оплата по Пушкинской карте!',
      event,
      suggestions: ['evening', 'free', 'nearby'],
    }
  }

  // Fallback
  const defaultEvent = events.find((e) => e.id === 'event-naberezhnaya') || events[0]
  return {
    text: isEn
      ? `I selected a popular event for you today — «${defaultEvent?.title || 'Вечер на набережной'}». I can also find free options, family activities, or sports events nearby!`
      : `Я подобрал для вас популярное событие на сегодня — «${defaultEvent?.title || 'Вечер на набережной'}». Могу также найти бесплатные варианты, активности с детьми или спортивные события рядом!`,
    event: defaultEvent,
    suggestions: ['evening', 'free', 'kids', 'volunteer'],
  }
}
