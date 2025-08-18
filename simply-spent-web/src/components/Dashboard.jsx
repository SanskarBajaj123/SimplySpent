import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import TransactionItem from './TransactionItem'
import TransactionModal from './TransactionModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'

function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user.id])

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowModal(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDeleteTransaction = (transaction) => {
    setDeletingTransaction(transaction)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', deletingTransaction.id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== deletingTransaction.id))
      setShowDeleteModal(false)
      setDeletingTransaction(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDeletingTransaction(null)
  }

  const handleTransactionUpdated = () => {
    fetchTransactions()
    setShowModal(false)
    setEditingTransaction(null)
  }

  const calculateSummary = () => {
    const income = transactions
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    const expenses = transactions
      .filter(t => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    return {
      income,
      expenses,
      balance: income - expenses
    }
  }

  const summary = calculateSummary()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold">₹{summary.income.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">₹{summary.expenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 text-white shadow-lg ${
          summary.balance >= 0 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Balance</p>
              <p className="text-2xl font-bold">₹{summary.balance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={handleAddTransaction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-6">Start tracking your finances by adding your first transaction.</p>
              <button
                onClick={handleAddTransaction}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTransaction(null)
        }}
        onTransactionAdded={handleTransactionUpdated}
        onTransactionUpdated={handleTransactionUpdated}
        editingTransaction={editingTransaction}
        user={user}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        transaction={deletingTransaction}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Dashboard
