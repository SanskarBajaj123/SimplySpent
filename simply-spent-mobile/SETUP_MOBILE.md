# Mobile App Setup - Quick Fix

## 🚨 Current Issue
The mobile app is showing Metro bundler errors because Supabase credentials are not configured.

## 🔧 Quick Fix (2 minutes)

### Step 1: Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your SimplySpent project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Update the Configuration
Open `simply-spent-mobile/src/supabaseClient.js` and replace:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

With your actual values:
```javascript
const SUPABASE_URL = 'https://abc123.supabase.co'  // Your actual URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Your actual key
```

### Step 3: Restart the App
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## ✅ That's it!
The mobile app should now work without errors and you can test the edit/delete functionality.

## 📱 Testing
1. Install **Expo Go** app on your phone
2. Scan the QR code
3. Test adding, editing, and deleting transactions

## 🆘 Still having issues?
- Make sure you copied the credentials correctly
- Check that your Supabase project is active
- Try clearing cache: `npx expo start --clear`
