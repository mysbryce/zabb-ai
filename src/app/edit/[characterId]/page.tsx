'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useZabbStore } from '@/store/useZabbStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { AIGenerator } from '@/components/ui/AIGenerator'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ characterId: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const characterId = resolvedParams.characterId
  
  const characters = useZabbStore((state) => state.characters)
  const updateCharacter = useZabbStore((state) => state.updateCharacter)

  const [hasHydrated, setHasHydrated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    age: '',
    gender: '',
    personality: '',
    appearance: '',
    background: '',
    startingSituation: '',
  })

  // Handle hydration
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  const character = characters.find((c) => c.id === characterId)

  useEffect(() => {
    if (hasHydrated) {
      if (character) {
        setFormData({
          name: character.name,
          avatar: character.avatar,
          age: character.age,
          gender: character.gender,
          personality: character.personality,
          appearance: character.appearance,
          background: character.background,
          startingSituation: character.startingSituation,
        })
      } else {
        router.push('/')
      }
    }
  }, [hasHydrated, character, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar: url }))
  }

  const handleAIGenerated = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.startingSituation.trim()) return

    updateCharacter(characterId, formData)
    router.push('/')
  }

  if (!hasHydrated || !character) {
    return (
      <div className="flex h-screen items-center justify-center bg-zabb-bg">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8 font-sarabun"
    >
      <div className="mb-8 border-b border-zabb-border pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="px-2">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold italic tracking-tighter uppercase text-white">Edit Character</h1>
        </div>
        <AIGenerator type="character" onGenerated={handleAIGenerated} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <ImageUpload 
            label="Avatar" 
            onUploadSuccess={handleUploadSuccess} 
            currentUrl={formData.avatar}
          />

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 mb-2 block">Identity</label>
              <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Name" className="bg-white/5 border-white/5 h-12 rounded-xl text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="bg-white/5 border-white/5 h-12 rounded-xl text-white" />
              <Input name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" className="bg-white/5 border-white/5 h-12 rounded-xl text-white" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 block text-white">Traits & Narrative</label>
            <Textarea name="personality" value={formData.personality} onChange={handleChange} placeholder="Personality traits..." className="bg-white/5 border-white/5 min-h-[100px] rounded-xl text-white" />
            <Textarea name="appearance" value={formData.appearance} onChange={handleChange} placeholder="Physical appearance..." className="bg-white/5 border-white/5 min-h-[100px] rounded-xl text-white" />
            <Textarea name="background" value={formData.background} onChange={handleChange} placeholder="Background story..." className="bg-white/5 border-white/5 min-h-[100px] rounded-xl text-white" />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 block text-white">Scene Setup</label>
            <Textarea name="startingSituation" value={formData.startingSituation} onChange={handleChange} required placeholder="Starting Situation..." className="bg-white/5 border-white/10 min-h-[150px] rounded-xl focus:border-white/30 text-white" />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link href="/">
            <Button variant="outline" type="button" className="rounded-full px-8 border-white/10 h-12 uppercase text-[10px] font-black tracking-widest text-white">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-full px-10 h-12 shadow-xl gap-2">
            <Save size={18} />
            <span className="uppercase text-[10px] font-black tracking-widest">Update Legend</span>
          </Button>
        </div>
      </form>
    </motion.main>
  )
}
