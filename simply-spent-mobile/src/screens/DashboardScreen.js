import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../supabaseClient'
import TransactionModal from '../components/TransactionModal'

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0
  })

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
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(10)

      if (error) throw error
      setTransactions(data || [])
      
      // Calculate summary
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const monthlyTransactions = data?.filter(t => {
        const date = new Date(t.transaction_date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }) || []

      const income = monthlyTransactions
        .filter(t => t.transaction_type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const expense = monthlyTransactions
        .filter(t => t.transaction_type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      setSummary({
        income,
        expense,
        balance: income - expense
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
      Alert.alert('Error', 'Failed to load transactions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchTransactions()
  }, [user.id])

  const onRefresh = () => {
    setRefreshing(true)
    fetchTransactions()
  }

  const handleTransactionAdded = () => {
    setShowModal(false)
    fetchTransactions()
  }

  const handleTransactionUpdated = () => {
    setShowModal(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transaction.id)

              if (error) throw error

              Alert.alert('Success', 'Transaction deleted successfully')
              fetchTransactions()
            } catch (error) {
              console.error('Error deleting transaction:', error)
              Alert.alert('Error', 'Failed to delete transaction')
            }
          },
        },
      ]
    )
  }

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <TouchableOpacity 
        style={styles.transactionContent}
        onPress={() => handleEditTransaction(item)}
      >
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
            <Text style={styles.transactionCategory}>{item.category}</Text>
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
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTransaction(item)}
        >
          <Ionicons name="pencil" size={16} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTransaction(item)}
        >
          <Ionicons name="trash" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const SummaryCard = ({ title, amount, color, icon }) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryContent}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={[styles.summaryAmount, { color }]}>
            ₹{amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Welcome back,{' '}
              <Text style={styles.usernameText}>
                {profile?.username || user?.email?.split('@')[0] || 'User'}!
              </Text>
              <Text style={styles.waveEmoji}> 👋</Text>
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Here's your financial overview for today
            </Text>
          </View>
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedLabel}>Last updated</Text>
            <Text style={styles.lastUpdatedTime}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            <View style={styles.onlineIndicator} />
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <SummaryCard
          title="This Month's Income"
          amount={summary.income}
          color="#16a34a"
          icon="trending-up"
        />
        <SummaryCard
          title="This Month's Expense"
          amount={summary.expense}
          color="#dc2626"
          icon="trending-down"
        />
        <SummaryCard
          title="Current Balance"
          amount={summary.balance}
          color={summary.balance >= 0 ? "#16a34a" : "#dc2626"}
          icon="wallet"
        />
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          <Text style={styles.transactionsSubtitle}>Tap to edit, long press for actions</Text>
        </View>
        
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet. Add your first transaction!</Text>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTransaction(null)
          setShowModal(true)
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          isVisible={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingTransaction(null)
          }}
          onTransactionAdded={handleTransactionAdded}
          onTransactionUpdated={handleTransactionUpdated}
          user={user}
          transaction={editingTransaction}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  usernameText: {
    color: '#7c3aed',
  },
  waveEmoji: {
    fontSize: 20,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  lastUpdated: {
    alignItems: 'flex-end',
  },
  lastUpdatedLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  lastUpdatedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginTop: 4,
  },
  summaryContainer: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: 12,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
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
    color: '#111827',
  },
  transactionsSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionContent: {
    flex: 1,
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
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionNotes: {
    fontSize: 14,
    color: '#6b7280',
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
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
})
