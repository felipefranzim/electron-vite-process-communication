import { useEffect, useState } from 'react'
import { Command } from '@shared/commandSchema'

export function useCommand<T extends Command>(): { command: T | null } {
    const [command, setCommand] = useState<T | null>(null)

    useEffect(() => {
        const handleCommand = (_event: unknown, receivedCommand: T): void => {
            console.log('Command received in renderer:', receivedCommand)
            setCommand(receivedCommand)
        }

        window.electron.ipcRenderer.on('command-received', handleCommand)

        return () => {
            window.electron.ipcRenderer.removeListener('command-received', handleCommand)
        }
    }, [])

    return { command }
}
