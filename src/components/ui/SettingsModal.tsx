'use client'

import { useZabbStore } from '@/store/useZabbStore'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Settings2, Cpu, Thermometer, Hash } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const MODELS = [
  { label: 'Kimi K2 Instruct', value: 'moonshotai/kimi-k2-instruct-0905' },
  { label: 'GPT OSS 20B', value: 'openai/gpt-oss-20b' },
  { label: 'GPT OSS 120B', value: 'openai/gpt-oss-120b' },
  { label: 'GPT OSS Safeguard 20B', value: 'openai/gpt-oss-safeguard-20b' },
  { label: 'Llama 4 Scout 17B', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useZabbStore((state) => state.settings)
  const updateSettings = useZabbStore((state) => state.updateSettings)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Engine Settings" size="md">
      <div className="space-y-8 py-2">
        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Cpu size={12} />
            Model Selection
          </label>
          <div className="grid grid-cols-1 gap-2">
            {MODELS.map((m) => (
              <button
                key={m.value}
                onClick={() => updateSettings({ model: m.value })}
                className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                  settings.model === m.value
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                {m.label}
                <div className={`text-[9px] mt-0.5 opacity-50 ${settings.model === m.value ? 'text-black' : 'text-white'}`}>
                  {m.value}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Thermometer size={12} />
              Creativity (Temperature)
            </label>
            <span className="text-xs font-bold text-white/80">{settings.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={settings.temperature}
            onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[9px] text-white/20 uppercase font-bold tracking-widest">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Hash size={12} />
            Max Length (Tokens)
          </label>
          <Input
            type="number"
            value={settings.maxTokens}
            onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
            className="bg-white/5 border-white/10 focus:border-white/30 h-12"
          />
          <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-tighter">
            Higher values allow for longer responses but may increase latency.
          </p>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <Button onClick={onClose} className="bg-white text-black px-8 rounded-full font-bold">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
