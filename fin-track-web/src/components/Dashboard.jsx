import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import TransactionModal from './TransactionModal'
import TransactionItem from './TransactionItem'

function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user.id])

  const handleTransactionAdded = () => {
    setShowModal(false)
    fetchTransactions()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blue-600 font-semibold">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Monthly Income</p>
              <p className="text-3xl font-bold text-green-700">₹{summary.income.toFixed(2)}</p>
              <p className="text-xs text-green-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Monthly Expense</p>
              <p className="text-3xl font-bold text-red-700">₹{summary.expense.toFixed(2)}</p>
              <p className="text-xs text-red-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💸</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-orange-50 to-red-50 border-orange-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-1`}>Net Balance</p>
              <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ₹{summary.balance.toFixed(2)}
              </p>
              <p className={`text-xs ${summary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'} mt-1`}>
                {summary.balance >= 0 ? 'In profit' : 'In deficit'}
              </p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-red-500'} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-xl">{summary.balance >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Manage your transactions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">➕</span>
              Add Transaction
            </span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-500">Live updates</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200/50">
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Add First Transaction
              </button>
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onTransactionAdded={handleTransactionAdded}
          user={user}
        />
      )}
    </div>
  )
}

export default Dashboard
