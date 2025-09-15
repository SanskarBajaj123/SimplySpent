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
  const [displayedTransactions, setDisplayedTransactions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 })
  const transactionsPerPage = 10

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)

      if (error) throw error

      const income = data
        ?.filter(t => t.transaction_type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
      
      const expenses = data
        ?.filter(t => t.transaction_type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

      setSummary({
        income,
        expenses,
        balance: income - expenses
      })
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      updateDisplayedTransactions(data || [], 1)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayedTransactions = (allTransactions, page) => {
    const startIndex = (page - 1) * transactionsPerPage
    const endIndex = startIndex + transactionsPerPage
    setDisplayedTransactions(allTransactions.slice(0, endIndex))
  }

  const loadMore = () => {
    if (displayedTransactions.length < transactions.length) {
      setLoadingMore(true)
      setTimeout(() => {
        const nextPage = currentPage + 1
        updateDisplayedTransactions(transactions, nextPage)
        setCurrentPage(nextPage)
        setLoadingMore(false)
      }, 500) // Small delay for better UX
    }
  }

  useEffect(() => {
    fetchSummary()
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
      setDisplayedTransactions(prev => prev.filter(t => t.id !== deletingTransaction.id))
      fetchSummary() // Refresh summary after deletion
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
    fetchSummary()
    fetchTransactions()
    setShowModal(false)
    setEditingTransaction(null)
    setCurrentPage(1)
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

      {/* All Transactions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">All Transactions</h3>
              <p className="text-sm text-gray-500">
                Showing {displayedTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
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
              {displayedTransactions.map((transaction) => (
               <TransactionItem 
                 key={transaction.id} 
                 transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ))}
              
              {/* Load More Button */}
              {displayedTransactions.length < transactions.length && (
                <div className="text-center pt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <span className="text-sm">({transactions.length - displayedTransactions.length} remaining)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* End Message */}
              {displayedTransactions.length === transactions.length && transactions.length > 0 && (
                <div className="text-center pt-6">
                  <p className="text-sm text-gray-500 italic">
                    You've reached the end of your transactions
                  </p>
                </div>
              )}
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
