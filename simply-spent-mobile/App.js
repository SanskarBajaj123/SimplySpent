import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from './src/supabaseClient'
import AuthScreen from './src/screens/AuthScreen'
import AppNavigator from './src/navigation/AppNavigator'
import Logo from './src/components/Logo'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing SimplySpent mobile app...')
        
        // Get initial session
        console.log('🔐 Getting initial session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError.message)
          setError(sessionError.message)
        } else {
          console.log('✅ Session retrieved successfully')
          setUser(session?.user ?? null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ App initialization error:', error.message)
        setError(error.message)
        setLoading(false)
      }
    }

    initializeApp()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event)
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleAuthSuccess = () => {
    // This will be called when user successfully signs in
    // The auth state change listener will handle updating the user state
    console.log('✅ Auth success!')
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo size={80} />
          <Text style={styles.appName}>SimplySpent</Text>
          <Text style={styles.tagline}>Smart Financial Tracking</Text>
        </View>
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        <Text style={styles.loadingText}>Loading your financial dashboard...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo size={80} />
          <Text style={styles.appName}>SimplySpent</Text>
        </View>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please check your connection and try again.</Text>
      </View>
    )
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
})
