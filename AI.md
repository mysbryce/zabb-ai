# Zabb AI: Project Documentation for AI Agents

## 1. Project Overview
**Zabb AI** is a premium, local-first roleplay engine designed for high-quality storytelling and complete privacy. Unlike cloud-based character chat platforms, Zabb AI ensures that all characters, stories, and interactions remain strictly within the user's browser storage.

### Core Philosophy
- **Total Privacy:** No accounts, no cloud sync, and no tracking. All data is persisted locally via `localStorage`.
- **High Fidelity:** Optimized for novel-style, immersive roleplay interactions.
- **Unfiltered Freedom:** Empowering creators with complete control over their scenarios without external moderation layers.

---

## 2. Tech Stack
- **Framework:** [Next.js 16+](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (with `persist` middleware for local storage)
- **AI Engine:** [Groq SDK](https://github.com/groq/groq-typescript) (using models like `moonshotai/kimi-k2-instruct-0905`)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **Icons:** Lucide React
- **Runtime/Package Manager:** Bun

---

## 3. Architecture & File Structure

### `/src/app` (Routes & API)
- `layout.tsx`: Global layout and font configuration (Sarabun).
- `page.tsx`: Home page, character list, and export/import actions.
- `create/page.tsx`: Character creation interface with manual entry, AI generation, and JSON import.
- `edit/[characterId]/page.tsx`: Interface for modifying existing characters.
- `chat/[characterId]/setup/page.tsx`: Configuration for starting a new roleplay session.
- `chat/[characterId]/[sessionId]/page.tsx`: The main immersive chat interface.
- `api/chat/route.ts`: Streams AI responses for roleplay.
- `api/generate/route.ts`: Generates structured character/user data from prompts.
- `api/upload/route.ts`: Handles local avatar image uploads.

### `/src/store` (State)
- `useZabbStore.ts`: The central source of truth. Manages `characters`, `sessions` (chat history), `currentUserPersona`, and `settings` (AI model/temp).

### `/src/components/ui` (Components)
- `Avatar.tsx`: Displays character/user images (supports local paths and URLs).
- `AIGenerator.tsx`: Trigger for AI-assisted character/profile creation.
- `ImportAI.tsx`: Handles importing character data from `.json` files.
- `MessageParser.tsx`: Formats AI responses (handling dialogue vs. narration).
- `SettingsModal.tsx`: Global configuration for AI models and parameters.
- `Button.tsx`, `Input.tsx`, `Modal.tsx`, `Textarea.tsx`: Base UI primitives.

### `/src/assets/instructions` (AI Prompts)
- `core-instruction.md`: The primary system prompt for the roleplay engine.
- `character-generator.md`: Instructions for generating new characters.
- `user-generator.md`: Instructions for generating user personas.

### Root Config
- `next.config.ts`: Next.js configuration (includes image domain allowlists).
- `package.json`: Dependency manifest and scripts (`dev`, `build`, `lint`).
- `.env`: (Local only) Contains `GROQ_API_KEY`.

---

## 4. Key Data Models
### Character
```typescript
interface Character {
  id: string
  name: string
  avatar: string
  age: string
  gender: string
  personality: string
  appearance: string
  background: string
  startingSituation: string
}
```

### ChatSession
```typescript
interface ChatSession {
  id: string
  characterId: string
  userPersona: UserPersona
  messages: Message[]
}
```

---

## 5. Development Guidelines
- **Privacy First:** Never introduce features that send character data to external servers except for the direct inference API (Groq).
- **Styling:** Adhere to the "Zabb" aesthetic—dark mode, high contrast, elegant typography (Sarabun), and smooth Framer Motion transitions.
- **State:** Always use the Zustand store for data persistence. Do not use local component state for data that should survive a page refresh.
