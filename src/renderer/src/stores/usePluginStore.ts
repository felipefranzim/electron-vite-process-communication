import { create } from 'zustand'
import { PluginManifest } from '@shared/types'

type PluginStore = {
    plugins: PluginManifest[]
    addPlugin: (plugin: PluginManifest) => void
    setPlugins: (plugins: PluginManifest[]) => void
    getPluginManifest: (pluginName: string) => PluginManifest | null
}

export const usePluginStore = create<PluginStore>((set, get) => ({
    plugins: [] as PluginManifest[],
    addPlugin: (plugin: PluginManifest) =>
        set((state) => ({
            plugins: [...state.plugins, plugin]
        })),
    setPlugins: (plugins: PluginManifest[]) =>
        set(() => ({
            plugins
        })),
    getPluginManifest: (pluginName: string): PluginManifest | null => {
        const plugin = get().plugins.find((p) => p.Name === pluginName)
        return plugin || null
    }
}))
