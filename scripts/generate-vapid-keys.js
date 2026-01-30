import webpush from 'web-push'

// Generate VAPID keys for web push notifications
const vapidKeys = webpush.generateVAPIDKeys()

console.log('='.repeat(60))
console.log('VAPID Keys Generated!')
console.log('='.repeat(60))
console.log('')
console.log('Add these to your environment variables:')
console.log('')
console.log('For Vercel (Frontend):')
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log('')
console.log('For Supabase Edge Functions (Backend):')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('')
console.log('='.repeat(60))
console.log('IMPORTANT: Keep the private key secret!')
console.log('The public key is safe to expose in frontend code.')
console.log('='.repeat(60))
