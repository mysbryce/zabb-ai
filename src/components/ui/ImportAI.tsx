'use client'

import { useState, useRef } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { FileJson, Upload } from 'lucide-react'

interface ImportAIProps {
  onImported: (data: any) => void
}

export function ImportAI({ onImported }: ImportAIProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const charData = JSON.parse(event.target?.result as string)
        if (charData && charData.name) {
          // Remove ID to avoid conflicts
          const { id, ...cleanData } = charData
          onImported(cleanData)
          handleClose()
        } else {
          alert('ไฟล์ตัวละครไม่ถูกต้อง')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('ไม่สามารถอ่านไฟล์ได้')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="gap-2 border-zabb-border text-zabb-fg hover:bg-white/5"
      >
        <Upload size={14} />
        Import JSON
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title="นำเข้าตัวละครจากไฟล์"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-zabb-muted-fg">
              เลือกไฟล์ JSON ที่เคยส่งออกจากระบบนี้เพื่อนำกลับมาใช้ใหม่
            </p>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileImport}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zabb-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-12 h-12 bg-zabb-muted/50 rounded-full flex items-center justify-center text-zabb-muted-fg">
                <FileJson size={24} />
              </div>
              <div className="text-center">
                <p className="font-bold">คลิกเพื่อเลือกไฟล์</p>
                <p className="text-xs text-zabb-muted-fg mt-1">รองรับไฟล์ .json เท่านั้น</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose}>ยกเลิก</Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
