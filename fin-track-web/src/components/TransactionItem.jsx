import { useState } from 'react'

function TransactionItem({ transaction }) {
  const [isHovered, setIsHovered] = useState(false)

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

  const isIncome = transaction.transaction_type === 'INCOME'
  const amount = parseFloat(transaction.amount)
  const formattedAmount = isIncome ? `+₹${amount.toFixed(2)}` : `-₹${amount.toFixed(2)}`

  return (
    <div
      className={`px-6 py-4 transition-all duration-200 hover:bg-gray-50/50 cursor-pointer ${
        isHovered ? 'transform scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Icon and Details */}
        <div className="flex items-center space-x-4">
          {/* Category Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
            isIncome ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {getCategoryIcon(transaction.category)}
          </div>
          
          {/* Transaction Details */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h4 className="font-semibold text-gray-900">
                {transaction.category}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(transaction.category, transaction.transaction_type)}`}>
                {transaction.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatDate(transaction.transaction_date)}</span>
              {transaction.notes && (
                <span className="flex items-center">
                  <span className="mr-1">📝</span>
                  {transaction.notes.length > 30 
                    ? `${transaction.notes.substring(0, 30)}...` 
                    : transaction.notes
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Amount and Type */}
        <div className="text-right">
          <div className={`text-lg font-bold ${
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

      {/* Hover effect indicator */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none"></div>
      )}
    </div>
  )
}

export default TransactionItem
