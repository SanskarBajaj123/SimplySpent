import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function TransactionModal({ isOpen, onClose, onTransactionAdded, onTransactionUpdated, user, transaction = null }) {
  const [formData, setFormData] = useState({
    amount: '',
    transaction_type: 'EXPENSE',
    category: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fixed category options
  const categoryOptions = {
    EXPENSE: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Utilities',
      'Rent/Mortgage',
      'Insurance',
      'Education',
      'Travel',
      'Subscriptions',
      'Other'
    ],
    INCOME: [
      'Salary',
      'Freelance',
      'Investment',
      'Business',
      'Gift',
      'Refund',
      'Bonus',
      'Other'
    ]
  }

  // Reset form when modal opens/closes or when transaction changes
  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      setFormData({
        amount: transaction.amount.toString(),
        transaction_type: transaction.transaction_type,
        category: transaction.category,
        notes: transaction.notes || '',
        transaction_date: transaction.transaction_date.split('T')[0]
      })
    } else {
      // Adding new transaction
      setFormData({
        amount: '',
        transaction_type: 'EXPENSE',
        category: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    }
    setErrors({})
  }, [transaction, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear category when switching transaction type
    if (field === 'transaction_type') {
      setFormData(prev => ({ ...prev, [field]: value, category: '' }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Please select a date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: parseFloat(formData.amount),
            transaction_type: formData.transaction_type,
            category: formData.category,
            notes: formData.notes,
            transaction_date: formData.transaction_date
          })
          .eq('id', transaction.id)

        if (error) throw error

        onTransactionUpdated()
      } else {
        // Add new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              amount: parseFloat(formData.amount),
              transaction_type: formData.transaction_type,
              category: formData.category,
              notes: formData.notes,
              transaction_date: formData.transaction_date
            }
          ])

        if (error) throw error

        onTransactionAdded()
      }

      // Reset form
      setFormData({
        amount: '',
        transaction_type: 'EXPENSE',
        category: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0]
      })
      setErrors({})
      
      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!transaction

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="mr-2">{isEditing ? '✏️' : '💰'}</span>
                  {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {isEditing ? 'Update your transaction details' : 'Track your income or expense'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                    errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('transaction_type', 'EXPENSE')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    formData.transaction_type === 'EXPENSE'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">💸</span>
                    <span className="font-medium">Expense</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('transaction_type', 'INCOME')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    formData.transaction_type === 'INCOME'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">💰</span>
                    <span className="font-medium">Income</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categoryOptions[formData.transaction_type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.transaction_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.transaction_date && (
                <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  isEditing ? 'Update Transaction' : 'Add Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal
