import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { supabase } from './src/supabaseClient'
import AuthScreen from './src/screens/AuthScreen'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    // This will be called when user successfully signs in
    // The auth state change listener will handle updating the user state
  }

  if (loading) {
    return null // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator user={user} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </NavigationContainer>
  )
}
