'use client'

import { useState, useRef } from 'react'
import { Button } from './Button'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void
  label?: string
  currentUrl?: string
}

export function ImageUpload({ onUploadSuccess, label = 'อัปโหลดรูปภาพ', currentUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview locally
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Upload to server
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      onUploadSuccess(data.url)
      setPreview(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('อัปโหลดรูปภาพไม่สำเร็จ')
      setPreview(currentUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    onUploadSuccess('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zabb-fg">{label}</label>
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-20 h-20 rounded-full border border-zabb-border overflow-hidden group"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full border border-dashed border-zabb-border flex items-center justify-center bg-zabb-muted cursor-pointer hover:border-zabb-fg transition-colors"
            >
              <ImageIcon className="text-zabb-muted-fg" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
          </Button>
          <p className="text-[10px] text-zabb-muted-fg mt-1">PNG, JPG หรือ GIF (สูงสุด 5MB)</p>
        </div>
      </div>
    </div>
  )
}
