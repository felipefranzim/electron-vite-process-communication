import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { WindowManager } from './windowManager'
import { PluginManager } from './pluginManager'
import { WebsocketServer } from './websocketServer'
import { PluginStartResult } from '../shared/types'

let tray: Tray | null = null
let isQuitting = false
let windowManager: WindowManager
let pluginManager: PluginManager
let mainWindow: BrowserWindow | null = null

function createSystemTray(): void {
    // Cria o ícone do tray (use um ícone . ico para Windows)
    const iconPath = join(__dirname, '../../resources/icon.png')
    tray = new Tray(iconPath)

    // Tooltip quando passar o mouse
    tray.setToolTip('V/Capture Hub')

    // Menu de contexto
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir',
            click: () => {
                mainWindow?.show()
                mainWindow?.focus()
            }
        },
        {
            label: 'Sair',
            click: async () => {
                isQuitting = true
                await pluginManager?.stopAllPlugins()
                app.quit()
            }
        }
    ])

    tray.setContextMenu(contextMenu)

    // Duplo clique no ícone abre a janela
    tray.on('double-click', () => {
        mainWindow?.show()
        mainWindow?.focus()
    })
}

async function createApplication(): Promise<void> {
    // Cria o system tray
    createSystemTray()

    // Inicia o PluginManager e carrega os plugins
    pluginManager = new PluginManager()
    pluginManager
        .loadPlugins()
        .then((plugins) => {
            console.log('Plugins carregados:', plugins)
        })
        .catch((error) => {
            console.error('Failed to load plugins:', error)
        })

    // Inicia a janela principal do Hub
    windowManager = new WindowManager(pluginManager)
    mainWindow = await windowManager.createMainWindow()

    mainWindow.on('close', (event) => {
        // Se não está saindo da aplicação, apenas minimiza para o tray
        if (!isQuitting) {
            event.preventDefault()
            mainWindow?.hide()

            // Mostra notificação no Windows
            if (tray) {
                tray.displayBalloon({
                    title: 'Sistema de Captura',
                    content: 'O aplicativo continua em execução na bandeja do sistema',
                    icon: nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
                })
            }
        }
    })

    // Inicia o servidor WebSocket
    const websocketServer = new WebsocketServer(windowManager)
    await websocketServer.startServer()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    ipcMain.on('open-secondary-window', async (_event, { title, route }) => {
        const secondaryWindow = await windowManager.createSecondaryWindow({ title, route })

        secondaryWindow.on('close', () => {
            console.log('Secondary window closed')
        })
    })

    ipcMain.on('start-plugin', async (event, { pluginName }) => {
        try {
            await pluginManager.startPlugin(pluginName)
            event.reply('start-plugin-result', { pluginName, success: true } as PluginStartResult)
        } catch (error) {
            event.reply('start-plugin-result', {
                pluginName,
                success: false,
                error: String(error)
            } as PluginStartResult)
        }
    })

    ipcMain.on('get-loaded-plugins', (event) => {
        const plugins = pluginManager.getPlugins()
        console.log('Sending plugins to renderer 2:', plugins)

        event.sender.send('plugins-loaded', plugins)
    })

    createApplication()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createApplication()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
