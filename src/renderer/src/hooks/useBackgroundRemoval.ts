/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import { usePlugin } from './usePlugin'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { usePluginStore } from '@renderer/stores/usePluginStore'

export interface RemoveBackgroundCommand {
    Type: string
    Image: string
    Engine: string
}

export interface RemoveBackgroundResponse {
    Status: number
    Image: string
}

export function useBackgroundRemoval(): {
    removeBackground: (imageData: string) => void
    imagemComFundoRemovido: RemoveBackgroundResponse | null
    readyState: ReadyState
} {
    const ref = useRef<boolean>(false)
    const pluginManifest = usePluginStore((state) => state.getPluginManifest('BackgroundRemoval'))
    const plugins = usePluginStore((state) => state.plugins)

    const [pluginStarted, setPluginStarted] = useState<boolean>(false)
    const [wsUrl, setWsUrl] = useState<string | null>(null)
    const [imagemComFundoRemovido, setImagemComFundoRemovido] =
        useState<RemoveBackgroundResponse | null>(null)
    const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl, {
        shouldReconnect: () => true,
        onOpen: () => {
            console.log('WebSocket connection opened for Background Removal Plugin')
        },
        onError: (event) => {
            console.error('WebSocket error for Background Removal Plugin:', event)
        }
    })

    const { startPlugin } = usePlugin({
        pluginName: 'BackgroundRemoval',
        onPluginStarted: (payload) => {
            console.log('Background Removal Plugin started with payload:', payload)
            setPluginStarted(true)
        }
    })

    useEffect(() => {
        console.log('Plugins changed:', plugins)
    }, [plugins])

    useEffect(() => {
        if (!ref.current) {
            ref.current = true
            startPlugin()
        }
    }, [startPlugin])

    useEffect(() => {
        console.log('pluginManifest or pluginStarted changed:', {
            pluginManifest,
            pluginStarted
        })
        if (pluginManifest && pluginStarted) {
            console.log('Setting WebSocket URL for Background Removal Plugin')
            setWsUrl(`ws://localhost:${pluginManifest?.Port}/${pluginManifest?.Endpoint}`)
        }
    }, [pluginManifest, pluginStarted])

    useEffect(() => {
        if (lastMessage && lastMessage.data) {
            console.log('Received message from Background Removal Plugin:', lastMessage.data)
            const response = JSON.parse(lastMessage.data) as RemoveBackgroundResponse
            if (response.Status === 200) {
                setImagemComFundoRemovido(response)
            }
        }
    }, [lastMessage])

    function removeBackground(imageData: string): void {
        const command = {
            Image: imageData,
            Type: 'RemoveBackgroundCommand',
            Engine: 'modnet'
        } as RemoveBackgroundCommand
        sendMessage(JSON.stringify(command))
        console.log('removeBackground called with imageData', command)
    }

    return { removeBackground, imagemComFundoRemovido, readyState }
}
