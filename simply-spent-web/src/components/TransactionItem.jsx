import { useState } from 'react'
import { supabase } from '../supabaseClient'

function TransactionItem({ transaction, onTransactionUpdated, onTransactionDeleted }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    amount: transaction.amount,
    category: transaction.category,
    notes: transaction.notes || '',
    transaction_date: transaction.transaction_date.split('T')[0]
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      // Expense icons
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Utilities': '⚡',
      'Rent/Mortgage': '🏠',
      'Insurance': '🛡️',
      'Education': '📚',
      'Travel': '✈️',
      'Subscriptions': '📱',
      // Income icons
      'Salary': '💼',
      'Freelance': '💻',
      'Investment': '📈',
      'Business': '🏢',
      'Gift': '🎁',
      'Refund': '↩️',
      'Bonus': '🎯',
      'Other': '📋'
    }
    return iconMap[category] || '💰'
  }

  const getCategoryColor = (category, type) => {
    if (type === 'INCOME') {
      return 'bg-green-100 text-green-700 border-green-200'
    }
    
    const colorMap = {
      'Food & Dining': 'bg-orange-100 text-orange-700 border-orange-200',
      'Transportation': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shopping': 'bg-pink-100 text-pink-700 border-pink-200',
      'Entertainment': 'bg-purple-100 text-purple-700 border-purple-200',
      'Healthcare': 'bg-red-100 text-red-700 border-red-200',
      'Utilities': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Rent/Mortgage': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Insurance': 'bg-teal-100 text-teal-700 border-teal-200',
      'Education': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Travel': 'bg-amber-100 text-amber-700 border-amber-200',
      'Subscriptions': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const handleEdit = async () => {
    try {
      console.log('Updating transaction:', transaction.id, editForm)
      
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          notes: editForm.notes,
          transaction_date: editForm.transaction_date
        })
        .eq('id', transaction.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Transaction updated successfully')
      setIsEditing(false)
      onTransactionUpdated()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Failed to update transaction. Please try again.')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log('Deleting transaction:', transaction.id)
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Transaction deleted successfully')
      setShowDeleteConfirm(false)
      onTransactionDeleted()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isIncome = transaction.transaction_type === 'INCOME'
  const amount = parseFloat(transaction.amount)
  const formattedAmount = isIncome ? `+₹${amount.toFixed(2)}` : `-₹${amount.toFixed(2)}`

  if (isEditing) {
    return (
      <div className="px-4 sm:px-6 py-4 bg-blue-50/50 border-l-4 border-blue-500 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Edit Transaction</h4>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {transaction.transaction_type === 'EXPENSE' ? (
                  <>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent/Mortgage">Rent/Mortgage</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Business">Business</option>
                    <option value="Gift">Gift</option>
                    <option value="Refund">Refund</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editForm.transaction_date}
                onChange={(e) => setEditForm({...editForm, transaction_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`px-4 sm:px-6 py-4 transition-all duration-200 hover:bg-gray-50/50 cursor-pointer relative group ${
        isHovered ? 'transform scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Icon and Details */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* Category Icon */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm flex-shrink-0 ${
            isIncome ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {getCategoryIcon(transaction.category)}
          </div>
          
          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {transaction.category}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getCategoryColor(transaction.category, transaction.transaction_type)}`}>
                {transaction.category}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500">
              <span>{formatDate(transaction.transaction_date)}</span>
              {transaction.notes && (
                <span className="flex items-center truncate">
                  <span className="mr-1">📝</span>
                  <span className="truncate">
                    {transaction.notes.length > 20 
                      ? `${transaction.notes.substring(0, 20)}...` 
                      : transaction.notes
                    }
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Amount and Actions */}
        <div className="text-right flex-shrink-0 ml-2">
          <div className={`text-base sm:text-lg font-bold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}>
            {formattedAmount}
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            isIncome 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {transaction.transaction_type}
          </div>
        </div>
      </div>

      {/* Action Buttons - Always visible on mobile, hover on desktop */}
      <div className={`absolute top-2 right-2 flex space-x-1 sm:space-x-2 ${
        isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
      } transition-opacity duration-200 sm:group-hover:opacity-100`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
          title="Edit transaction"
        >
          <span className="text-sm sm:text-base">✏️</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteConfirm(true)
          }}
          className="p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
          title="Delete transaction"
        >
          <span className="text-sm sm:text-base">🗑️</span>
        </button>
      </div>

      {/* Mobile Action Buttons - Always visible on mobile */}
      <div className="sm:hidden flex justify-center mt-3 space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors text-sm"
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteConfirm(true)
          }}
          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors text-sm"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Transaction</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover effect indicator - Desktop only */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none hidden sm:block"></div>
      )}
      
      {/* Click hint - Desktop only */}
      {isHovered && (
        <div className="absolute bottom-1 left-6 text-xs text-blue-600 opacity-75 hidden sm:block">
          Click to edit
        </div>
      )}
    </div>
  )
}

export default TransactionItem
