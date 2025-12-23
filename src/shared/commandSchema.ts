import { z } from 'zod'
import { CapturaFotoCommandSchema } from './commands/capturaFotoCommand'

export const CommandSchema = z.discriminatedUnion('commandType', [CapturaFotoCommandSchema])

export type Command = z.infer<typeof CommandSchema>
