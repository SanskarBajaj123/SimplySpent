import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import MetricsPage from './pages/MetricsPage'
import ProfilePage from './pages/ProfilePage'
import Navigation from './components/Navigation'

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    console.log('App: Starting to initialize...')
    console.log('App: Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('App: Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('App: Session check result:', { session: !!session, error })
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(error => {
      console.error('App: Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('App: Auth state changed:', _event, !!session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  console.log('App: Render state:', { user: !!user, loading })

  if (loading) {
    console.log('App: Showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blue-600 font-semibold text-lg">FinTrack</div>
          </div>
        </div>
      </div>
    )
  }

  console.log('App: Rendering main app, user:', !!user)

  // If not authenticated, show auth page
  if (!user) {
    return <AuthPage />
  }

  // If authenticated, show main app with navigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navigation user={user} currentPath={location.pathname} />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/metrics" element={<MetricsPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
