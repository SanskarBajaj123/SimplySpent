import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../supabaseClient'

export default function SharedTransactionsScreen({ route }) {
  const { user } = route.params
  const [sharedTransactions, setSharedTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sharedUsers, setSharedUsers] = useState([])

  const fetchSharedTransactions = async () => {
    try {
      // First, get all users who have shared their transactions with the current user
      const { data: sharedAccess, error: accessError } = await supabase
        .from('shared_access')
        .select(`
          owner_user_id,
          created_at,
          profiles!shared_access_owner_user_id_fkey (
            username
          )
        `)
        .eq('viewer_user_id', user.id)

      if (accessError) throw accessError

      if (!sharedAccess || sharedAccess.length === 0) {
        setSharedTransactions([])
        setSharedUsers([])
        return
      }

      // Get transactions from all users who have shared with the current user
      const ownerIds = sharedAccess.map(access => access.owner_user_id)
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey (
            username
          )
        `)
        .in('user_id', ownerIds)
        .order('transaction_date', { ascending: false })

      if (transactionsError) throw transactionsError

      setSharedTransactions(transactions || [])
      setSharedUsers(sharedAccess)
    } catch (error) {
      console.error('Error fetching shared transactions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSharedTransactions()
  }, [user.id])

  const onRefresh = () => {
    setRefreshing(true)
    fetchSharedTransactions()
  }

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.transaction_type === 'INCOME' ? '#dcfce7' : '#fee2e2' }
          ]}>
            <Ionicons 
              name="cash-outline" 
              size={20} 
              color={item.transaction_type === 'INCOME' ? '#16a34a' : '#dc2626'} 
            />
          </View>
          <View style={styles.transactionInfo}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionCategory}>{item.category}</Text>
              <Text style={styles.sharedByText}>by {(item.profiles?.username || 'Unknown').charAt(0).toUpperCase()}.{item.profiles?.username || 'Unknown'}</Text>
            </View>
            {item.notes && (
              <Text style={styles.transactionNotes}>{item.notes}</Text>
            )}
            <Text style={styles.transactionDate}>
              {new Date(item.transaction_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: item.transaction_type === 'INCOME' ? '#16a34a' : '#dc2626' }
          ]}>
            {item.transaction_type === 'INCOME' ? '+' : '-'}
            ₹{parseFloat(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.transactionType}>{item.transaction_type}</Text>
        </View>
      </View>
    </View>
  )

  const renderSharedUser = ({ item }) => (
    <View style={styles.sharedUserCard}>
      <View style={styles.sharedUserInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>
            {(item.profiles?.username || 'Unknown').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.profiles?.username || 'Unknown User'}</Text>
          <Text style={styles.sharedDate}>
            Shared since {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.sharedIcon}>
        <Ionicons name="share-outline" size={20} color="#2563eb" />
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading shared transactions...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Shared Users Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Shared With You</Text>
        <Text style={styles.summarySubtitle}>
          {sharedUsers.length} user{sharedUsers.length !== 1 ? 's' : ''} sharing their transactions
        </Text>
        
        <FlatList
          data={sharedUsers}
          renderItem={renderSharedUser}
          keyExtractor={(item) => item.owner_user_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sharedUsersList}
          ListEmptyComponent={
            <View style={styles.emptySharedUsers}>
              <Text style={styles.emptyText}>No users have shared transactions with you yet.</Text>
            </View>
          }
        />
      </View>

      {/* Shared Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Shared Transactions</Text>
          <Text style={styles.transactionsSubtitle}>
            {sharedTransactions.length} transaction{sharedTransactions.length !== 1 ? 's' : ''} shared
          </Text>
        </View>
        
        <FlatList
          data={sharedTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="share-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No shared transactions</Text>
              <Text style={styles.emptySubtitle}>
                When other users share their transactions with you, they will appear here.
              </Text>
            </View>
          }
        />
      </View>
    </View>
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
  summaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  sharedUsersList: {
    paddingRight: 20,
  },
  sharedUserCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 140,
  },
  sharedUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  sharedDate: {
    fontSize: 10,
    color: '#64748b',
  },
  sharedIcon: {
    marginLeft: 8,
  },
  emptySharedUsers: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  transactionsSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  sharedByText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  transactionNotes: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
})
