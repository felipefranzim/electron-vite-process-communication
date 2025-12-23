
export interface PluginManifest {
    name: string;
    version: string;
    description: string;
    entryPoint: string;
    protocol: string;
    endpoint: string;
    port: number;
    capabilities: string[];
}
