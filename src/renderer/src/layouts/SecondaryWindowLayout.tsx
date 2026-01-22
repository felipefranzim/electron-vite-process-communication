/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePluginStore } from '@renderer/stores/usePluginStore'
import { useEffect } from 'react'
import { Outlet } from 'react-router'

function SecondaryWindowLayout(): React.JSX.Element {
    const setPlugins = usePluginStore((state: any) => state.setPlugins)

    useEffect(() => {
        const handler = (_event: any, plugins: any): void => {
            console.log('Plugins loaded via event:', plugins)
            setPlugins(plugins)
        }

        window.electron.ipcRenderer.on('plugins-loaded', handler)
        // avisa o main quando o listener já existe
        window.electron.ipcRenderer.send('get-loaded-plugins')
    }, [setPlugins])

    return (
        <div>
            <div className="w-full h-16 bg-black border-b-red-500 border-b-4"></div>
            <Outlet />
        </div>
    )
}

export default SecondaryWindowLayout
