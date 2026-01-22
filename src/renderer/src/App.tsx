/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { usePluginStore } from './stores/usePluginStore'

function App(): React.JSX.Element {
    const setPlugins = usePluginStore((state: any) => state.setPlugins)
    const plugins = usePluginStore((state) => state.plugins)

    window.electron.ipcRenderer.on('plugins-loaded', (_event, plugins) => {
        console.log('Plugins loaded via event:', plugins)
        setPlugins(plugins)
    })

    useEffect(() => {
        // avisa o main quando o listener já existe
        window.electron.ipcRenderer.send('get-loaded-plugins')
    }, [setPlugins])

    return (
        <>
            <img alt="logo" className="logo" src={electronLogo} />
            <div className="creator">Powered by electron-vite</div>
            <div className="text">
                Build an Electron app with <span className="react">React</span>
                &nbsp;and <span className="ts">TypeScript</span>
            </div>
            <p className="tip">
                Please try pressing <code>F12</code> to open the devTool
            </p>
            <div className="actions">
                <div className="action">
                    <a target="_blank" rel="noreferrer">
                        Start Plugin
                    </a>
                </div>
                <div className="action">
                    <a target="_blank" rel="noreferrer">
                        Send IPC
                    </a>
                </div>
            </div>
            <Versions></Versions>
            {plugins && plugins.length > 0 ? (
                <div className="plugin-list">
                    <h2>Loaded Plugins:</h2>
                    <ul>
                        {plugins.map((plugin: any) => (
                            <li key={plugin.Name}>
                                {plugin.Name} - {plugin.Version}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>No plugins loaded.</div>
            )}
        </>
    )
}

export default App
