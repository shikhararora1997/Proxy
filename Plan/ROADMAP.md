# PROXY Product Roadmap

## Phase 1: The Discovery (Current Sprint)
**Goal:** Establish the emotional hook. Identify the user's persona and deliver a "magic moment" of connection.

### 1. Foundation
- [x] Initialize Next.js project with Tailwind CSS.
- [x] Configure `framer-motion` and custom fonts.
- [x] Set up `localStorage` utility for persistence.

### 2. Core Logic (The Brain)
- [x] Implement `PersonaEngine`: Scoring algorithm for the 4 personas.
- [x] Build key-value mapping for Questions -> Persona Points.
- [x] Create content JSON for Questions and Letters.

### 3. User Interface (The Body)
- [x] **Stealth Entry:** Build the "Terminal-style" input.
- [x] **Diagnostic View:** Create the question runner component.
    - [x] Implement the "Glitch" color-flash effect on answer selection.
- [x] **Revelation:** Build the "Shatter" transition effect.
- [x] **The Letter:** Styling the rich text based on the winning Persona.

### 4. Polish & Ship
- [x] Mobile responsiveness audit.
- [x] Animation timing tweaks (ensure it feels cinematic, not sluggish).
- [x] Final User Acceptance Testing (UAT) with "Co-Founder".

---

## Phase 2: The Interrogative Ledger (Current Sprint)
**Goal:** Build a Chat-First Ledger Maintainer interface that is fully skinned based on the user's assigned persona.

### 1. Dashboard Architecture
- [ ] **Layout:** Implement the layout shell (Sidebar/Drawer + Chat Area).
- [ ] **Routing:** Ensure generic route protection (redirect to Phase 1 if no persona found).
- [ ] **Ghost Ledger:** Build the static visual component for the sidebar/drawer.

### 2. Persona Skinning
- [ ] **Theme Context:** Expand the design system to support 4 distinct themes (Fonts, Colors, Border Radii).
- [ ] **Alfred Theme:** Navy/Gold, Minimalist bubbles.
- [ ] **Piccolo Theme:** Purple/Black, Brutalist blocks.
- [ ] **Gandalf Theme:** Green/Slate, Texture/Parchment feel.
- [ ] **Deadpool Theme:** Red/Charcoal, Chaotic/Neon feel.

### 3. Local Chat Persistence
- [ ] **Storage Logic:** Implement `useChatHistory` hook reading from `localStorage`.
- [ ] **Chat UI:** Build the message feed component with "Typing" states.
- [ ] **Response Engine:** Implement the hardcoded "Ghost" responses (1.5s delay).
- [x] VaultEntrance screen — "New visitor?" / "Returning?" flow
- [x] Name-only auth (no passwords for demo simplicity)
- [x] Cross-device sync via Supabase
- [x] localStorage fallback for offline mode
- [x] Open RLS policies for demo

### Files
```
src/lib/supabase.js
src/context/AuthContext.jsx
src/screens/VaultEntrance.jsx
src/hooks/useMessages.js, useLedger.js
supabase-schema-v3.sql
```

---

## Phase 4: AI Integration ✅ COMPLETE
**Goal:** Replace ghost responses with intelligent AI chat using OpenAI GPT-4o-mini.

### Core
- [x] OpenAI GPT-4o-mini with structured JSON responses (`response_format: { type: "json_object" }`)
- [x] 10 unique system prompts with full persona voice and behavior rules
- [x] AI-powered task detection: detects when user wants to add/complete tasks from natural conversation
- [x] Multi-task support: add or complete multiple tasks in a single message
- [x] Priority assignment: AI assigns HIGH/MEDIUM/LOW based on urgency or user specification
- [x] Task completion via chat: "I finished X" marks tasks complete
- [x] Fallback responses per persona when AI is unavailable

### Task Ledger
- [x] Priority-based sublists: HIGH (red), MEDIUM (amber), LOW (green)
- [x] Checkbox completion + unchecking (toggle between complete/pending)
- [x] Completed tasks: strikethrough, reduced opacity, sorted to bottom of sublist
- [x] 24-hour auto-cleanup: completed tasks disappear after 24h
- [x] "Assess Ledger" button: AI provides in-character assessment of pending tasks with motivation and actionable suggestions
- [x] Shared ledger state between Dashboard and ActiveLedger (single useLedger instance)

### Files
```
src/lib/ai.js
src/config/prompts.js
src/hooks/useLedger.js (updated with priority, complete/uncomplete, completeTaskByQuery)
src/components/ledger/ActiveLedger.jsx (priority sublists, checkboxes)
src/components/chat/ChatInput.jsx (assess ledger button)
```

### Environment Variables
```
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Phase 5: Polish & Launch (PLANNED)
**Goal:** Production readiness and public demo.

### Potential Features
- [ ] Hosting on Vercel/Netlify (free tier)
- [ ] PWA Support: Install as mobile app
- [ ] Streaming AI responses (typewriter effect)
- [ ] Voice input (Speech-to-text)
- [ ] Settings screen (change persona, clear data)
- [ ] Analytics (track user journeys)
- [ ] Error boundaries and loading skeletons
- [ ] Rate limiting for demo users

---

## Deployment Notes

### Current Setup
- **Dev Server:** `npm run dev` → http://localhost:5173
- **Mobile Testing:** `npx vite --host` + Cloudflare tunnel
- **Database:** Supabase project

### Repository
https://github.com/shikhararora1997/Proxy
