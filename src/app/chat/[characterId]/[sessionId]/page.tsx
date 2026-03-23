'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useZabbStore } from '@/store/useZabbStore'
import type { Message } from '@/store/useZabbStore'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { MessageParser } from '@/components/MessageParser'
import Link from 'next/link'
import { ArrowLeft, Send, Sparkles, Wand2, Ghost } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string; sessionId: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { characterId, sessionId } = resolvedParams

  const characters = useZabbStore((state) => state.characters)
  const sessions = useZabbStore((state) => state.sessions)
  const settings = useZabbStore((state) => state.settings)
  const addMessageToSession = useZabbStore((state) => state.addMessageToSession)

  const character = characters.find((c) => c.id === characterId)
  const session = sessions[sessionId]

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!character || !session) {
      router.push('/')
    }
  }, [character, session, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !session || !character) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    addMessageToSession(sessionId, userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          userPersona: session.userPersona,
          messages: [...session.messages, userMessage],
          settings,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const data = await response.json()
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
      }
      
      addMessageToSession(sessionId, aiMessage)
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    
    const newText = before + `*${tag}*` + after
    setInput(newText)
    
    // Reset focus and select the text inside the asterisks
    setTimeout(() => {
      textarea.focus()
      const selectionStart = start + 1
      const selectionEnd = start + 1 + tag.length
      textarea.setSelectionRange(selectionStart, selectionEnd)
    }, 0)
  }

  if (!character || !session) return null

  return (
    <main className="flex flex-col h-screen max-w-5xl mx-auto font-sarabun bg-zabb-bg relative">
      {/* Background Decorative elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 p-5 border-b border-zabb-border/60 bg-zabb-bg/80 backdrop-blur-xl sticky top-0 z-10 shrink-0"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="px-2 hover:bg-white/5">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="relative group">
          <Avatar src={character.avatar} alt={character.name} size="md" className="ring-1 ring-white/10 ring-offset-2 ring-offset-zabb-bg transition-transform group-hover:scale-105" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zabb-bg" />
        </div>
        <div className="flex-1 min-w-0 ml-1">
          <h1 className="font-bold text-xl leading-tight truncate tracking-tight">{character.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] uppercase font-black tracking-widest text-zabb-muted-fg flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-zabb-muted-fg" />
              Immersion Mode
            </p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zabb-muted-fg bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Sparkles size={12} className="text-white animate-pulse" />
            Story Engine Active
          </div>
          <p className="text-[8px] text-zabb-muted-fg uppercase tracking-widest mr-2">{settings.model.split('/').pop()}</p>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-10 space-y-12 scroll-smooth">
        <AnimatePresence mode="popLayout" initial={false}>
          {session.messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-8"
            >
              <div className="max-w-lg mx-auto p-10 glass-border rounded-[2.5rem] bg-white/[0.02] italic text-zabb-muted-fg border-dashed">
                <p className="text-[10px] font-black text-white/20 mb-6 uppercase tracking-[0.3em] text-center">เริ่มต้นเรื่องราว</p>
                <p className="leading-loose text-lg text-white/60">"{character.startingSituation}"</p>
              </div>
            </motion.div>
          )}
          
          {session.messages.map((msg, index) => {
            const isUser = msg.role === 'user'
            const avatar = isUser ? session.userPersona.avatar : character.avatar
            const name = isUser ? session.userPersona.name : character.name

            return (
              <motion.div 
                key={msg.id} 
                layout
                initial={{ opacity: 0, x: isUser ? 20 : -20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
                className={`flex gap-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar src={avatar} alt={name} size="sm" className="mt-1 shadow-2xl shrink-0 glass-border" />
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                  <div className={`flex items-center gap-2 mb-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      {name}
                    </span>
                  </div>
                  <div className={`p-6 rounded-[1.5rem] shadow-2xl overflow-x-auto transition-all ${
                    isUser 
                    ? 'bg-white/[0.04] text-white/90 rounded-tr-none glass-border border-white/10' 
                    : 'bg-transparent border border-white/10 rounded-tl-none glass-border'
                  }`}>
                    <MessageParser content={msg.content} role={msg.role} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-5"
          >
            <Avatar src={character.avatar} alt={character.name} size="sm" className="mt-1 glass-border" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 px-1">{character.name}</span>
              <div className="p-6 rounded-[1.5rem] border border-white/10 rounded-tl-none glass-border flex gap-2.5 items-center">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 md:p-8 shrink-0 bg-gradient-to-t from-black via-black to-transparent chat-input-shadow z-20"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Action/Vibe Shortcuts */}
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar text-white">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => insertTag('บรรยายท่าทาง')}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 hover:border-white/20 gap-2 rounded-full whitespace-nowrap"
            >
              <Ghost size={12} />
              ท่าทาง
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => insertTag('ความรู้สึกในใจ')}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 hover:border-white/20 gap-2 rounded-full whitespace-nowrap"
            >
              <Wand2 size={12} />
              ความรู้สึก
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => insertTag('ชุดที่สวมใส่')}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 hover:border-white/20 gap-2 rounded-full whitespace-nowrap"
            >
              ชุด
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => insertTag('สถานที่')}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 hover:border-white/20 gap-2 rounded-full whitespace-nowrap"
            >
              สถานที่
            </Button>
          </div>

          <div className="flex gap-4 items-end bg-white/[0.03] p-3 rounded-[2rem] glass-border border-white/10 group focus-within:border-white/30 transition-all shadow-2xl">
            <Textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={`พิมพ์ข้อความถึง ${character.name}... (Shift+Enter เพื่อเว้นบรรทัด)`}
              className="resize-none min-h-[60px] max-h-[300px] border-none bg-transparent focus-visible:ring-0 text-lg py-4 px-4 leading-relaxed"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()} 
              className="h-[60px] w-[60px] p-0 rounded-[1.5rem] shrink-0 shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
            >
              <Send size={24} />
            </Button>
          </div>
          <p className="text-center text-[9px] font-black text-white/10 uppercase tracking-[0.5em] mt-4">
            Zabb AI Engine V16.0 🌶️ No Logs Private Mode
          </p>
        </div>
      </motion.div>
    </main>
  )
}
