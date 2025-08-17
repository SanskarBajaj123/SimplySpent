import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function ProfilePage({ user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareEmail, setShareEmail] = useState('')
  const [sharingLoading, setSharingLoading] = useState(false)
  const [sharedUsers, setSharedUsers] = useState([])
  const [message, setMessage] = useState('')

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_access')
        .select(`
          id,
          viewer_user_id,
          created_at,
          profiles!shared_access_viewer_user_id_fkey (
            username,
            email
          )
        `)
        .eq('owner_user_id', user.id)

      if (error) throw error
      setSharedUsers(data || [])
    } catch (error) {
      console.error('Error fetching shared users:', error)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchSharedUsers()
  }, [user.id])

  const handleShare = async (e) => {
    e.preventDefault()
    if (!shareEmail.trim()) return

    setSharingLoading(true)
    setMessage('')

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', shareEmail.trim())
        .single()

      if (userError || !userData) {
        setMessage('User not found. Please check the username.')
        return
      }

      if (userData.id === user.id) {
        setMessage('You cannot share with yourself.')
        return
      }

      // Check if already shared
      const { data: existingShare } = await supabase
        .from('shared_access')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('viewer_user_id', userData.id)
        .single()

      if (existingShare) {
        setMessage('You are already sharing with this user.')
        return
      }

      // Create sharing relationship
      const { error: shareError } = await supabase
        .from('shared_access')
        .insert([
          {
            owner_user_id: user.id,
            viewer_user_id: userData.id
          }
        ])

      if (shareError) throw shareError

      setMessage('Successfully shared your transactions!')
      setShareEmail('')
      fetchSharedUsers()
    } catch (error) {
      console.error('Error sharing transactions:', error)
      setMessage('Error sharing transactions: ' + error.message)
    } finally {
      setSharingLoading(false)
    }
  }

  const handleRevokeAccess = async (sharedUserId) => {
    try {
      const { error } = await supabase
        .from('shared_access')
        .delete()
        .eq('owner_user_id', user.id)
        .eq('viewer_user_id', sharedUserId)

      if (error) throw error

      fetchSharedUsers()
      setMessage('Access revoked successfully.')
    } catch (error) {
      console.error('Error revoking access:', error)
      setMessage('Error revoking access: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.username || 'Not set'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Share Transactions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Share My Transactions</h3>
        
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700">
              Username to share with
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="shareEmail"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter username"
                required
              />
              <button
                type="submit"
                disabled={sharingLoading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {sharingLoading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes('Error') || message.includes('not found') || message.includes('already')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Shared Users List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Currently Sharing With</h3>
        
        {sharedUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">You are not sharing your transactions with anyone.</p>
        ) : (
          <div className="space-y-3">
            {sharedUsers.map((sharedUser) => (
              <div key={sharedUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sharedUser.profiles?.username || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Shared since {new Date(sharedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeAccess(sharedUser.viewer_user_id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
