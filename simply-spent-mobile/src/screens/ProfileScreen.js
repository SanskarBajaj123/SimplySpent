import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../supabaseClient'

export default function ProfileScreen({ route }) {
  const { user } = route.params
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareUsername, setShareUsername] = useState('')
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
            username
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

  const handleShare = async () => {
    if (!shareUsername.trim()) return

    setSharingLoading(true)
    setMessage('')

    try {
      // First, find the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', shareUsername.trim())
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
      setShareUsername('')
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

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut()
              if (error) throw error
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile Settings</Text>
        <Text style={styles.subtitle}>Manage your account and sharing</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{profile?.username || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User Initial</Text>
            <Text style={styles.infoValue}>
              {(profile?.username || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Share Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share My Transactions</Text>
        <View style={styles.shareCard}>
          <Text style={styles.shareDescription}>
            Share your financial data with trusted friends or family members
          </Text>
          
          <View style={styles.shareInputContainer}>
            <TextInput
              style={styles.shareInput}
              placeholder="Enter username to share with"
              value={shareUsername}
              onChangeText={setShareUsername}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[styles.shareButton, sharingLoading && styles.shareButtonDisabled]}
              onPress={handleShare}
              disabled={sharingLoading}
            >
              <Text style={styles.shareButtonText}>
                {sharingLoading ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>

          {message && (
            <View style={[
              styles.messageContainer,
              message.includes('Error') || message.includes('not found') || message.includes('already')
                ? styles.errorMessage
                : styles.successMessage
            ]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Shared Users List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currently Sharing With</Text>
        <View style={styles.sharedUsersCard}>
          {sharedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No shared users</Text>
              <Text style={styles.emptySubtitle}>You are not sharing your transactions with anyone yet.</Text>
            </View>
          ) : (
            <View style={styles.sharedUsersList}>
              {sharedUsers.map((sharedUser) => (
                <View key={sharedUser.id} style={styles.sharedUserItem}>
                  <View style={styles.sharedUserInfo}>
                    <Text style={styles.sharedUserName}>
                      {sharedUser.profiles?.username || 'Unknown User'}
                    </Text>
                    <Text style={styles.sharedUserDate}>
                      Shared since {new Date(sharedUser.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => handleRevokeAccess(sharedUser.viewer_user_id)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  shareCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  shareInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1e293b',
  },
  shareButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sharedUsersCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  sharedUsersList: {
    gap: 12,
  },
  sharedUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  sharedUserInfo: {
    flex: 1,
  },
  sharedUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sharedUserDate: {
    fontSize: 12,
    color: '#64748b',
  },
  revokeButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  revokeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
