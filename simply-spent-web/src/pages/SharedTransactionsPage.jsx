import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function SharedTransactionsPage({ user }) {
  const [sharedTransactions, setSharedTransactions] = useState([])
  const [sharedUsers, setSharedUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSharedTransactions = async () => {
    try {
      // First, get all users who have shared their transactions with the current user
      const { data: sharedAccess, error: accessError } = await supabase
        .from('shared_access')
        .select(`
          owner_user_id,
          created_at,
          profiles!shared_access_owner_user_id_fkey (
            username
          )
        `)
        .eq('viewer_user_id', user.id)

      if (accessError) throw accessError

      if (!sharedAccess || sharedAccess.length === 0) {
        setSharedTransactions([])
        setSharedUsers([])
        return
      }

      // Get transactions from all users who have shared with the current user
      const ownerIds = sharedAccess.map(access => access.owner_user_id)
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey (
            username
          )
        `)
        .in('user_id', ownerIds)
        .order('transaction_date', { ascending: false })

      if (transactionsError) throw transactionsError

      setSharedTransactions(transactions || [])
      setSharedUsers(sharedAccess)
    } catch (error) {
      console.error('Error fetching shared transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSharedTransactions()
  }, [user.id])

  const getCategoryColor = (category, type) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Shared Users Summary */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shared With You</h2>
        <p className="text-gray-600 mb-6">
          {sharedUsers.length} user{sharedUsers.length !== 1 ? 's' : ''} sharing their transactions
        </p>
        
        {sharedUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared transactions yet</h3>
            <p className="text-gray-500">When other users share their transactions with you, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedUsers.map((sharedUser) => (
              <div key={sharedUser.owner_user_id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(sharedUser.profiles?.username || 'Unknown').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {sharedUser.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shared since {new Date(sharedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Transactions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Shared Transactions</h3>
              <p className="text-sm text-gray-500">
                {sharedTransactions.length} transaction{sharedTransactions.length !== 1 ? 's' : ''} shared
              </p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200/50">
          {sharedTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shared transactions</h3>
              <p className="text-gray-500">When other users share their transactions with you, they will appear here.</p>
            </div>
          ) : (
            sharedTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200">
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(transaction.category, transaction.transaction_type)}`}>
                          {transaction.category}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          by {(transaction.profiles?.username || 'Unknown').charAt(0).toUpperCase()}.{transaction.profiles?.username || 'Unknown'}
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
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.transaction_type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'INCOME' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.transaction_type.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SharedTransactionsPage
