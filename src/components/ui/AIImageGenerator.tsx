'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Loader2, Sparkles, Image as ImageIcon, Download, Trash2, RotateCcw } from 'lucide-react'

// Puter AI Image Models (Updated List)
const IMAGE_MODELS = [
  // Flux (Black Forest Labs)
  {
    id: 'black-forest-labs/FLUX.1-schnell-Free',
    name: 'FLUX.1 Schnell (Free)',
    provider: 'Black Forest',
  },
  { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX.1 Schnell', provider: 'Black Forest' },
  { id: 'black-forest-labs/FLUX.1-pro', name: 'FLUX.1 Pro', provider: 'Black Forest' },
  { id: 'black-forest-labs/FLUX.1.1-pro', name: 'FLUX.1.1 Pro', provider: 'Black Forest' },
  { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1 Dev', provider: 'Black Forest' },
  { id: 'black-forest-labs/FLUX.1-dev-lora', name: 'FLUX.1 Dev Lora', provider: 'Black Forest' },
  { id: 'black-forest-labs/FLUX.1-Canny-pro', name: 'FLUX.1 Canny Pro', provider: 'Black Forest' },
  {
    id: 'black-forest-labs/FLUX.1-kontext-dev',
    name: 'FLUX Kontext Dev',
    provider: 'Black Forest',
  },
  {
    id: 'black-forest-labs/FLUX.1-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest',
  },
  {
    id: 'black-forest-labs/FLUX.1-kontext-max',
    name: 'FLUX Kontext Max',
    provider: 'Black Forest',
  },
  { id: 'black-forest-labs/FLUX.1-krea-dev', name: 'FLUX Krea Dev', provider: 'Black Forest' },

  // OpenAI
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI' },
  { id: 'dall-e-2', name: 'DALL-E 2', provider: 'OpenAI' },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI' },
  { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'OpenAI' },
  { id: 'gpt-image-1-mini', name: 'GPT Image 1 Mini', provider: 'OpenAI' },

  // Google
  { id: 'google/imagen-4.0-ultra', name: 'Imagen 4.0 Ultra', provider: 'Google' },
  { id: 'google/imagen-4.0-preview', name: 'Imagen 4.0 Preview', provider: 'Google' },
  { id: 'google/imagen-4.0-fast', name: 'Imagen 4.0 Fast', provider: 'Google' },
  { id: 'google/flash-image-2.5', name: 'Flash Image 2.5', provider: 'Google' },
  { id: 'gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Preview', provider: 'Google' },

  // Stability AI
  { id: 'stabilityai/stable-diffusion-3-medium', name: 'SD 3 Medium', provider: 'Stability AI' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0', provider: 'Stability AI' },

  // ByteDance
  { id: 'ByteDance-Seed/Seedream-4.0', name: 'Seedream 4.0', provider: 'ByteDance' },
  { id: 'ByteDance-Seed/Seedream-3.0', name: 'Seedream 3.0', provider: 'ByteDance' },

  // HiDream
  { id: 'HiDream-ai/HiDream-I1-Full', name: 'HiDream I1 Full', provider: 'HiDream' },
  { id: 'HiDream-ai/HiDream-I1-Dev', name: 'HiDream I1 Dev', provider: 'HiDream' },
  { id: 'HiDream-ai/HiDream-I1-Fast', name: 'HiDream I1 Fast', provider: 'HiDream' },

  // Others
  { id: 'ideogram/ideogram-3.0', name: 'Ideogram 3.0', provider: 'Ideogram' },
  { id: 'Lykon/DreamShaper', name: 'DreamShaper', provider: 'Lykon' },
  { id: 'Qwen/Qwen-Image', name: 'Qwen Image', provider: 'Alibaba' },
  { id: 'RunDiffusion/Juggernaut-pro-flux', name: 'Juggernaut Pro Flux', provider: 'RunDiffusion' },
  {
    id: 'Rundiffusion/Juggernaut-Lightning-Flux',
    name: 'Juggernaut Lightning Flux',
    provider: 'RunDiffusion',
  },
]

interface AIImageGeneratorProps {
  onGenerated: (imageUrl: string) => void
  characterName?: string
}

declare global {
  interface Window {
    puter: any
  }
}

export function AIImageGenerator({ onGenerated, characterName }: AIImageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(
    characterName ? `An anime style portrait of ${characterName}` : ''
  )
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0]?.id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      if (!window.puter) {
        throw new Error('Puter SDK not loaded')
      }

      // puter.ai.txt2img returns an HTMLImageElement
      const imgElement = await window.puter.ai.txt2img(prompt, {
        model: selectedModel,
        disable_safety_checker: true,
      })

      // Convert HTMLImageElement src (usually a blob or base64) to a usable URL or just take its src
      const imageUrl = imgElement.src
      setGeneratedPreview(imageUrl)
    } catch (error) {
      console.error('Image generation error:', error)
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedPreview) return
    const link = document.createElement('a')
    link.href = generatedPreview
    link.download = `zabb-ai-generated-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClear = () => {
    setGeneratedPreview(null)
  }

  const handleApply = () => {
    if (generatedPreview) {
      onGenerated(generatedPreview)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Sparkles size={16} />
        สร้างด้วย AI
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="AI Image Generator (Puter)"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt (คำบรรยายรูปภาพ)</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="เช่น อนิเมะเด็กสาวผมยาวสีชมพูในชุดเมด..."
            />
            <p className="text-[10px] text-zabb-muted-fg">แนะนำให้ใช้ภาษาอังกฤษเพื่อผลลัพธ์ที่ดีที่สุด</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model (รุ่น AI)</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zabb-border bg-zabb-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zabb-fg"
            >
              {IMAGE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="aspect-square w-full max-w-[300px] mx-auto bg-zabb-muted rounded-xl border border-dashed border-zabb-border flex items-center justify-center overflow-hidden relative group">
              {generatedPreview ? (
                <img
                  src={generatedPreview}
                  alt="AI Generated"
                  className="w-full h-full object-cover"
                />
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-zabb-fg" size={32} />
                  <p className="text-sm text-zabb-muted-fg">กำลังสร้างรูปภาพ...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="text-zabb-muted-fg" size={32} />
                  <p className="text-sm text-zabb-muted-fg">รูปภาพจะปรากฏที่นี่</p>
                </div>
              )}
            </div>

            {generatedPreview && !isGenerating && (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download size={14} />
                  ดาวน์โหลด
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <RotateCcw size={14} />
                  ล้างรูป/สร้างใหม่
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zabb-border">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              ยกเลิก
            </Button>
            {generatedPreview ? (
              <Button onClick={handleApply}>ใช้รูปภาพนี้</Button>
            ) : (
              <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Sparkles className="mr-2" size={16} />
                )}
                สร้างรูปภาพ
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
