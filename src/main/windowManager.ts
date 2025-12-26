import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { Command } from '../shared/commandSchema'
import { PluginManager } from './pluginManager'

interface WindowProps {
    title: string
    route: string
    command?: Command
}

export class WindowManager {
    private isDev = process.env.NODE_ENV === 'development'
    private pluginManager: PluginManager

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager
    }

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

        // Envia os plugins quando o conteúdo web estiver completamente carregado
        mainWindow.webContents.once('did-finish-load', () => {
            const plugins = this.pluginManager.getPlugins()
            console.log('Sending plugins to renderer:', plugins)
            mainWindow.webContents.send('plugins-loaded', plugins)
        })

        if (this.isDev && process.env['ELECTRON_RENDERER_URL']) {
            mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
            mainWindow.webContents.openDevTools()
        } else {
            mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        }

        return mainWindow
    }

    async createSecondaryWindow({ title, route, command }: WindowProps): Promise<BrowserWindow> {
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

            // Envia o comando para a janela quando ela estiver pronta
            if (command) {
                secondaryWindow.webContents.send('command-received', command)
            }
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
