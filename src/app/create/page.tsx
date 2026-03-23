'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZabbStore } from '@/store/useZabbStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { AIGenerator } from '@/components/ui/AIGenerator'
import { ImportAI } from '@/components/ui/ImportAI'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function CreateCharacterPage() {
  const router = useRouter()
  const addCharacter = useZabbStore((state) => state.addCharacter)

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

  const handleImported = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.startingSituation.trim()) return

    addCharacter(formData)
    router.push('/')
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
          <h1 className="text-2xl font-bold">สร้างตัวละครใหม่</h1>
        </div>
        <div className="flex gap-2">
          <ImportAI onImported={handleImported} />
          <AIGenerator type="character" onGenerated={handleAIGenerated} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6 bg-zabb-muted/30 p-6 rounded-xl border border-zabb-border">
          <ImageUpload 
            label="รูปประจำตัว AI" 
            onUploadSuccess={handleUploadSuccess} 
            currentUrl={formData.avatar}
          />

          <div>
            <label className="block text-sm font-medium mb-1">ชื่อตัวละคร *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="เช่น อลิซ, รุ่นพี่เคน" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">อายุ</label>
              <Input name="age" value={formData.age} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">เพศ</label>
              <Input name="gender" value={formData.gender} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ลักษณะนิสัย</label>
            <Textarea name="personality" value={formData.personality} onChange={handleChange} placeholder="เย็นชาแต่แอบใส่ใจ, ร่าเริงสดใส..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">รูปร่างหน้าตา</label>
            <Textarea name="appearance" value={formData.appearance} onChange={handleChange} placeholder="ผมสีดำยาว, ตาสีฟ้า, สูง 165 ซม..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ประวัติและภูมิหลัง</label>
            <Textarea name="background" value={formData.background} onChange={handleChange} placeholder="เพื่อนสมัยเด็กที่ไม่ได้เจอกันนาน..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 font-bold text-zabb-fg">สถานการณ์เริ่มต้น *</label>
            <Textarea name="startingSituation" value={formData.startingSituation} onChange={handleChange} required placeholder="เราเพิ่งบังเอิญเจอกันที่ร้านกาแฟ เธอทำกาแฟหกใส่ฉัน..." className="h-32" />
          </div>
        </div>

        <div className="pt-4 border-t border-zabb-border flex justify-end gap-3">
          <Link href="/">
            <Button variant="outline" type="button">ยกเลิก</Button>
          </Link>
          <Button type="submit">บันทึกตัวละคร</Button>
        </div>
      </form>
    </motion.main>
  )
}
