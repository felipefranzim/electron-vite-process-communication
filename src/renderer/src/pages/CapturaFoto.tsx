import { useCommand } from '@renderer/hooks/useCommand'
import { useEffect, useState } from 'react'
import { CapturaFotoCommand } from '../../../shared/commands/capturaFotoCommand'
import { BackgroundRemovalStatus, useBackgroundRemoval } from '@renderer/hooks/useBackgroundRemoval'
import { boolean } from 'zod'

export function CapturaFoto(): React.JSX.Element {
    const { command } = useCommand<CapturaFotoCommand>()
    const { removeBackground, pluginResponse } = useBackgroundRemoval()
    const [isRemovingBackground, setIsRemovingBackground] = useState<boolean>(false)

    useEffect(() => {
        if (command) {
            console.log('CapturaFoto command received:', command)
            // Aqui você pode usar os dados do comando
            console.log('Camera utilizada:', command.cameraUtilizada)
            console.log('Dimensões:', command.larguraFoto, 'x', command.alturaFoto)
            console.log('DPI:', command.dpi)
            console.log('Configurações ICAO:', command.configuracoesIcao)
        }
    }, [command])

    useEffect(() => {
        setIsRemovingBackground(false)
    }, [pluginResponse])

    return (
        <div>
            {command && (
                <div>
                    <p>Câmera: {command.cameraUtilizada}</p>
                    <p>
                        Dimensões: {command.larguraFoto} x {command.alturaFoto}
                    </p>
                    <p>DPI: {command.dpi}</p>
                    <p>Upload habilitado: {command.uploadFotoHabilitado ? 'Sim' : 'Não'}</p>
                </div>
            )}
            <div className='flex flex-col justify-center items-center mt-10 gap-4'>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                            const result = reader.result
                            if (typeof result === 'string') {
                                // result é algo como "data:image/png;base64,AAAA..."
                                const base64 = result.split(',')[1] ?? result
                                removeBackground(base64)
                                setIsRemovingBackground(true)
                            }
                        }
                        reader.readAsDataURL(file)
                        // permitir reenviar o mesmo arquivo depois
                        e.currentTarget.value = ''
                    }}
                />
                <button
                    className='bg-black text-white p-1.5 rounded-md hover:cursor-pointer'
                    onClick={() => {
                        const input = document.getElementById(
                            'image-upload'
                        ) as HTMLInputElement | null
                        input?.click()
                    }}
                >
                    Upload imagem
                </button>

                {
                    isRemovingBackground && 
                    <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
                        <svg className="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24">
                            <path
                            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                            stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path
                            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                            stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
                            </path>
                        </svg>
                    </div>
                }

                {pluginResponse?.Status === BackgroundRemovalStatus.BackgroundRemoved && (
                    <img
                            src={`data:image/png;base64,${pluginResponse.Image}`}
                            alt="Removida"
                            width={300}
                        />
                )}
            </div>
        </div>
    )
}
