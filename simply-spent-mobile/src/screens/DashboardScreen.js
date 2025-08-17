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
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0
  })

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

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
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
          ${parseFloat(item.amount).toFixed(2)}
        </Text>
        <Text style={styles.transactionType}>{item.transaction_type}</Text>
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
            ${amount.toFixed(2)}
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
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          onTransactionAdded={handleTransactionAdded}
          user={user}
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
