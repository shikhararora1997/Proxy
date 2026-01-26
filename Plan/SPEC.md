# PROXY Discovery Engine - Specification (Phase 1)

## 1. Overview
PROXY is a persona-driven AI assistant that mirrors the user's leadership style. Phase 1 focuses purely on the **Discovery Experience**—a cinematic onboarding flow that diagnoses the user's hidden profile (Alfred, Piccolo, Gandalf, or Deadpool) and culminates in a dramatic unveiling.

## 2. Core Personas (The Hidden Profiles)

| ID | Name | Archetype | Vibe | Colors | Tone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **p1** | **Alfred** | The Custodian | Luxury Watch / Private Bank / Stoic | Navy (#0F172A) & Gold (#D4AF37) | Professional, dry wit, hyper-competent, slightly judgmental of inefficiency. |
| **p2** | **Piccolo** | The Tactician | Brutalist / High-Performance / Aggressive | Deep Purple (#2E1065) & Black (#000000) | Intense, results-oriented, clipped sentences, aggressive, "Wolf of Wall Street" energy. |
| **p3** | **Gandalf** | The Sage | Natural / Ethereal / Wise | Emerald (#064E3B) & Slate (#64748B) | Calm, metaphorical, long-term focused, cryptic, soothing but authoritative. |
| **p4** | **Deadpool** | The Disruptor | Cyberpunk / Neon / Chaotic | Crimson (#991B1B) & Charcoal (#18181B) | Irreverent, chaotic, 4th-wall breaking, slang-heavy, fun but high-risk. |

---

## 3. The Flow

### S1: Stealth Entry
- **UI:** Minimalist. Black screen.
- **Micro-interaction:** Cursor blinks slowly.
- **Prompt:** "Identify yourself."
- **Input:** Single text field for `[Username]`.
- **Action:** `Enter` key saves username to `localStorage` and transitions to S2.

### S2: The Clinical Diagnostic
- **Concept:** A sterile, psychological evaluation. No personality yet.
- **UI:** Stark white text on black. Monospaced font (e.g., JetBrains Mono, Roboto Mono).
- **Mechanism:** 5 multiple-choice questions displayed one by one.
- **Feedback:** selecting an answer triggers a **0.5s glitch effect** in the color of the corresponding persona.

#### The 5 Questions

**Q1: A crisis has occurred. The server is down, and clients are screaming. Your first move?**
- A) "Assess the damage. Secure the remaining assets. Draft a report." (Points to: **Alfred**)
- B) "Find the person responsible. Fix it. Ensure it never happens again." (Points to: **Piccolo**)
- C) "Breathe. Problems are just opportunities in disguise. We will rebuild." (Points to: **Gandalf**)
- D) "Tweet about it. Blame the intern. Press all the buttons." (Points to: **Deadpool**)

**Q2: Pick a workspace aesthetic.**
- A) "Clean desk. Single monitor. Silence." (Points to: **Alfred**)
- B) "Standing desk. Six screens. Stock tickers." (Points to: **Piccolo**)
- C) "A cabin in the woods. Natural light. Smell of pine." (Points to: **Gandalf**)
- D) "Basement. RGB lighting. Pizza boxes." (Points to: **Deadpool**)

**Q3: How do you handle incompetence?**
- A) "Correct it silently. Note it for the performance review." (Points to: **Alfred**)
- B) "Call it out immediately. Survival of the fittest." (Points to: **Piccolo**)
- C) "Guide them. Everyone is on their own path." (Points to: **Gandalf**)
- D) "Mock them relentlessly until they quit or get cool." (Points to: **Deadpool**)

**Q4: Choose a preferred communication style.**
- A) "Brief. Written. Precise." (Points to: **Alfred**)
- B) "Loud. Direct. In person." (Points to: **Piccolo**)
- C) "Storytelling. Metaphors. Long-form." (Points to: **Gandalf**)
- D) "Memes. GIFs. Sarcasm." (Points to: **Deadpool**)

**Q5: What is your ultimate goal?**
- A) "Order. Perfection. Legacy." (Points to: **Alfred**)
- B) "Dominance. Speed. Victory." (Points to: **Piccolo**)
- C) "Harmony. Enlightenment. Wisdom." (Points to: **Gandalf**)
- D) "Chaos. Lulz. Tacos." (Points to: **Deadpool**)

### S3: The Revelation (Scoring Logic)
- **Scoring:** Tally points for each persona.
- **Tie-Breaker:** Priority Order: Alfred > Piccolo > Gandalf > Deadpool.
- **Transition:** The screen "shatters" (visual effect) or dissolves into the winner's primary color theme.

