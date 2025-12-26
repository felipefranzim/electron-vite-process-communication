import { useCommand } from '@renderer/hooks/useCommand'
import { useEffect } from 'react'
import { CapturaFotoCommand } from '../../../shared/commands/capturaFotoCommand'
import { useBackgroundRemoval } from '@renderer/hooks/useBackgroundRemoval'

export function CapturaFoto(): React.JSX.Element {
    const { command } = useCommand<CapturaFotoCommand>()
    const { removeBackground, imagemComFundoRemovido } = useBackgroundRemoval()

    useEffect(() => {
        if (command) {
            console.log('CapturaFoto command received:', command)
            // Aqui você pode usar os dados do comando
            console.log('Camera utilizada:', command.cameraUtilizada)
            console.log('Dimensões:', command.larguraFoto, 'x', command.alturaFoto)
            console.log('DPI:', command.dpi)
            console.log('Configurações ICAO:', command.configuracoesIcao)
        }
    }, [command])

    return (
        <div>
            <h1>Captura de Foto</h1>
            {command && (
                <div>
                    <p>Câmera: {command.cameraUtilizada}</p>
                    <p>
                        Dimensões: {command.larguraFoto} x {command.alturaFoto}
                    </p>
                    <p>DPI: {command.dpi}</p>
                    <p>Upload habilitado: {command.uploadFotoHabilitado ? 'Sim' : 'Não'}</p>
                </div>
            )}
            <div>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                            const result = reader.result
                            if (typeof result === 'string') {
                                // result é algo como "data:image/png;base64,AAAA..."
                                const base64 = result.split(',')[1] ?? result
                                removeBackground(base64)
                            }
                        }
                        reader.readAsDataURL(file)
                        // permitir reenviar o mesmo arquivo depois
                        e.currentTarget.value = ''
                    }}
                />
                <button
                    onClick={() => {
                        const input = document.getElementById(
                            'image-upload'
                        ) as HTMLInputElement | null
                        input?.click()
                    }}
                >
                    Upload imagem
                </button>

                {imagemComFundoRemovido && (
                    <div>
                        <h3>Imagem com fundo removido</h3>
                        <img
                            src={`data:image/png;base64,${imagemComFundoRemovido}`}
                            alt="Removida"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
