import type { Context } from '@maxhub/max-bot-api'
import { MessageKind } from './message-kind.js'

type MessageOptions = NonNullable<Parameters<Context['reply']>[1]>
type EditOptions = Parameters<Context['editMessage']>[0]

export class PrimaryMessage {
  readonly kind = MessageKind.Primary

  constructor(
    readonly text: string,
    readonly extra: MessageOptions,
  ) {}

  editOptions(): EditOptions {
    return {
      ...this.extra,
      text: this.text,
    }
  }
}
