import React from 'react'

function TransactionItem({ transaction, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800 border-orange-200',
      'Transportation': 'bg-blue-100 text-blue-800 border-blue-200',
      'Shopping': 'bg-purple-100 text-purple-800 border-purple-200',
      'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
      'Healthcare': 'bg-red-100 text-red-800 border-red-200',
      'Education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Utilities': 'bg-gray-100 text-gray-800 border-gray-200',
      'Salary': 'bg-green-100 text-green-800 border-green-200',
      'Freelance': 'bg-teal-100 text-teal-800 border-teal-200',
      'Investment': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Other': 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[category] || colors['Other']
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            transaction.transaction_type === 'INCOME' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            <span className="text-xl">
              {transaction.transaction_type === 'INCOME' ? '💰' : '💸'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{transaction.category}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(transaction.category)}`}>
                {transaction.category}
              </span>
            </div>
            {transaction.notes && (
              <p className="text-sm text-gray-600 mb-1">
                {transaction.notes.length > 50 
                  ? `${transaction.notes.substring(0, 50)}...`
                  : transaction.notes
                }
              </p>
            )}
            <p className="text-xs text-gray-500">
              {new Date(transaction.transaction_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right mr-4">
            <p className={`text-lg font-bold ${
              transaction.transaction_type === 'INCOME' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.transaction_type === 'INCOME' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {transaction.transaction_type.toLowerCase()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200"
              title="Edit transaction"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(transaction)}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
              title="Delete transaction"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
