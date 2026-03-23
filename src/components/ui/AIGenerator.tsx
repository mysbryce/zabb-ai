'use client'

import { useState } from 'react'
import { useZabbStore } from '@/store/useZabbStore'
import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIGeneratorProps {
  type: 'character' | 'user'
  onGenerated: (data: any) => void
}

export function AIGenerator({ type, onGenerated }: AIGeneratorProps) {
  const settings = useZabbStore((state) => state.settings)
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    setPrompt('')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt, settings }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const { result } = await response.json()
      parseResult(result)
      handleClose()
    } catch (error) {
      console.error('Error generating:', error)
      alert('เกิดข้อผิดพลาดในการสร้างข้อมูล')
    } finally {
      setIsGenerating(false)
    }
  }

  const parseResult = (text: string) => {
    const data: any = {}
    
    const extractSection = (regex: RegExp) => {
      const match = text.match(regex)
      return match ? match[1]?.trim() : ''
    }

    if (type === 'character') {
      data.name = extractSection(/### 1\. ชื่อตัวละคร \(Name\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.age = extractSection(/### 2\. อายุ \(Age\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.gender = extractSection(/### 3\. เพศ \(Gender\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.personality = extractSection(/### 4\. ลักษณะนิสัย \(Personality\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.appearance = extractSection(/### 5\. รูปร่างหน้าตา \(Appearance\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.background = extractSection(/### 6\. ประวัติและภูมิหลัง \(Background\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.startingSituation = extractSection(/### 7\. สถานการณ์เริ่มต้น \(Starting Situation\)\n([\s\S]*?)(?=\n\n###|$)/i)
    } else {
      data.name = extractSection(/### 1\. ชื่อผู้ใช้ \(User Name\)\n([\s\S]*?)(?=\n\n###|$)/i)
      data.info = extractSection(/### 2\. ข้อมูล User \(User Info - TextArea\)\n([\s\S]*?)(?=\n\n###|$)/i)
    }

    onGenerated(data)
  }

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="gap-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
      >
        <Sparkles size={14} />
        สร้างด้วย AI
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={type === 'character' ? 'สร้างตัวละครด้วย AI' : 'สร้างโปรไฟล์ด้วย AI'}
      >
        <div className="space-y-4">
          <p className="text-sm text-zabb-muted-fg">
            ใส่หัวข้อสั้นๆ หรือไอเดียที่คุณต้องการ (เช่น "คุณหนูขี้วีน กับ บอดี้การ์ดหนุ่ม")
          </p>
          <Input 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="ไอเดียของคุณ..." 
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleClose}>ยกเลิก</Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="gap-2"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'กำลังสร้าง...' : 'เริ่มสร้าง'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
