import type { Context } from '@maxhub/max-bot-api'
import { MessageKind } from './message-kind.js'

type MessageOptions = NonNullable<Parameters<Context['reply']>[1]>

export abstract class BotMessage {
  protected constructor(
    readonly kind: MessageKind,
    readonly text: string,
    readonly extra: MessageOptions = {},
  ) {}
}

export class PendingMessage extends BotMessage {
  constructor(text: string, extra: MessageOptions = {}) {
    super(MessageKind.Pending, text, extra)
  }
}

export class PersistentMessage extends BotMessage {
  constructor(text: string, extra: MessageOptions = {}) {
    super(MessageKind.Persistent, text, extra)
  }
}

export class TemporaryMessage extends BotMessage {
  constructor(text: string, extra: MessageOptions = {}) {
    super(MessageKind.Temporary, text, extra)
  }
}