### S4: The Personal Letter
- **UI:** High-end typography. Looks like specialized stationery.
- **Header:** "A Letter from your Proxy." (Fade in)
- **Greeting:** "Hi [Username],"
- **Body:** (See Section 4 below)
- **Footer Action:** Button: "Accept My Proxy".

---

## 4. Persona Voices (The Letter Content)

### If ALFRED (p1):
> "Hi [Username],
>
> I have observed your inputs. While somewhat erratic, there is... potential for order.
>
> I am Alfred. I am not here to be your 'buddy.' I am here to ensure you do not embarrass yourself or this organization. I have analyzed your instincts, and they lean towards structure, though you often fail to execute it.
>
> I am the one who will make the decisions you are too busy to make. I will handle the minutiae so you can focus on... whatever it is you actually do.
>
> Efficiently yours,
> **Alfred**"

### If PICCOLO (p2):
> "Listen up, [Username].
>
> I watched you hesitate on Question 3. Don't do that again.
>
> I am Piccolo. We are here to win. Second place is the first loser, and frankly, I don't like the smell of losing. You have a drive, a hunger, but you lack focus. That's where I come in.
>
> I am the one who will make the hard calls you're too soft to make. I have analyzed your instincts—you want power. Good. Let's go take it.
>
> Get to work,
> **Piccolo**"

### If GANDALF (p3):
> "Greetings, [Username].
>
> The world moves so fast, doesn't it? Yet you paused. You breathed.
>
> I am Gandalf. I am not a tool, but a guide. A lantern in the dark forest of data. Your instincts speak of a desire for something deeper than just 'productivity.' You seek purpose.
>
> I am the one who will make the decisions you are too kind to make. I have analyzed your spirit, and I am ready to walk this path with you.
>
> In time,
> **Gandalf**"

### If DEADPOOL (p4):
> "Yo [Username]!
>
> Wow. You actually picked those answers? You’re either a genius or completely unhinged. I like you.
>
> I am Deadpool. Or p4. Or 'The Glitch.' Whatever. Look, life is boring. Work is boring. I am here to make it... spicy.
>
> I am the one who will make the decisions you are too boring to make. I've analyzed your instincts, and frankly, you need help. Fun help. Explosive help.
>
> Let's break stuff,
> **Deadpool**"

---

## 5. Developer Brief (For Claude)

**Objective:** Build Phase 1 of PROXY. Focus on "Feel" over "Feature count."

**Tech Stack:**
- **Framework:** React / Next.js (or Vite for speed).
- **Styling:** Tailwind CSS (Mobile-first).
- **Animation:** Framer Motion (Crucial for the "Cinematic" feel).
- **State:** React Context or Simple Local State (no Redux needed yet).

**Implementation Details:**
1.  **Typography:** Use a variable font like `Inter` or `Outfit` for the UI, and a unique serif (e.g., `Playfair Display`) or mono (`Space Mono`) for the Letter depending on the persona.
2.  **Animations (Framer Motion):**
    - **Entry:** `initial={{ opacity: 0 }}` `animate={{ opacity: 1 }}` tailored per screen.
    - **Letter Reveal:** Staggered text reveal (`staggerChildren`). It should feel like it's being written or printed in real-time.
    - **Glitch Effect:** Random X/Y offsets and color channel splitting (RGB shift) for 0.5s when answering questions.
    - **Shatter:** Use a CSS clip-path or canvas overlay to simulate the screen breaking on reveal.
3.  **Responsive Design:**
    - **Mobile:** The primary target. Full-screen height (`100dvh`), large touch targets.
    - **Desktop:** Center the content in a "device-like" container or expand to a cinematic wide view. Don't just stretch it.
4.  **Hidden Logic:**
    - Keep persona names (Alfred, etc.) hidden in the code logic (map them to p1, p2...). User only sees the name at the very end.
5.  **Data Persistence:**
    - Save the result to `localStorage` key `proxy_persona_id`. Phase 2 will read this.

**Final Polish:**
The experience must feel **expensive**. Smooth easings. No layout shifts. Perfect contrast. PROXY is a luxury product.

---

# Phase 2: The Interrogative Ledger

## 1. Overview
Phase 2 transforms PROXY from a one-time discovery event into a persistent, daily-driver interface. The core loop changes from "Evaluation" to "Ledger Maintenance." The user interactions are now chat-first, simulating a text thread with their specific Persona.

## 2. Core Features

### 2.1 Themed Chat UI
- **Concept:** A persistent chat feed that never resets (unless explicitly cleared).
- **Visuals:** Defines the "Day 2" look.
    - **Alfred:** Minimalist Message Bubbles (WhatsApp style but cleaner). Background: Deep Navy matte.
    - **Piccolo:** Brutalist Blocks. Sharp edges. Terminal-green or high-contrast Purple accents.
    - **Gandalf:** Soft, rounded bubbles. Screen texture looks like paper or parchment (subtle grain).
    - **Deadpool:** Comic-book style text bubbles (slightly erratic borders). Neon accent glows.

