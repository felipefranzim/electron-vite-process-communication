import { usePlugin } from '@renderer/hooks/usePlugin'
import { useCommand } from '@renderer/hooks/useCommand'
import { useEffect } from 'react'
import { CapturaFotoCommand } from '../../../shared/commands/capturaFotoCommand'

export function CapturaFoto(): React.JSX.Element {
    const { command } = useCommand<CapturaFotoCommand>()

    const { startPlugin: startCameraPlugin } = usePlugin({
        pluginName: 'BackgroundRemoval1',
        onPluginStarted: (payload) => {
            console.log('BackgroundRemoval1 started with payload:', payload)
        }
    })

    const { startPlugin: startIcaoPlugin } = usePlugin({
        pluginName: 'BackgroundRemoval2',
        onPluginStarted: (payload) => {
            console.log('BackgroundRemoval2 started with payload:', payload)
        }
    })

    useEffect(() => {
        if (command) {
            console.log('CapturaFoto command received:', command)
            // Aqui você pode usar os dados do comando
            console.log('Camera utilizada:', command.cameraUtilizada)
            console.log('Dimensões:', command.larguraFoto, 'x', command.alturaFoto)
            console.log('DPI:', command.dpi)
            console.log('Configurações ICAO:', command.configuracoesIcao)

            // Iniciar os plugins com base no comando recebido
            startCameraPlugin()
            startIcaoPlugin()
        }
    }, [command, startCameraPlugin, startIcaoPlugin])

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
            <button onClick={startCameraPlugin}>Iniciar câmera</button>
            <button onClick={startIcaoPlugin}>Iniciar ICAO</button>
        </div>
    )
}
