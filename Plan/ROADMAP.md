# PROXY Product Roadmap

## Tech Stack
- **Frontend:** Vite + React 18
- **Styling:** Tailwind CSS 4.0
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini (structured JSON responses)
- **State:** React Context + localStorage fallback
- **Fonts:** JetBrains Mono, Playfair Display, Space Grotesk, Bangers

---

## Phase 1: The Discovery ✅ COMPLETE
**Goal:** Cinematic onboarding that diagnoses the user's persona from 10 possible characters.

### Core
- [x] Vite + React + Tailwind + Framer Motion foundation
- [x] 10 personas (Alfred, Sherlock, Batman, Black Widow, Gandalf, Thanos, Loki, Jessica Pearson, Tony Stark, Yoda)
- [x] 8 weighted diagnostic questions (each option distributes points across multiple personas)
- [x] Weighted scoring with random tie-breaking
- [x] Persona re-selection: "Not for me — show another" cycles through personas endlessly without revealing the full list

### Screens
- [x] **Stealth Entry** — Terminal-style username input with blinking cursor
- [x] **Diagnostic** — 8 questions with RGB glitch effect on selection
- [x] **Revelation** — Shatter effect transition, persona name reveal
- [x] **Letter** — Personalized typewriter letter from each persona + accept/reroll

### Files
```
src/screens/StealthEntry.jsx, Diagnostic.jsx, Revelation.jsx, Letter.jsx
src/components/ui/CursorBlink.jsx
src/components/effects/GlitchEffect.jsx, ShatterEffect.jsx
src/components/transitions/LensFocus.jsx
src/config/questions.js, personas.js, letters.js
src/utils/scoring.js
src/hooks/useLocalStorage.js
src/context/ProxyContext.jsx
```

---

## Phase 2: The Interrogative Ledger ✅ COMPLETE
**Goal:** Chat-first interface with persona-themed UI and task ledger sidebar.

### Core
- [x] Dashboard with chat feed + ledger sidebar
- [x] 10 unique persona themes (colors, fonts, styles)
- [x] Chat system with typing indicator, welcome messages
- [x] Ledger sidebar (desktop) / drawer (mobile)
- [x] Desktop ledger opens by default

### Files
```
src/screens/Dashboard.jsx
src/components/chat/ChatFeed.jsx, ChatInput.jsx
src/components/ledger/ActiveLedger.jsx
src/config/themes.js
```

---

## Phase 3: The Secure Vault ✅ COMPLETE
**Goal:** Cloud database with simplified name-only authentication for demo.

### Core
- [x] Supabase PostgreSQL backend (profiles, messages, ledger_entries)
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
