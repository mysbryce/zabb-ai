'use client'

import { useZabbStore } from '@/store/useZabbStore'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Settings2, Cpu, Thermometer, Hash, Key, Plus, Trash2, Globe, Server } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const GROQ_MODELS = [
  { label: 'Kimi K2 Instruct', value: 'moonshotai/kimi-k2-instruct-0905' },
  { label: 'GPT-OSS 20B', value: 'openai/gpt-oss-20b' },
  { label: 'GPT-OSS 120B', value: 'openai/gpt-oss-120b' },
  { label: 'GPT-OSS Safeguard 20B', value: 'openai/gpt-oss-safeguard-20b' },
  { label: 'Llama 4 Scout 17B', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
]

const GOOGLE_MODELS = [
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
  { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useZabbStore((state) => state.settings)
  const updateAIConfig = useZabbStore((state) => state.updateAIConfig)
  const fetchConfig = useZabbStore((state) => state.fetchConfig)

  const [activeTab, setActiveTab] = useState<'general' | 'keys'>('general')

  useEffect(() => {
    if (isOpen) {
      fetchConfig()
    }
  }, [isOpen, fetchConfig])

  const handleAddKey = (provider: 'groq' | 'google') => {
    const keyProp = provider === 'groq' ? 'groqKeys' : 'googleKeys'
    const currentKeys = settings[keyProp] || []
    updateAIConfig({ [keyProp]: [...currentKeys, ''] })
  }

  const handleUpdateKey = (provider: 'groq' | 'google', index: number, value: string) => {
    const keyProp = provider === 'groq' ? 'groqKeys' : 'googleKeys'
    const currentKeys = [...(settings[keyProp] || [])]
    currentKeys[index] = value
    updateAIConfig({ [keyProp]: currentKeys })
  }

  const handleRemoveKey = (provider: 'groq' | 'google', index: number) => {
    const keyProp = provider === 'groq' ? 'groqKeys' : 'googleKeys'
    const currentKeys = settings[keyProp].filter((_, i) => i !== index)
    updateAIConfig({ [keyProp]: currentKeys })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Engine Settings" size="lg">
      <div className="flex gap-6 py-2">
        {/* Sidebar Tabs */}
        <div className="w-40 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === 'general' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Settings2 size={14} />
            General
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === 'keys' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Key size={14} />
            API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8 min-h-[400px]">
          {activeTab === 'general' ? (
            <>
              {/* Provider Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Server size={12} />
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['groq', 'google'].map((p) => (
                    <button
                      key={p}
                      onClick={() => updateAIConfig({ provider: p as any })}
                      className={`px-4 py-3 rounded-xl border transition-all text-sm font-bold capitalize ${
                        settings.provider === p
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Cpu size={12} />
                  {settings.provider === 'groq' ? 'Groq' : 'Google'} Model Selection
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(settings.provider === 'groq' ? GROQ_MODELS : GOOGLE_MODELS).map((m) => (
                    <button
                      key={m.value}
                      onClick={() => updateAIConfig({ [settings.provider === 'groq' ? 'groqModel' : 'googleModel']: m.value })}
                      className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        (settings.provider === 'groq' ? settings.groqModel : settings.googleModel) === m.value
                          ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {m.label}
                      <div className={`text-[9px] mt-0.5 opacity-50 ${
                        (settings.provider === 'groq' ? settings.groqModel : settings.googleModel) === m.value ? 'text-black' : 'text-white'
                      }`}>
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
                  onChange={(e) => updateAIConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
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
                  onChange={(e) => updateAIConfig({ maxTokens: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 focus:border-white/30 h-12"
                />
              </div>
            </>
          ) : (
            <div className="space-y-8">
              {/* Groq Keys */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    Groq API Keys (Fallback Support)
                  </label>
                  <button
                    onClick={() => handleAddKey('groq')}
                    className="p-1 hover:bg-white/10 rounded text-white/60"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.groqKeys.map((key, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter Groq API Key"
                        value={key}
                        onChange={(e) => handleUpdateKey('groq', i, e.target.value)}
                        className="bg-white/5 border-white/10 h-10 text-xs"
                      />
                      <button
                        onClick={() => handleRemoveKey('groq', i)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {settings.groqKeys.length === 0 && (
                    <p className="text-[10px] text-white/20 italic">No keys added. Click + to add.</p>
                  )}
                </div>
              </div>

              {/* Google Keys */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    Google AI Keys (Fallback Support)
                  </label>
                  <button
                    onClick={() => handleAddKey('google')}
                    className="p-1 hover:bg-white/10 rounded text-white/60"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.googleKeys.map((key, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter Google API Key"
                        value={key}
                        onChange={(e) => handleUpdateKey('google', i, e.target.value)}
                        className="bg-white/5 border-white/10 h-10 text-xs"
                      />
                      <button
                        onClick={() => handleRemoveKey('google', i)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {settings.googleKeys.length === 0 && (
                    <p className="text-[10px] text-white/20 italic">No keys added. Click + to add.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-end">
        <Button onClick={onClose} className="bg-white text-black px-8 rounded-full font-bold">
          Done
        </Button>
      </div>
    </Modal>
  )
}

