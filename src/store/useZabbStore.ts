import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Character {
  id: string
  name: string
  avatar: string // Base64 or URL
  age: string
  gender: string
  personality: string
  appearance: string
  background: string
  startingSituation: string
}

export interface UserPersona {
  name: string
  info: string
  avatar: string
}

export type UserMessageKind = 'speech' | 'action' | 'narration'

export interface UserMessage {
  id: string
  role: 'user'
  kind?: UserMessageKind
  content: string
}

export interface AssistantMessage {
  id: string
  role: 'assistant'
  content: string
}

export type Message = UserMessage | AssistantMessage

export interface ChatSession {
  id: string
  characterId: string
  userPersona: UserPersona
  messages: Message[]
}

export interface AISettings {
  provider: 'groq' | 'google'
  groqKeys: string[]
  googleKeys: string[]
  groqModel: string
  googleModel: string
  temperature: number
  maxTokens: number
}

interface ZabbStore {
  characters: Character[]
  sessions: Record<string, ChatSession>
  currentUserPersona: UserPersona | null
  settings: AISettings
  
  // Actions
  addCharacter: (char: Omit<Character, 'id'>) => void
  updateCharacter: (id: string, char: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  
  setCurrentUserPersona: (persona: UserPersona) => void
  
  createSession: (characterId: string, userPersona: UserPersona) => string
  addMessageToSession: (sessionId: string, message: Message) => void
  deleteSession: (sessionId: string) => void
  
  updateSettings: (settings: Partial<AISettings>) => void
  fetchConfig: () => Promise<void>
  updateAIConfig: (config: Partial<AISettings>) => Promise<void>
}

export const useZabbStore = create<ZabbStore>()(
  persist(
    (set, get) => ({
      characters: [],
      sessions: {},
      currentUserPersona: null,
      settings: {
        provider: 'groq',
        groqKeys: [],
        googleKeys: [],
        groqModel: 'moonshotai/kimi-k2-instruct-0905',
        googleModel: 'gemini-2.0-flash',
        temperature: 0.75,
        maxTokens: 3000,
      },

      addCharacter: (charData) => {
        const newChar: Character = {
          ...charData,
          id: crypto.randomUUID(),
        }
        set((state) => ({ characters: [...state.characters, newChar] }))
      },

      updateCharacter: (id, charData) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...charData } : c
          ),
        }))
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }))
      },

      setCurrentUserPersona: (persona) => {
        set({ currentUserPersona: persona })
      },

      createSession: (characterId, userPersona) => {
        const sessionId = crypto.randomUUID()
        const newSession: ChatSession = {
          id: sessionId,
          characterId,
          userPersona,
          messages: [],
        }
        set((state) => ({
          sessions: { ...state.sessions, [sessionId]: newSession },
        }))
        return sessionId
      },

      addMessageToSession: (sessionId, message) => {
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state
          
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [...session.messages, message],
              },
            },
          }
        })
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = { ...state.sessions }
          delete newSessions[sessionId]
          return { sessions: newSessions }
        })
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      fetchConfig: async () => {
        try {
          const res = await fetch('/api/settings')
          const config = await res.json()
          set((state) => ({
            settings: { ...state.settings, ...config }
          }))
        } catch (error) {
          console.error('Failed to fetch AI config:', error)
        }
      },

      updateAIConfig: async (config) => {
        try {
          const res = await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(config),
          })
          if (res.ok) {
            const data = await res.json()
            set((state) => ({
              settings: { ...state.settings, ...data.config }
            }))
          }
        } catch (error) {
          console.error('Failed to update AI config:', error)
        }
      },
    }),
    {
      name: 'zabb-ai-storage',
    }
  )
)

