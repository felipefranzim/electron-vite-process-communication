import { z } from 'zod'
import { CaracteristicaIcao } from '../enums'
import { CommandType } from '../commandType'

export const ConfiguracoesIcaoSchema = z.object({
  icaoHabilitado: z.boolean(),
  componenteIcaoUtilizado: z.number().int().nonnegative(),
  permiteFotoInvalidadaPeloIcao: z.boolean(),
  precisaDeAutorizacaoParaUtilizarFotoInvalidadaPeloIcao: z.boolean(),
  quantidadeMaximaTentativasIcao: z.number().int().nonnegative(),
  caracteristicasParaValidacao: z.array(z.nativeEnum(CaracteristicaIcao))
})

export const CapturaFotoCommandSchema = z.object({
  commandType: z.literal(CommandType.CapturaFoto),
  cameraUtilizada: z.number().int().nonnegative(),
  uploadFotoHabilitado: z.boolean(),
  precisaDeAutorizacaoParaModoRecorte: z.boolean(),
  larguraFoto: z.number().int().nonnegative(),
  alturaFoto: z.number().int().nonnegative(),
  dpi: z.number().int().nonnegative(),
  configuracoesIcao: ConfiguracoesIcaoSchema.nullable()
})

export type CapturaFotoCommand = z.infer<typeof CapturaFotoCommandSchema>
export type ConfiguracoesIcao = z.infer<typeof ConfiguracoesIcaoSchema>
