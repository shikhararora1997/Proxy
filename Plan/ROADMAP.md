# PROXY Product Roadmap

## Tech Stack
- **Frontend:** Vite + React 18
- **Styling:** Tailwind CSS 4.0
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **State:** React Context + localStorage fallback
- **Fonts:** JetBrains Mono, Playfair Display, Space Grotesk, Bangers

---

## Phase 1: The Discovery ✅ COMPLETE
**Goal:** Establish the emotional hook. Identify the user's persona and deliver a "magic moment" of connection.

### 1. Foundation
- [x] Initialize Vite + React project with Tailwind CSS
- [x] Configure `framer-motion` for animations
- [x] Set up `useLocalStorage` hook for persistence
- [x] Create mobile-first responsive design system

### 2. Core Logic (The Brain)
- [x] Implement `PersonaEngine` in `src/utils/scoring.js`
  - Scoring algorithm assigns points per answer
  - Calculates winning persona from 5 questions
- [x] Build question configuration in `src/config/questions.js`
  - 5 diagnostic questions with 4 options each
  - Each option maps to a persona (p1-p4)
- [x] Create persona content in `src/config/personas.js`
  - Alfred (p1): The Butler - Navy/Gold theme
  - Piccolo (p2): The Warrior - Purple/Black theme
  - Gandalf (p3): The Sage - Green/Slate theme
  - Deadpool (p4): The Wildcard - Red/Charcoal theme

### 3. User Interface (The Body)

#### Stealth Entry (`src/screens/StealthEntry.jsx`)
- [x] Terminal-style username input
- [x] Custom blinking cursor component
- [x] "Press Enter to Continue" interaction
- [x] Fade-in animation sequence

#### Diagnostic (`src/screens/Diagnostic.jsx`)
- [x] Progress bar showing question count
- [x] Question cards with A/B/C/D options
- [x] **RGB Glitch Effect** on answer selection
  - Color flash based on selected persona
  - Distortion animation via `GlitchEffect` component
- [x] Smooth transitions between questions

#### Revelation (`src/screens/Revelation.jsx`)
- [x] **Shatter Effect** transition
  - Screen fragments into pieces
  - Persona colors emerge through cracks
  - Reassembles into persona reveal
- [x] Persona name with themed styling
- [x] "Continue" prompt

#### The Letter (`src/screens/Letter.jsx`)
- [x] Personalized letter per persona
- [x] **Typewriter Effect** for text reveal
- [x] Themed styling (fonts, colors, borders)
- [x] "Accept Your Proxy" call-to-action

### 4. Polish & Ship
- [x] Mobile responsiveness (safe area handling)
- [x] Animation timing optimization
- [x] Lens focus page transition wrapper

### Files Created (Phase 1)
```
src/
├── screens/
│   ├── StealthEntry.jsx
│   ├── Diagnostic.jsx
│   ├── Revelation.jsx
│   └── Letter.jsx
├── components/
│   ├── ui/CursorBlink.jsx
│   ├── effects/GlitchEffect.jsx
│   ├── effects/ShatterEffect.jsx
│   └── transitions/LensFocus.jsx
├── config/
│   ├── questions.js
│   └── personas.js
├── utils/
│   └── scoring.js
├── hooks/
│   └── useLocalStorage.js
└── context/
    └── ProxyContext.jsx
```

---

## Phase 2: The Interrogative Ledger ✅ COMPLETE
**Goal:** Build a Chat-First Ledger Maintainer interface fully skinned based on the user's assigned persona.

### 1. Dashboard Architecture
- [x] **Layout:** Chat area + Ledger sidebar/drawer
- [x] **Flow Protection:** Redirect to discovery if no persona
- [x] **Ghost Ledger:** Sidebar component with entries list

### 2. Persona Skinning (`src/config/themes.js`)

