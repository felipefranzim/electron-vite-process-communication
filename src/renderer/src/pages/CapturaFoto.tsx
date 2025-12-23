import { usePlugin } from '@renderer/hooks/usePlugin'
import { useEffect } from 'react'

export function CapturaFoto(): React.JSX.Element {
    const { startPlugin: startBackgroundRemoval } = usePlugin({
        pluginName: 'BackgroundRemoval1',
        onPluginStarted: (payload) => {
            console.log('BackgroundRemoval1 started with payload:', payload)
        }
    })

    const { startPlugin: startBackgroundRemoval2 } = usePlugin({
        pluginName: 'BackgroundRemoval2',
        onPluginStarted: (payload) => {
            console.log('BackgroundRemoval2 started with payload:', payload)
        }
    })

    useEffect(() => {
        startBackgroundRemoval()
        startBackgroundRemoval2()
    }, [])

    return (
        <div>
            <h1>Captura de Foto</h1>
            <button onClick={startBackgroundRemoval}>Iniciar Captura</button>
            <button onClick={startBackgroundRemoval2}>Iniciar Captura 2</button>
        </div>
    )
}
