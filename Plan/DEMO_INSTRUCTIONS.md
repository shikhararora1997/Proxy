# PROXY — Demo Instructions & Hosting Guide

## For Demo Users

### What is PROXY?
PROXY is a persona-driven AI assistant. You'll go through a short diagnostic, get matched with a fictional character (like Alfred, Sherlock, or Thanos), and then chat with them. Your persona manages your task list through natural conversation.

### How to Use
1. Open the link provided
2. Click "YES" when asked if you're a new visitor
3. Enter your first name
4. Answer 8 quick questions (just pick what feels right)
5. Watch your persona reveal
6. Read the letter from your persona
7. If you don't like the persona, click "NOT FOR ME — SHOW ANOTHER" to get a different one
8. Click "ACCEPT MY PROXY" when you find one you like
9. You're now in the chat — talk to your persona naturally

### Things to Try
- **Add tasks:** "Remind me to buy groceries" or "I need to call the dentist, message my boss, and go for a run"
- **Set priority:** "Add buy groceries as high priority"
- **Complete tasks:** "I finished the groceries" or "Mark all tasks complete"
- **Check the ledger:** Open the task panel (right side on desktop, floating button on mobile)
- **Assess tasks:** Click the "ASSESS LEDGER" button — your persona will review your pending tasks and motivate you
- **Add tasks manually:** Use the "+ ADD TASK" button in the ledger sidebar

### Returning Users
- When you come back, click "NO" at the entrance
- Type the same name you used before
- You'll go straight to your dashboard with your chat history and tasks preserved

---

## Hosting Guide (For the Developer)

### Cheapest Way to Host (Free)

**Option 1: Vercel (Recommended — completely free)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" → select the PROXY repo
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_OPENAI_API_KEY` = your OpenAI API key
5. Click Deploy
6. You'll get a URL like `proxy-xyz.vercel.app`

**Option 2: Netlify (also free)**
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add the same environment variables in Site Settings → Environment Variables
6. Deploy

**Option 3: Cloudflare Pages (free, fast CDN)**
1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connect repo, build command: `npm run build`, output: `dist`
4. Add environment variables
5. Deploy

### Important Notes
- **Supabase** free tier: 500MB database, 50K monthly active users — more than enough for 10 demo users
- **OpenAI** costs: GPT-4o-mini is ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens. For 10 users doing ~50 messages each, expect < $0.50 total cost
- **API key exposure:** The OpenAI key is in the frontend (`VITE_` prefix). For a demo this is acceptable. For production, move AI calls to a server/edge function

### Quick Deploy with Vercel CLI
```bash
npm install -g vercel
cd /path/to/proxy
vercel
# Follow prompts, add env vars when asked
```

### Sharing the Link
After deploying, share the Vercel/Netlify URL with your 10 demo users. Works on both mobile and desktop browsers. No app install needed.

---

## Database Reset (Hard Reset Supabase)

To clear ALL data and start fresh, run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Delete all data (order matters due to foreign keys)
DELETE FROM ledger_entries;
DELETE FROM messages;
DELETE FROM profiles;
```

To delete a single user's data:
```sql
-- Find the user
SELECT id, username FROM profiles WHERE username = 'SomeName';

-- Delete their data (replace USER_ID with the actual UUID)
DELETE FROM ledger_entries WHERE user_id = 'USER_ID';
DELETE FROM messages WHERE user_id = 'USER_ID';
DELETE FROM profiles WHERE id = 'USER_ID';
```

To completely drop and recreate tables, re-run `supabase-schema-v3.sql` from the project root.

---

## Future Enhancements

### High Priority (Next Sprint)
1. **Streaming AI responses** — Typewriter effect as the AI generates text (SSE/streaming from OpenAI)
2. **Server-side AI calls** — Move OpenAI key to Vercel Edge Functions or Supabase Edge Functions to avoid exposing the API key
3. **Rate limiting** — Prevent abuse by limiting messages per user per hour
4. **Error boundaries** — Graceful error screens instead of white screen crashes
5. **Loading skeletons** — Shimmer placeholders while data loads

### Medium Priority (Polish)
6. **PWA support** — Add manifest.json + service worker so users can "install" the app on their phone home screen
7. **Voice input** — Speech-to-text button for mobile (Web Speech API)
8. **Haptic feedback** — Vibration on task completion (mobile)
9. **Task due dates** — "Remind me to call dentist by Friday" → AI sets a due date, shows countdown
10. **Task categories/tags** — Group tasks beyond just priority (work, personal, health, etc.)
11. **Dark/light mode toggle** — Per-persona themes already exist, but add user override
12. **Notification system** — Push notifications for overdue tasks

### Low Priority (Future Vision)
13. **Multi-persona mode** — Switch between personas without resetting (keep history per persona)
14. **Persona memory** — AI remembers facts about the user across sessions ("You mentioned your meeting with Sarah last week...")
15. **Daily digest** — Morning summary of pending tasks delivered in-character
16. **Gamification** — Streak counter, XP for completing tasks, level system
17. **Shared ledgers** — Collaborative task lists between users
18. **Export/import** — Export task history as CSV/PDF
19. **Keyboard shortcuts** — Power-user controls (Cmd+K for quick task add, etc.)
20. **Analytics dashboard** — Task completion rates, productivity trends, persona usage stats
21. **Custom personas** — Let users create their own persona with custom prompts and themes
22. **AI model selection** — Let users choose between GPT-4o-mini (fast/cheap) and GPT-4o (smarter)
23. **Recurring tasks** — "Every Monday, remind me to review my goals"
24. **Calendar integration** — Sync tasks with Google Calendar
25. **Attachment support** — Upload images/files to tasks
