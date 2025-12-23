import { useEffect } from 'react'
import { PluginStartResult } from '@shared/types'

interface UsePluginReturn {
    startPlugin: () => void
}

export function usePlugin({
    pluginName,
    onPluginStarted
}: {
    pluginName: string
    onPluginStarted: (payload: PluginStartResult) => void
}): UsePluginReturn {
    const startPlugin = (): void =>
        window.electron.ipcRenderer.send('start-plugin', {
            pluginName
        })

    useEffect(() => {
        return () => {
            window.electron.ipcRenderer.send('stop-plugin', {
                pluginName
            })
            console.log(`Plugin ${pluginName} stopped on unmount`)
        }
    }, [pluginName])

    useEffect(() => {
        const handler = (_event, _payload: PluginStartResult): void => {
            console.log('Plugin start result received:', _payload)
            onPluginStarted(_payload)
        }

        window.electron.ipcRenderer.on('start-plugin-result', handler)

        // Cleanup: remove o listener quando o componente for desmontado
        return () => {
            window.electron.ipcRenderer.removeListener('start-plugin-result', handler)
        }
    }, [onPluginStarted])

    return { startPlugin }
}
