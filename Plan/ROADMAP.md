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

## Phase 5: PWA & Notifications ✅ COMPLETE
**Goal:** Mobile-first experience with push notifications.

### PWA
- [x] `manifest.json` with app metadata and icons
- [x] Service worker for push notification handling
- [x] App icons (192x192, 512x512, badge)
- [x] Safe area insets for iOS notch/status bar
- [x] Input zoom prevention (16px font-size)

### Push Notifications
- [x] VAPID key generation and configuration
- [x] `push_subscriptions` table in Supabase
- [x] Edge Function: `send-notifications/index.ts`
- [x] Timezone-aware quiet hours (12am-7am)
- [x] Persona-specific notification messages
- [x] Cron job setup via cron-job.org (every 4 hours)
- [x] Notification prompt after tutorial

### Files
```
public/manifest.json
public/sw.js
public/icons/
src/hooks/usePushNotifications.js
src/components/ui/NotificationPrompt.jsx
supabase/functions/send-notifications/index.ts
supabase-schema-v5.sql
```

---

## Phase 6: Authentication ✅ COMPLETE
**Goal:** Secure user accounts with password protection.

### Implementation
- [x] Password fields in VaultEntrance (login + signup)
- [x] SHA-256 hashing via Web Crypto API
- [x] `password_hash` column in profiles table
- [x] Password validation (min 4 chars, confirmation match)
- [x] Error handling for wrong password / user not found

### Files
```
src/context/AuthContext.jsx
src/screens/VaultEntrance.jsx
supabase-schema-v6.sql
```

---

## Phase 7: 3-Day Reflection ✅ COMPLETE
**Goal:** Periodic accountability review with AI-powered analysis.

### Implementation
- [x] Trigger: after 5pm + 3 days since last review
- [x] `last_review_at` column in profiles table
- [x] Dramatic intro animation with scanning effect
- [x] AI-generated persona-voiced assessment
- [x] Stats display (completed/pending/rate)
- [x] Detailed report: Post-Mortem → Behavioral Patterns → Directive
- [x] Purge completed tasks on exit

### Files
```
src/screens/ReflectionAssessment.jsx
src/context/ProxyContext.jsx (shouldTriggerReflection, completeReflection)
src/config/prompts.js (buildReflectionPrompt)
src/lib/ai.js (getReflectionAnalysis)
src/hooks/useLedger.js (purgeCompleted)
supabase-schema-v7.sql
```

---

## Phase 8: Task Management Improvements ✅ COMPLETE
**Goal:** Robust task CRUD with better AI integration.

### Implementation
- [x] Task update action (change priority, deadline, description)
- [x] Improved fuzzy matching with scoring system
- [x] Default deadline: 3 hours (was 3 days)
- [x] datetime-local picker for manual task entry
- [x] Structured assess ledger output
- [x] Multi-line chat input with auto-expand
- [x] Scroll on keyboard open (mobile)

### Files
```
src/hooks/useLedger.js (updateTaskByQuery, scoring)
src/components/ledger/ActiveLedger.jsx (datetime-local)
src/components/chat/ChatInput.jsx (textarea, auto-expand)
src/config/prompts.js (update action, structured assess)
```

---

## Phase 9: Future Enhancements (PLANNED)
**Goal:** Additional polish and features.

### Potential Features
- [ ] Streaming AI responses (typewriter effect)
- [ ] Voice input (Speech-to-text)
- [ ] Settings screen (change persona, clear data)
- [ ] Analytics (track user journeys)
- [ ] Error boundaries and loading skeletons
- [ ] Rate limiting for demo users
- [ ] Data encryption (client-side)
- [ ] Email verification

### Known Bugs to Fix
- [ ] Wrong task sometimes updated (fuzzy matching edge cases)
- [ ] Completed tasks not always visible
- [ ] Assess ledger structure needs refinement

---

## Deployment

### Production
- **Hosting:** Vercel (https://proxy-ruby-rho.vercel.app)
- **Database:** Supabase
- **Edge Functions:** Supabase Functions
- **Cron:** cron-job.org (notifications every 4h)

### Development
- **Dev Server:** `npm run dev` → http://localhost:5173
- **Mobile Testing:** `cloudflared tunnel --url http://localhost:5173`
- **Deploy:** `npx vercel --prod`

### Environment Variables (Vercel)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_OPENAI_API_KEY
VITE_VAPID_PUBLIC_KEY
```

### Repository
https://github.com/shikhararora1997/Proxy
