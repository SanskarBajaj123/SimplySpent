import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import { supabase } from '../supabaseClient'

const { width } = Dimensions.get('window')

export default function MetricsScreen({ route }) {
  const { user } = route.params
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    topCategories: [],
    expenseBreakdown: [],
    incomeBreakdown: []
  })

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      calculateMetrics(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (data) => {
    const currentDate = new Date()
    let filteredData = data

    // Filter by selected period
    if (selectedPeriod === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      filteredData = data.filter(t => new Date(t.transaction_date) >= startOfMonth)
    } else if (selectedPeriod === 'quarter') {
      const startOfQuarter = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1)
      filteredData = data.filter(t => new Date(t.transaction_date) >= startOfQuarter)
    } else if (selectedPeriod === 'year') {
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
      filteredData = data.filter(t => new Date(t.transaction_date) >= startOfYear)
    }

    // Calculate totals
    const income = filteredData
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    const expense = filteredData
      .filter(t => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    // Calculate expense breakdown
    const expenseCategories = {}
    filteredData
      .filter(t => t.transaction_type === 'EXPENSE')
      .forEach(t => {
        expenseCategories[t.category] = (expenseCategories[t.category] || 0) + parseFloat(t.amount)
      })

    const expenseBreakdown = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    // Calculate income breakdown
    const incomeCategories = {}
    filteredData
      .filter(t => t.transaction_type === 'INCOME')
      .forEach(t => {
        incomeCategories[t.category] = (incomeCategories[t.category] || 0) + parseFloat(t.amount)
      })

    const incomeBreakdown = Object.entries(incomeCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    setMetrics({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      topCategories: expenseBreakdown.slice(0, 5),
      expenseBreakdown,
      incomeBreakdown
    })
  }

  useEffect(() => {
    fetchTransactions()
  }, [user.id, selectedPeriod])

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const getCategoryColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    return colors[index % colors.length]
  }

  const renderSummaryCard = (title, amount, color, icon, subtitle) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryIcon}>{icon}</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={[styles.summaryAmount, { color }]}>{formatCurrency(amount)}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  )

  const renderCategoryBar = (category, amount, total, index) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0
    const barWidth = (percentage / 100) * (width - 80)
    
    return (
      <View key={category} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(index) }]} />
          <Text style={styles.categoryName}>{category}</Text>
          <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
        </View>
        <View style={styles.categoryBarContainer}>
          <View style={[styles.categoryBar, { width: barWidth, backgroundColor: getCategoryColor(index) }]} />
        </View>
        <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Financial Analytics</Text>
        <Text style={styles.subtitle}>Track your spending patterns</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[
          { value: 'month', label: 'Month' },
          { value: 'quarter', label: 'Quarter' },
          { value: 'year', label: 'Year' }
        ].map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.value && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {renderSummaryCard(
          'Total Income',
          metrics.totalIncome,
          '#10B981',
          '💰',
          'Selected period'
        )}
        {renderSummaryCard(
          'Total Expenses',
          metrics.totalExpense,
          '#EF4444',
          '💸',
          'Selected period'
        )}
        {renderSummaryCard(
          'Net Balance',
          metrics.netBalance,
          metrics.netBalance >= 0 ? '#3B82F6' : '#F59E0B',
          metrics.netBalance >= 0 ? '📈' : '📉',
          metrics.netBalance >= 0 ? 'In profit' : 'In deficit'
        )}
      </View>

      {/* Top Spending Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Spending Categories</Text>
        {metrics.topCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No spending data</Text>
            <Text style={styles.emptySubtitle}>Add some transactions to see your spending patterns</Text>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {metrics.topCategories.map((item, index) =>
              renderCategoryBar(item.category, item.amount, metrics.totalExpense, index)
            )}
          </View>
        )}
      </View>

      {/* Expense Breakdown */}
      {metrics.expenseBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <View style={styles.breakdownContainer}>
            {metrics.expenseBreakdown.slice(0, 8).map((item, index) => (
              <View key={item.category} style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: getCategoryColor(index) }]} />
                <Text style={styles.breakdownCategory}>{item.category}</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Income Breakdown */}
      {metrics.incomeBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Sources</Text>
          <View style={styles.breakdownContainer}>
            {metrics.incomeBreakdown.slice(0, 8).map((item, index) => (
              <View key={item.category} style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: getCategoryColor(index) }]} />
                <Text style={styles.breakdownCategory}>{item.category}</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>Add your first transaction to start tracking your finances</Text>
        </View>
      )}
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
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  summaryContainer: {
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  breakdownCategory: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
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
})
