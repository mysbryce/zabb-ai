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
import { ArrowLeft, Play, RefreshCcw, UserPlus, Loader2 } from 'lucide-react'

export default function ChatSetupPage({
  params,
}: {
  params: Promise<{ characterId: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const characterId = resolvedParams.characterId
  
  const characters = useZabbStore((state) => state.characters)
  const createSession = useZabbStore((state) => state.createSession)
  const currentUserPersona = useZabbStore((state) => state.currentUserPersona)
  const setCurrentUserPersona = useZabbStore((state) => state.setCurrentUserPersona)

  const [hasHydrated, setHasHydrated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    info: '',
    avatar: '',
  })

  // Handle hydration
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  const character = characters.find((c) => c.id === characterId)

  useEffect(() => {
    if (hasHydrated && !character) {
      router.push('/')
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

  const handleReset = () => {
    setFormData({
      name: '',
      info: '',
      avatar: '',
    })
  }

  const handleImportLast = () => {
    if (currentUserPersona) {
      setFormData({
        name: currentUserPersona.name || '',
        info: currentUserPersona.info || '',
        avatar: currentUserPersona.avatar || '',
      })
    }
  }

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setCurrentUserPersona(formData)
    const sessionId = createSession(characterId, formData)
    
    router.push(`/chat/${characterId}/${sessionId}`)
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto p-8 font-sarabun"
    >
      <div className="mb-8 flex items-center gap-4 border-b border-zabb-border pb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">เข้าสู่โลกของ {character.name}</h1>
          <p className="text-sm text-zabb-muted-fg mt-1">ตั้งค่าตัวละครของคุณก่อนเริ่มการเดินทาง</p>
        </div>
      </div>

      <div className="bg-zabb-muted/40 p-6 rounded-2xl mb-10 border border-zabb-border shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-zabb-fg/20 group-hover:bg-zabb-fg transition-colors" />
        <h2 className="text-xs font-bold text-zabb-muted-fg mb-3 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zabb-fg animate-pulse" />
          บทนำสถานการณ์
        </h2>
        <p className="text-zabb-fg text-lg italic leading-relaxed">"{character.startingSituation}"</p>
      </div>

      <form onSubmit={handleStartChat} className="space-y-8 bg-zabb-muted/10 p-8 rounded-2xl border border-zabb-border">
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <ImageUpload 
              label="รูปประจำตัวของคุณ" 
              onUploadSuccess={handleUploadSuccess} 
              currentUrl={formData.avatar}
            />
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                {currentUserPersona && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleImportLast}
                    className="gap-2 text-[10px] uppercase font-bold"
                  >
                    <UserPlus size={12} />
                    ดึงโปรไฟล์ล่าสุด
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="gap-2 text-[10px] uppercase font-bold text-zabb-muted-fg hover:text-white"
                >
                  <RefreshCcw size={12} />
                  ล้างข้อมูล
                </Button>
              </div>
              <AIGenerator type="user" onGenerated={handleAIGenerated} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">ชื่อของคุณ (ที่ AI จะใช้เรียก) *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="ชื่อเล่น หรือชื่อตัวละครของคุณ" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">ข้อมูลเกี่ยวกับคุณ</label>
            <Textarea 
              name="info" 
              value={formData.info} 
              onChange={handleChange} 
              placeholder="อายุ, เพศ, ความสัมพันธ์กับ AI (ถ้ามี)..." 
              className="h-28" 
            />
            <p className="text-[11px] text-zabb-muted-fg mt-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-zabb-muted-fg" />
              ข้อมูลนี้จะช่วยให้ AI เข้าใจตัวตนของคุณและตอบสนองได้ลึกซึ้งยิ่งขึ้น
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-zabb-border flex justify-end">
          <Button type="submit" size="lg" className="w-full gap-2 shadow-lg">
            <Play size={18} fill="currentColor" />
            เริ่มต้นบทบาท
          </Button>
        </div>
      </form>
    </motion.main>
  )
}
