'use client'

import { useState, useRef } from 'react'
import { useZabbStore } from '@/store/useZabbStore'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SettingsModal } from '@/components/ui/SettingsModal'
import Link from 'next/link'
import { Plus, Info, Settings, Trash2, MessageSquare, History, Sparkles, ChevronRight, Upload, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const characters = useZabbStore((state) => state.characters)
  const sessions = useZabbStore((state) => state.sessions)
  const deleteCharacter = useZabbStore((state) => state.deleteCharacter)
  const deleteSession = useZabbStore((state) => state.deleteSession)
  const addCharacter = useZabbStore((state) => state.addCharacter)
  const settings = useZabbStore((state) => state.settings)
  
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSessionsForCharacter = (charId: string) => {
    return Object.values(sessions).filter((s) => s.characterId === charId)
  }

  const handleExport = (e: React.MouseEvent, char: any) => {
    e.preventDefault()
    e.stopPropagation()
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${char.name.replace(/\s+/g, '_')}_zabb_ai.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const charData = JSON.parse(event.target?.result as string)
        
        if (charData && charData.name && charData.startingSituation) {
          const { id, ...newCharData } = charData
          addCharacter(newCharData)
          alert('Imported character successfully!')
        } else {
          alert('Invalid character file.')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Error reading the file.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-12 font-sarabun relative min-h-screen">
      {/* Background Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-16 gap-6 relative z-10"
      >
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">Zabb AI</h1>
            <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest mt-1">Engine v16</span>
          </div>
          <p className="text-white/40 text-base md:text-lg font-medium tracking-tight">The ultimate local roleplay experience.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)} 
            className="gap-2 border-white/10 hover:border-white/40 bg-white/5 rounded-full px-4 md:px-5 h-10 md:h-11 justify-center sm:justify-start"
          >
            <Settings size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsInfoOpen(true)} 
            className="gap-2 border-white/10 hover:border-white/40 bg-white/5 rounded-full px-4 md:px-5 h-10 md:h-11 justify-center sm:justify-start"
          >
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">About</span>
          </Button>
          
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport} 
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            className="gap-2 border-white/10 hover:border-white/40 bg-white/5 rounded-full px-4 md:px-5 h-10 md:h-11 justify-center sm:justify-start"
          >
            <Upload size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Import</span>
          </Button>

          <Link href="/create" className="col-span-2 sm:col-span-1">
            <Button className="w-full gap-2 bg-white text-black hover:bg-white/90 rounded-full px-6 h-10 md:h-11 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Plus size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Create Character</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {characters.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="text-center py-20 md:py-40 border border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] backdrop-blur-sm px-4"
          >
            <Sparkles size={40} className="mx-auto mb-6 text-white/20" />
            <p className="text-white/40 text-lg md:text-xl font-bold mb-8 tracking-tight">Your world is currently empty.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()} className="rounded-full px-8 h-12 md:h-14 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] gap-2">
                <Upload size={18} />
                Import Character
              </Button>
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full px-8 md:px-10 h-12 md:h-14 font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">
                  Craft Your First Legend
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8 md:space-y-12 relative z-10">
            <div className="flex items-center gap-4 mb-4 md:mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Active Characters</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {characters.map((char, index) => {
                const charSessions = getSessionsForCharacter(char.id)
                
                return (
                  <motion.div
                    key={char.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex flex-col gap-4 md:gap-6"
                  >
                    <div className="group relative">
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 w-9 md:h-10 md:w-10 p-0 rounded-full bg-black/60 hover:bg-white hover:text-black border-none text-white backdrop-blur-md"
                          onClick={(e) => handleExport(e, char)}
                          title="Export to JSON"
                        >
                          <Download size={16} />
                        </Button>
                        <Link href={`/edit/${char.id}`}>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-9 w-9 md:h-10 md:w-10 p-0 rounded-full bg-black/60 hover:bg-white hover:text-black border-none text-white backdrop-blur-md"
                            onClick={(e) => e.stopPropagation()}
                            title="Edit Character"
                          >
                            <Settings size={16} />
                          </Button>
                        </Link>
                         <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 w-9 md:h-10 md:w-10 p-0 rounded-full bg-black/60 hover:bg-red-500/90 border-none text-white backdrop-blur-md"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if(confirm('Delete this character and all its history permanently?')) {
                              charSessions.forEach(s => deleteSession(s.id))
                              deleteCharacter(char.id)
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <Link href={`/chat/${char.id}/setup`}>
                        <div className="relative border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 bg-white/[0.03] hover:bg-white/[0.06] transition-all hover:border-white/20 cursor-pointer overflow-hidden group/card shadow-2xl">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/card:bg-white/10 transition-colors" />
                          
                          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                            <Avatar src={char.avatar} alt={char.name} size="lg" className="md:w-24 md:h-24 shadow-2xl ring-1 ring-white/10 ring-offset-4 ring-offset-black transition-transform group-hover/card:scale-105 duration-500" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-xl md:text-2xl text-white truncate tracking-tighter">
                                {char.name}
                              </h3>
                              <div className="flex gap-2 mt-1 md:mt-2">
                                <span className="text-[8px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/10 text-white/60 uppercase tracking-widest">{char.gender || 'Any'}</span>
                                <span className="text-[8px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/10 text-white/60 uppercase tracking-widest">{char.age ? `${char.age}y` : 'Age unknown'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs md:text-sm text-white/40 line-clamp-3 leading-relaxed font-medium">
                            {char.personality}
                          </p>
                          
                          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between text-white/20 group-hover/card:text-white transition-colors">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">New Roleplay</span>
                            <ChevronRight size={16} className="transform translate-x-0 group-hover/card:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Chat History Section */}
                    {charSessions.length > 0 && (
                      <div className="px-2 md:px-4 space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                          <MessageSquare size={10} />
                          Thread History
                        </div>
                        <div className="space-y-2">
                          {charSessions.map((session) => (
                            <motion.div 
                              key={session.id} 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              className="flex gap-2 items-center group/session"
                            >
                              <Link 
                                href={`/chat/${char.id}/${session.id}`}
                                className="flex-1 flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 transition-all text-[10px] md:text-xs"
                              >
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                  <span className="font-bold text-white/80 line-clamp-1">Scenario with {session.userPersona.name}</span>
                                  <span className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    {session.messages.length} interactions
                                  </span>
                                </div>
                                <div className="text-white/10 group-hover/session:text-white/40 transition-colors">
                                  <History size={14} />
                                </div>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-100 md:opacity-0 group-hover/session:opacity-100 h-9 w-9 md:h-10 md:w-10 p-0 rounded-xl md:rounded-2xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all border border-white/5"
                                onClick={() => {
                                  if(confirm('Delete this story thread?')) deleteSession(session.id)
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <Modal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
        title="About Zabb AI"
        size="md"
      >
        <div className="space-y-6 text-white/70">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center rotate-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="text-black text-4xl font-black italic">Z</span>
            </div>
          </div>
          <p className="leading-relaxed text-center font-medium">
            <strong className="text-white">Zabb AI</strong> is a premium local-only roleplay engine crafted for high-quality storytelling and complete privacy.
          </p>
          <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Core Philosophy</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span><strong className="text-white">Total Privacy:</strong> Your characters and stories never leave your browser. No accounts, no clouds, no tracking.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span><strong className="text-white">High Fidelity:</strong> Optimized for novel-style interactions using the latest AI models.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span><strong className="text-white">Unfiltered:</strong> Empowering creators with complete freedom in their roleplay scenarios.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 flex justify-center">
            <Button onClick={() => setIsInfoOpen(false)} className="bg-white text-black px-12 rounded-full font-black uppercase text-[10px] tracking-widest h-12">
              Acknowledged
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer Branding */}
      <footer className="mt-32 pb-12 border-t border-white/5 pt-12 flex flex-col items-center gap-4 relative z-10">
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">Zabb AI Engine V16.0.0</p>
        <div className="flex gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
           {/* You can add partner logos or icons here */}
        </div>
      </footer>
    </main>
  )
}
