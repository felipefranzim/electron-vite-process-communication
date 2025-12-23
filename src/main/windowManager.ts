import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

interface WindowProps {
    title: string
    route: string
}

export class WindowManager {
    private isDev = process.env.NODE_ENV === 'development'

    async createMainWindow(): Promise<BrowserWindow> {
        const mainWindow = new BrowserWindow({
            title: 'V/Capture Hub',
            width: 900,
            height: 670,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            },
            frame: true,
            show: false // Não mostra até estar pronto
        })

        // Mostra a janela quando estiver pronta
        mainWindow.once('ready-to-show', () => {
            mainWindow.show()
        })

        if (this.isDev && process.env['ELECTRON_RENDERER_URL']) {
            mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
            mainWindow.webContents.openDevTools()
        } else {
            mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        }

        return mainWindow
    }

    async createSecondaryWindow({ title, route }: WindowProps): Promise<BrowserWindow> {
        const display = screen.getPrimaryDisplay()
        const { width, height } = display.workAreaSize

        const secondaryWindow = new BrowserWindow({
            title: title,
            width: 900,
            height: 700,
            x: Math.floor((width - 900) / 2),
            y: Math.floor((height - 700) / 2),
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            },
            frame: true,
            modal: false,
            parent: undefined, // Janela desacoplada
            show: false, // Não mostra até estar pronto
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            alwaysOnTop: true // Mantém sempre visível
        })

        // Mostra a janela quando estiver pronta
        secondaryWindow.once('ready-to-show', () => {
            secondaryWindow.show()
        })

        if (this.isDev && process.env['ELECTRON_RENDERER_URL']) {
            secondaryWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${route}?arg1=${1}`)
            secondaryWindow.webContents.openDevTools()
        } else {
            secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'), {
                hash: `${route}?arg1=${1}`
            })
        }

        return secondaryWindow
    }
}
