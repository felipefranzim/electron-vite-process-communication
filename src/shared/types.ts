export interface PluginStartResult {
    success: boolean
    error?: string
    pluginName: string
}

export interface PluginManifest {
    Name: string
    Version: string
    Description: string
    EntryPoint: string
    Protocol: string
    Endpoint: string
    Port: number
    Capabilities: string[]
}
