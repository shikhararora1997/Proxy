# PROXY Push Notification Setup

This guide explains how to set up push notifications for PROXY.

## Overview

Push notifications are sent every 4 hours to remind users about their pending tasks.
The notification shows: "You have X high priority and Y other tasks pending"

## Architecture

```
[Scheduler] --triggers--> [Supabase Edge Function] --sends push--> [User's Device]
                                    |
                                    v
                          [Supabase Database]
                          - push_subscriptions
                          - ledger_entries
```

## Setup Steps

### 1. Generate VAPID Keys

VAPID keys are required for web push authentication.

```bash
cd /path/to/proxy
node scripts/generate-vapid-keys.js
```

This outputs two keys:
- **Public Key**: Safe to expose in frontend (users need it to subscribe)
- **Private Key**: Keep secret (only used by server to send notifications)

### 2. Configure Environment Variables

**Vercel (Frontend):**
```
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

**Supabase Edge Functions:**
Add these as secrets in your Supabase dashboard (Project Settings > Edge Functions > Secrets):
```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Run Database Migration

Run the SQL in `supabase-schema-v5.sql` in your Supabase SQL Editor to create the `push_subscriptions` table.

### 4. Deploy Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-notifications
```

### 5. Set Up Scheduler (pg_cron)

In Supabase SQL Editor, enable pg_cron and schedule the function:

```sql
-- Enable the pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule to run every 4 hours
SELECT cron.schedule(
  'send-task-reminders',
  '0 */4 * * *',  -- Every 4 hours at minute 0
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Note:** You'll need to enable the `pg_net` extension for HTTP calls:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 6. Test the Function

You can manually trigger the function to test:

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Alternative: External Scheduler

If pg_cron doesn't work for your setup, you can use:

1. **Vercel Cron Jobs** (if deploying to Vercel Pro)
2. **GitHub Actions** with scheduled workflows
3. **Easycron.com** (free tier available)
4. **cron-job.org** (free)

Example GitHub Action (`.github/workflows/send-notifications.yml`):
```yaml
name: Send Push Notifications
on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification function
        run: |
          curl -X POST "${{ secrets.SUPABASE_FUNCTION_URL }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

## Troubleshooting

### Notifications not showing on iOS
- User must add app to home screen first
- Check Settings > PROXY > Notifications is enabled
- iOS 16.4+ required

### Notifications not showing on Android
- Check app notification permissions
- Check battery optimization isn't blocking the app

### "Push subscription failed"
- Ensure VAPID keys are correctly configured
- Check browser supports push (must be HTTPS)

### Function returns "No active subscriptions"
- Users haven't enabled notifications yet
- Check the `push_subscriptions` table has entries

## Customizing Notifications

To change the notification content, edit the Edge Function at:
`supabase/functions/send-notifications/index.ts`

The notification payload is built around line 220:
```typescript
const payload = {
  title: 'PROXY',
  body: 'Your custom message',
  icon: '/icons/icon-192.png',
  // ...
}
```
