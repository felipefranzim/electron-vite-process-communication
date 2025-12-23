import { WebSocketServer as WSServer, WebSocket } from 'ws'
import { Command, CommandSchema } from '../shared/commandSchema'
import { CommandType } from '../shared/commandType'
import { WindowManager } from './windowManager'

export class WebsocketServer {
    private wss: WSServer | null = null

    constructor(private windowManager: WindowManager) {}

    async startServer(): Promise<void> {
        this.wss = new WSServer({ port: 9696 })

        this.wss.on('connection', (ws: WebSocket, request) => {
            const base = `ws://${request.headers.host ?? 'localhost'}`
            const fullUrl = new URL(request.url ?? '/', base)
            const route = fullUrl.pathname
            console.log('Client connected on route:', route)
            ;(ws as WebSocket & { route?: string }).route = route

            ws.on('message', async (data: Buffer) => {
                const message = JSON.parse(data.toString())
                const result = CommandSchema.safeParse(message)

                if (result.success) {
                    const command = result.data
                    await this.handleCommand(command, route)
                } else {
                    console.error('Invalid command received:', result.error)
                    ws.send(JSON.stringify({ error: result.error }))
                }
            })

            ws.on('close', () => {
                console.log('Client disconnected')
            })
        })

        console.log('WebSocket server started on ws://localhost:9696')
    }

    private async handleCommand(command: Command, route: string): Promise<void> {
        // Implement command handling logic here
        switch (command.commandType) {
            case CommandType.CapturaFoto:
                console.log('Handling CapturaFoto command:', command)
                this.windowManager.createSecondaryWindow({
                    title: 'Captura de Foto',
                    route: route,
                    command: command
                })
                break
            default:
                console.log('Unknown command type:', command.commandType)
        }
    }
}
