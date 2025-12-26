import { spawn, ChildProcess } from 'child_process'
import { env } from 'process'
import { join } from 'path'
import { PluginManifest } from '../shared/types'

export class PluginManager {
    private processes: Map<string, ChildProcess> = new Map()
    private plugins: PluginManifest[] = []

    private localAppData: string | undefined =
        env.LOCALAPPDATA ||
        (env.APPDATA ? env.APPDATA.replace(/\\Roaming(\\|$)/i, '\\Local$1') : undefined)

    async loadPlugins(): Promise<PluginManifest[]> {
        if (!this.localAppData) throw new Error('LOCALAPPDATA not found')

        const pluginsPath = join(this.localAppData, 'Valid Capture Hub', 'Plugins')
        console.log('Loading plugins from path:', pluginsPath)
        try {
            const { readdir, readFile } = await import('fs/promises')
            const dirents = await readdir(pluginsPath, { withFileTypes: true })
            const folders = dirents.filter((d) => d.isDirectory()).map((d) => d.name)

            const results = await Promise.allSettled(
                folders.map(async (name) => {
                    const manifestPath = join(pluginsPath, name, 'Manifest.json')
                    const content = await readFile(manifestPath, 'utf8')
                    const manifest = JSON.parse(content) as PluginManifest
                    console.log(`Manifest de ${name}:`, manifest)
                    return manifest
                })
            )

            const manifests = results
                .filter((r) => r.status === 'fulfilled')
                .map((r) => (r as PromiseFulfilledResult<PluginManifest>).value)

            results
                .filter((r) => r.status === 'rejected')
                .forEach((r) =>
                    console.error('Erro ao ler Manifest.json:', (r as PromiseRejectedResult).reason)
                )

            this.plugins.push(...manifests)
            return manifests
        } catch (error) {
            console.error(`Erro ao listar pastas em ${pluginsPath}:`, error)
            throw error // ou return [] se preferir não lançar
        }
    }

    getPlugins(): PluginManifest[] {
        return this.plugins
    }

    getPluginManifest(pluginName: string): PluginManifest | null {
        console.log(this.plugins)
        console.log('Procurando plugin:', pluginName)
        const plugin = this.plugins.find((p) => p.Name === pluginName)
        return plugin || null
    }

    async startPlugin(pluginName: string): Promise<void> {
        const manifest = this.getPluginManifest(pluginName)
        if (!manifest) {
            throw new Error(`Plugin manifest for ${pluginName} not found`)
        }

        if (!this.localAppData) throw new Error('LOCALAPPDATA not found')

        const pluginPath = join(
            this.localAppData,
            'Valid Capture Hub',
            'Plugins',
            pluginName,
            manifest.EntryPoint
        )

        return new Promise((resolve, reject) => {
            try {
                const process = spawn(pluginPath, [`--port=${manifest.Port}`])

                if (this.processes.has(pluginName)) {
                    console.warn(`Plugin with name ${pluginName} is already running.`)
                    reject(new Error(`Plugin with name ${pluginName} is already running.`))
                    return
                }

                process.on('error', (error) => {
                    console.error(`Erro ao iniciar plugin ${pluginName}:`, error)
                    reject(error)
                })

                process.on('exit', (code, signal) => {
                    console.log(`Plugin ${pluginName} saiu com código ${code} e sinal ${signal}`)
                    this.processes.delete(pluginName)
                })

                process.on('spawn', () => {
                    console.log(`Plugin ${pluginName} iniciado com sucesso.`)
                    this.processes.set(pluginName, process)
                    resolve()
                })

                process.stdout?.on('data', (data) => {
                    console.log(`[Plugin ${pluginName}]:  ${data}`)
                })

                process.stderr?.on('data', (data) => {
                    console.error(`[Plugin ${pluginName} ERROR]: ${data}`)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    async stopPlugin(pluginName: string): Promise<void> {
        const process = this.processes.get(pluginName)
        if (!process) {
            throw new Error(`Plugin with name ${pluginName} is not running.`)
        }

        process.kill()
        // Não precisa remover da lista de process,
        // pois isso já é feito no evento on 'exit'
        // do processo (metodo startPlugin)
    }

    async stopAllPlugins(): Promise<void> {
        for (const [pluginName, process] of this.processes) {
            process.kill()
            console.log(`Plugin ${pluginName} stopped.`)
        }
        this.processes.clear()
    }
}
