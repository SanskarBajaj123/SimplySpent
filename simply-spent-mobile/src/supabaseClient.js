import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Environment variables - replace these with your actual values
const SUPABASE_URL = 'https://bxlkhxstrdnccqcacarg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bGtoeHN0cmRuY2NxY2FjYXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDM5NzUsImV4cCI6MjA3MTAxOTk3NX0.cvPpA9pc5x-6O48WR5MKTDhJLHi7kNegTnE0Hl3qcDw'

// Create a custom storage adapter for React Native
const customStorage = {
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value
    } catch (error) {
      console.warn('Storage getItem error:', error)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.warn('Storage setItem error:', error)
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.warn('Storage removeItem error:', error)
    }
  }
}

// Check if environment variables are configured (not placeholder values)
let supabase

if (SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
  console.error(`
    ⚠️  Supabase configuration missing!
    
    Please update the SUPABASE_URL and SUPABASE_ANON_KEY in:
    simply-spent-mobile/src/supabaseClient.js
    
    You can find these values in your Supabase project dashboard under Settings > API.
  `)
  
  // Create a dummy client to prevent crashes
  supabase = {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
    }),
    auth: {
      signIn: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Return a function to unsubscribe
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      // Add missing authentication methods
      signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signUpWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signInWithOtp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signUpWithOtp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      updateUser: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  }
} else {
  console.log('✅ Supabase configured successfully!')
  
  try {
    // Create Supabase client with minimal configuration
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: customStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
    
    console.log('✅ Supabase client created successfully!')
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error.message)
    console.log('🔄 Falling back to dummy client...')
    
    // Fallback to dummy client if Supabase client creation fails
    supabase = {
      from: () => ({
        select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase connection failed') }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase connection failed') }) })
      }),
      auth: {
        signIn: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        signUp: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (callback) => {
          // Return a function to unsubscribe
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        // Add missing authentication methods
        signInWithPassword: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        signUpWithPassword: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        signInWithOtp: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        signUpWithOtp: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        updateUser: () => Promise.resolve({ error: new Error('Supabase connection failed') }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null })
      }
    }
  }
}

export { supabase }