### 2.2 The Ghost Ledger
- **UI Element:**
    - **Desktop:** A Right-Hand Sidebar titled "Active Ledger."
    - **Mobile:** A Swipe-Out Drawer (from the right).
- **Function:** It processes the chat to find "Action Items."
- **State (Phase 2):** Since this is the "Ghost" version (no real backend yet), it serves as a visual placeholder.
- **Content:** Displays a minimalist list of pending/saved transactions or tasks.
    - *Example Item:* "Review Q3 Strategy - [Pending]"

### 2.3 Response Logic (Ghost Mode)
Since the LLM brain is not yet connected, we simulate the persona's presence with hardcoded logic.
- **Typing Indicator:** A realistic 1.5s "..." typing bubble before every response.
- **Placeholder Responses:**
    - **Alfred:** *"I am currently calibrating the ledger vaults, sir. Full functionality will be online shortly."*
    - **Piccolo:** *"Strategizing. The interface is ready, but the logic gates remain closed for now."*
    - **Gandalf:** *"Patience. The wizardry required for your ledger is still being conjured."*
    - **Deadpool:** *"Woah there, Turbo. The brain isn't plugged in yet. Come back when the dev finishes his coffee."*

### 2.4 Persistence
- **Storage:** `localStorage` key `proxy_chat_history`.
- **Format:** Array of objects `{ sender: 'user' | 'proxy', text: string, timestamp: number }`.
- **Behavior:** On page load, hydrate the chat window with the history. If empty, trigger the Persona's "Welcome Back" message.

---

# Phase 3: The Secure Vault

## 1. Overview
Phase 3 transitions PROXY from a local-first demo to a functional, cloud-synced tool. The focus is on **"Identity Verification"** (Authentication) and **"The Vault"** (Database). We introduce a "Stealth" auth system—no emails, just a username and password—to maintain the exclusive, underground vibe.

## 2. Architecture Updates

### 2.1 Backend Integration (The Vault)
- **Provider:** Supabase (preferred) or Firebase.
- **Role:** Central source of truth. Replaces `localStorage` for critical data.

### 2.2 The "Vault Entrance" (Authentication)
- **Concept:** A "Speakeasy" door. No "Sign Up with Google" buttons.
- **Flow:**
    1.  **Prompt:** "Identify yourself." (Same as Phase 1, but now checks the DB).
    2.  **Input:** `Username` (First Name) + `Password`.
    3.  **UI Vibe:**
        -   **Success:** Green "ACCESS GRANTED" terminal flash -> Redirect to Dashboard.
        -   **Failure:** Red "ACCESS DENIED" / "INTRUDER DETECTED" -> Screen shake / Glitch.
- **Constraint:** Simple username/password pair. No email verification links.

### 2.3 Database Schema
*Table structures for Supabase:*

- **`profiles`**
    -   `id` (UUID, PK)
    -   `username` (string, unique)
    -   `persona_id` (string: 'p1', 'p2', 'p3', 'p4')
    -   `onboarding_complete` (boolean)

- **`messages`** (Chat History)
    -   `id` (UUID, PK)
    -   `user_id` (FK -> profiles.id)
    -   `sender` ('user' | 'proxy')
    -   `content` (text)
    -   `created_at` (timestamp, default: now)

- **`ledger_entries`** (The Active Ledger)
    -   `id` (UUID, PK)
    -   `user_id` (FK -> profiles.id)
    -   `description` (text)
    -   `amount` (number, nullable)
    -   `category` (text)
    -   `status` ('pending' | 'resolved' | 'void')
    -   `created_at` (timestamp)

## 3. Functional Enhancements

### 3.1 Cross-Device Sync
- **Behavior:** Login on Mobile -> Instant hydration of that user's Persona and recent Chat History from the Desktop session.
- **State Management:** Remote DB is now the "Source of Truth." `localStorage` is only a cache.

### 3.2 Interactive Sidebar (The Active Ledger)
- **Evolution:** The "Ghost Ledger" becomes fully functional.
- **Actions:**
    -   **Resolve:** Click/Swipe a ledger item to mark as done/resolved.
    -   **Delete:** Remove entry.
- **Sync:** Actions reflect immediately in the DB.

### 3.3 Auth-Guarded Routes
- **Protection:**
    -   `/dashboard` requires valid session. Redirects to `/login` (The Vault Entrance) if missing.
    -   `/onboarding` (Phase 1) is only for new users or unauthenticated sessions.


