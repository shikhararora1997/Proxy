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

## Phase 2: The Interrogative Ledger (Complete)
**Goal:** Build a Chat-First Ledger Maintainer interface that is fully skinned based on the user's assigned persona.

### 1. Dashboard Architecture
- [x] **Layout:** Implement the layout shell (Sidebar/Drawer + Chat Area).
- [x] **Routing:** Ensure generic route protection (redirect to Phase 1 if no persona found).
- [x] **Ghost Ledger:** Build the static visual component for the sidebar/drawer.

### 2. Persona Skinning
- [x] **Theme Context:** Expand the design system to support 4 distinct themes (Fonts, Colors, Border Radii).
- [x] **Alfred Theme:** Navy/Gold, Minimalist bubbles.
- [x] **Piccolo Theme:** Purple/Black, Brutalist blocks.
- [x] **Gandalf Theme:** Green/Slate, Texture/Parchment feel.
- [x] **Deadpool Theme:** Red/Charcoal, Chaotic/Neon feel.

### 3. Local Chat Persistence
- [x] **Storage Logic:** Implement `useChatHistory` hook reading from `localStorage`.
- [x] **Chat UI:** Build the message feed component with "Typing" states.
- [x] **Response Engine:** Implement the hardcoded "Ghost" responses (1.5s delay).

---

## Phase 3: The Secure Vault (Current Focus)
**Goal:** Move from local storage to a cloud-based database and implement a high-end "Stealth" authentication system.

### 1. Database Migration (The Vault)
- [ ] **Setup:** Initialize Supabase/Firebase project.
- [ ] **Schema Definition:** Create `profiles`, `messages`, and `ledger_entries` tables.
- [ ] **Data Migration:** (Optional) Strategy to sync local localStorage data to DB on first login.

### 2. Identity Verification (Auth)
- [ ] **Auth Context:** Build global auth state provider.
- [ ] **Vault Entrance UI:** Build the "Terminal" Login/Signup screen.
- [ ] **Backend Integration:** Connect "Username/Password" flow to Auth provider.
- [ ] **Route Guards:** Protect `/dashboard` with auth checks.

### 3. Functional Enhancements
- [ ] **Ledger Interactivity:** Connect "Active Ledger" sidebar to `ledger_entries` table (CRUD operations).
- [ ] **Cross-Device Sync:** Verify chat/persona state syncs between two browsers.
