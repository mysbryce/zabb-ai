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

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  id: string
  characterId: string
  userPersona: UserPersona
  messages: Message[]
}

export interface AISettings {
  model: string
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
}

export const useZabbStore = create<ZabbStore>()(
  persist(
    (set, get) => ({
      characters: [],
      sessions: {},
      currentUserPersona: null,
      settings: {
        model: 'moonshotai/kimi-k2-instruct-0905',
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
    }),
    {
      name: 'zabb-ai-storage',
    }
  )
)
