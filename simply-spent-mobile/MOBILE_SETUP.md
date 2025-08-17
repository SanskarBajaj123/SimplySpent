# SimplySpent Mobile App Setup Guide

## 🚨 Current Issue: Missing Environment Variables

The mobile app is currently showing errors because the Supabase environment variables are not configured.

## 🔧 Quick Fix Steps:

### 1. Create Environment File
Create a `.env` file in the `simply-spent-mobile` directory with your Supabase credentials:

```bash
# Navigate to mobile app directory
cd simply-spent-mobile

# Create .env file (Windows PowerShell)
New-Item -Path ".env" -ItemType File
```

### 2. Add Your Supabase Credentials
Add the following content to the `.env` file:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Get Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your SimplySpent project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

### 4. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# or
expo start
```

## 📱 Running the Mobile App

### Option 1: Expo Go (Easiest)
1. Install **Expo Go** app on your phone
2. Run `npm start` in the mobile directory
3. Scan the QR code with Expo Go

### Option 2: Android Emulator
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Run `npm run android`

### Option 3: iOS Simulator (Mac only)
1. Install Xcode
2. Run `npm run ios`

## 🔍 Troubleshooting

### Metro Bundler Issues
If you see "main has not been registered" error:
1. Stop the development server (Ctrl+C)
2. Clear Metro cache: `npx expo start --clear`
3. Restart: `npm start`

### Environment Variables Not Loading
1. Make sure `.env` file is in the correct location
2. Restart the development server
3. Check that `react-native-dotenv` is installed

### Supabase Connection Issues
1. Verify your Supabase URL and key are correct
2. Check that your Supabase project is active
3. Ensure RLS policies are properly configured

## 📋 Required Dependencies
All dependencies should be installed automatically, but if needed:
```bash
npm install
```

## 🎯 Next Steps
Once the environment variables are configured:
1. The app should start without errors
2. You can test the edit/delete functionality
3. All CRUD operations should work properly

## 📞 Support
If you continue to have issues:
1. Check the console for specific error messages
2. Verify your Supabase project is properly set up
3. Ensure all dependencies are installed correctly
