# PROXY — Full Specification

## 1. Overview
PROXY is a persona-driven AI assistant that mirrors the user's personality. Users go through a cinematic diagnostic that assigns them one of 10 fictional personas. Each persona has a unique visual theme, voice, and behavior. The AI then acts as that persona in a chat interface, managing the user's task list through natural conversation.

---

## 2. Core Personas (10 Hidden Profiles)

| ID | Name | Archetype | Vibe | Primary Color | Accent Color |
|:---|:-----|:----------|:-----|:-------------|:-------------|
| p1 | Alfred | The Custodian | Luxury / Sarcastic Butler | Navy #0F172A | Gold #D4AF37 |
| p2 | Sherlock | The Architect | Cold Logic / Forensic | Charcoal #1A1A1A | Cyan #00FFCC |
| p3 | Batman | The Shadow | Tactical / Gritty | Black #000000 | Slate #4B5563 |
| p4 | Black Widow | The Spy | Stealth / Precise | Pitch Black #080808 | Blood Red #B91C1C |
| p5 | Gandalf | The Sage | Ethereal / Wise | Emerald #064E3B | Silver #D1D5DB |
| p6 | Thanos | The Inevitable | Brutalist / Disciplined | Purple #2E1065 | Titan Gold #FDE047 |
| p7 | Loki | The Deceiver | Unhinged / Disruptive | Asgardian Green #064E3B | Gold #D4AF37 |
| p8 | Jessica Pearson | The Authority | Regal / Commanding | Pearl White #FFFFFF | Bronze #B19470 |
| p9 | Tony Stark | The Inventor | High-Tech / Innovative | Stark Red #7F1D1D | Arc Reactor Blue #38B2AC |
| p10 | Yoda | The Grandmaster | Zen / Ancient | Forest Green #14532D | Lightsaber Green #BEF264 |

---

## 3. User Flow

### S1: Vault Entrance
- **New visitors:** "What's your name?" → Creates Supabase profile → Diagnostic
- **Returning users:** "Identify yourself." → Finds profile → Dashboard
- Terminal aesthetic with scan lines, green/red ACCESS GRANTED/DENIED

### S2: Stealth Entry (Offline fallback)
- Black screen, blinking cursor
- "Identify yourself." → Username input → Diagnostic

### S3: The Clinical Diagnostic
- 8 weighted multiple-choice questions, one at a time
- Each option distributes points across multiple personas (weighted scoring)
- RGB glitch effect on answer selection (persona-colored flash)
- Progress bar showing question count

### S4: The Revelation
- "PROCESSING RESULTS" with pulsing dots
- Screen shatters (ShatterEffect) revealing persona color
- Persona name revealed dramatically with archetype subtitle

### S5: The Personal Letter
- Personalized typewriter letter from the assigned persona
- "ACCEPT MY PROXY" button → Dashboard
- "NOT FOR ME — SHOW ANOTHER" → Cycles to a different persona (re-plays Revelation + Letter)
- Cycles endlessly through all 10 personas without revealing the full list

### S6: Dashboard
- Chat feed with persona-themed UI
- Task ledger sidebar (always open on desktop, drawer on mobile)
- Assess Ledger button for AI-generated task review
- Dropdown menu: clear chat, sign out

---

## 4. AI System

### Model
- OpenAI GPT-4o-mini
- `response_format: { type: "json_object" }` for guaranteed structured output
- `max_tokens: 500`, `temperature: 0.8`

### Response Format
```json
{
  "message": "In-character conversational reply",
  "task_actions": [
    { "type": "add", "description": "Task text", "priority": "high" },
    { "type": "complete", "match_query": "substring to match" }
  ]
}
```

### Behavior
- Each persona has a unique system prompt defining personality, speaking style, and behavior
- AI detects task intent from natural conversation (add/complete)
- Multi-task support: handles multiple adds or completions in one message
- Priority assignment: uses user-specified priority or infers from urgency
- Assess Ledger mode: triggered by `[ASSESS_LEDGER]` token, provides thorough in-character assessment with motivation and actionable suggestions
- Fallback responses per persona when AI is unavailable

---

## 5. Task Ledger

### Structure
- Three priority sublists: HIGH (red), MEDIUM (amber), LOW (green)
- Each task has: description, priority, status (pending/resolved), created_at, completed_at

### Interactions
- **Add via chat:** "Remind me to buy groceries" → AI adds task
- **Complete via chat:** "I finished the groceries" → AI marks task complete
- **Add manually:** "+ ADD TASK" button in ledger with priority selector
- **Complete manually:** Click checkbox to toggle complete/pending
- **Delete:** Click task → DEL button appears

### Behavior
- Completed tasks: strikethrough + reduced opacity, sorted to bottom of sublist
- Auto-cleanup: completed tasks disappear after 24 hours
- Pending count badge on ledger header

---

## 6. Database Schema (Supabase)

### profiles
| Column | Type | Notes |
|:-------|:-----|:------|
| id | uuid | PK, default gen_random_uuid() |
| username | text | UNIQUE, NOT NULL |
| display_name | text | |
| persona_id | text | CHECK p1-p10 |
| onboarding_complete | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### messages
| Column | Type | Notes |
|:-------|:-----|:------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| sender | text | CHECK ('user','proxy') |
| content | text | NOT NULL |
| created_at | timestamptz | |

### ledger_entries
| Column | Type | Notes |
|:-------|:-----|:------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| description | text | NOT NULL |
| amount | numeric | nullable |
| category | text | nullable |
| priority | text | CHECK ('high','medium','low'), default 'medium' |
| status | text | CHECK ('pending','resolved','void') |
| completed_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### RLS Policies
- Demo mode: permissive (all operations allowed)
- Production: restrict by auth.uid()

---

## 7. Tech Stack
- **Frontend:** Vite + React 18
- **Styling:** Tailwind CSS 4.0
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini
- **State:** React Context + localStorage fallback
- **Fonts:** JetBrains Mono, Playfair Display, Space Grotesk, Bangers