#### Alfred Theme (p1)
- Colors: Navy (#1a1f2e), Gold (#d4af37)
- Font: Playfair Display (elegant serif)
- Style: Minimalist, butler-like formality

#### Piccolo Theme (p2)
- Colors: Purple (#2d1b4e), Black (#0a0a0a)
- Font: Space Grotesk (bold sans)
- Style: Brutalist blocks, warrior intensity

#### Gandalf Theme (p3)
- Colors: Forest Green (#1a2f1a), Slate (#4a5568)
- Font: Playfair Display (wise, classic)
- Style: Parchment texture, sage wisdom

#### Deadpool Theme (p4)
- Colors: Red (#dc2626), Charcoal (#1f1f1f)
- Font: Bangers (comic book style)
- Style: Chaotic, neon accents, irreverent

### 3. Chat System
- [x] **ChatFeed Component:** Message bubbles with timestamps
- [x] **ChatInput Component:** Themed input with send button
- [x] **Typing Indicator:** Animated dots while "thinking"
- [x] **Ghost Responses:** Hardcoded persona-specific replies
- [x] **Welcome Messages:** First-visit greeting per persona

### 4. Ledger System
- [x] **ActiveLedger Component:** Sidebar/drawer with entries
- [x] **Entry States:** Pending, Resolved, Void
- [x] **CRUD Operations:** Add, update status, delete entries
- [x] **Mobile Drawer:** Slide-in overlay for mobile

### Files Created (Phase 2)
```
src/
├── screens/
│   └── Dashboard.jsx
├── components/
│   ├── chat/
│   │   ├── ChatFeed.jsx
│   │   └── ChatInput.jsx
│   └── ledger/
│       └── ActiveLedger.jsx
├── config/
│   └── themes.js
└── hooks/
    └── useChatHistory.js (later merged into useMessages.js)
```

---

## Phase 3: The Secure Vault ✅ COMPLETE
**Goal:** Cloud database with simplified authentication for demo (10 users).

### 1. Database Setup (Supabase)

#### Schema (`supabase-schema-v2.sql`)
```sql
-- Profiles table (standalone, no auth dependency)
profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  persona_id text CHECK (persona_id IN ('p1','p2','p3','p4')),
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
)

-- Messages table (chat history)
messages (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  sender text CHECK (sender IN ('user','proxy')),
  content text NOT NULL,
  created_at timestamptz
)

-- Ledger entries table
ledger_entries (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  description text NOT NULL,
  amount numeric,
  category text,
  status text CHECK (status IN ('pending','resolved','void')),
  created_at timestamptz,
  updated_at timestamptz
)
```

#### RLS Policies (Demo Mode - Open Access)
- All tables have permissive policies for demo
- In production, would restrict by auth.uid()

### 2. Authentication Flow (Simplified for Demo)

#### VaultEntrance Screen (`src/screens/VaultEntrance.jsx`)
- [x] **Step 1:** "Are you a new visitor?" → YES / NO buttons
- [x] **Step 2a (New):** "What's your name?" → Creates profile → Diagnostic
- [x] **Step 2b (Returning):** "Identify yourself." → Finds profile → Dashboard
- [x] **Processing State:** "CREATING PROFILE" / "VERIFYING IDENTITY"
- [x] **Result Overlay:** "ACCESS GRANTED" (green) / "ACCESS DENIED" (red)
- [x] Terminal aesthetic with scan lines

#### AuthContext (`src/context/AuthContext.jsx`)
- [x] `login(username)` - Find existing user by name
- [x] `createUser(username)` - Create new profile
- [x] `logout()` - Clear session
- [x] `updateProfile(updates)` - Update persona/onboarding status
- [x] Session persisted via `localStorage.proxy_user_id`
- [x] Uses `.maybeSingle()` to avoid 406 errors

### 3. Data Hooks

#### useMessages (`src/hooks/useMessages.js`)
- [x] Fetch messages from Supabase by user_id
- [x] Optimistic updates for instant UI feedback
- [x] Fallback to localStorage if offline
- [x] `addUserMessage()`, `addProxyMessage()`, `clearMessages()`

#### useLedger (`src/hooks/useLedger.js`)
- [x] Fetch ledger entries from Supabase
- [x] CRUD operations with optimistic updates
- [x] `addEntry()`, `resolveEntry()`, `voidEntry()`, `deleteEntry()`
- [x] Pending count for badge display

### 4. Bug Fixes Applied
- [x] Fixed closure bug in VaultEntrance (isNewUser state)
- [x] Fixed 406 errors by using `.maybeSingle()` instead of `.single()`
- [x] Fixed chat freeze by using ref for welcome message tracking
- [x] Fixed localStorage not clearing for new users
- [x] Changed all hooks from `user` to `profile`

### Files Created/Modified (Phase 3)
```
src/
├── lib/
│   └── supabase.js          # Supabase client init
├── context/
│   └── AuthContext.jsx      # Auth state provider
├── screens/
│   └── VaultEntrance.jsx    # Login/signup terminal
├── hooks/
│   ├── useMessages.js       # Chat with Supabase
│   └── useLedger.js         # Ledger with Supabase
└── .env                     # Supabase credentials (gitignored)

supabase-schema-v2.sql       # Database schema
```

### Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Phase 4: AI Integration (PLANNED)
**Goal:** Connect to AI backend for intelligent responses instead of hardcoded ghost replies.

### Potential Features
- [ ] **AI Chat Backend:** Replace ghost responses with LLM calls
- [ ] **Persona Prompts:** Each persona has distinct system prompt
- [ ] **Ledger Intelligence:** AI suggests entries from conversation
- [ ] **Context Memory:** AI remembers past conversations
- [ ] **Voice Input:** Speech-to-text for mobile

### Technical Considerations
- API route for AI calls (keep keys server-side)
- Streaming responses for typewriter effect
- Rate limiting for demo users
- Fallback to ghost responses if AI unavailable

---

## Phase 5: Polish & Launch (PLANNED)
**Goal:** Production readiness and public demo.

### Potential Features
- [ ] **Onboarding Refinement:** Skip diagnostic for returning users
- [ ] **Settings Screen:** Change persona, clear data
- [ ] **PWA Support:** Install as mobile app
- [ ] **Analytics:** Track user journeys
- [ ] **Error Boundaries:** Graceful error handling
- [ ] **Loading States:** Skeleton screens

---

## Deployment Notes

### Current Setup
- **Dev Server:** `npm run dev` → http://localhost:5173
- **Mobile Testing:** `cloudflared tunnel --url http://localhost:5173`
- **Database:** Supabase project (bsbjlcfqdjvqjsugxuil)

### Git History
```
e1f8279 feat: Simplify auth flow for demo (Phase 3 refinement)
72b8f44 feat: Complete Phase 1-3 (Discovery, Ledger, Auth)
f3ece12 feat: Complete Phase 1 - The Discovery Experience
```

### Repository
https://github.com/shikhararora1997/Proxy
