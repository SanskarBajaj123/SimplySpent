import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

function MetricsPage({ user }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    topCategories: [],
    monthlyTrend: [],
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

    // Calculate expense breakdown for pie chart
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
      monthlyTrend: calculateMonthlyTrend(data),
      expenseBreakdown,
      incomeBreakdown
    })
  }

  const calculateMonthlyTrend = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    const trend = []

    for (let i = 0; i < 12; i++) {
      const monthData = data.filter(t => {
        const date = new Date(t.transaction_date)
        return date.getFullYear() === currentYear && date.getMonth() === i
      })

      const income = monthData
        .filter(t => t.transaction_type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const expense = monthData
        .filter(t => t.transaction_type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      trend.push({
        month: months[i],
        income,
        expense,
        balance: income - expense
      })
    }

    return trend
  }

  useEffect(() => {
    fetchTransactions()
  }, [user.id, selectedPeriod])

  // Chart configurations
  const expensePieData = {
    labels: metrics.expenseBreakdown.map(item => item.category),
    datasets: [
      {
        data: metrics.expenseBreakdown.map(item => item.amount),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
          '#F8C471', '#82E0AA'
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
      },
    ],
  }

  const incomePieData = {
    labels: metrics.incomeBreakdown.map(item => item.category),
    datasets: [
      {
        data: metrics.incomeBreakdown.map(item => item.amount),
        backgroundColor: [
          '#2ECC71', '#3498DB', '#9B59B6', '#E67E22', '#1ABC9C',
          '#F39C12', '#E74C3C', '#34495E', '#16A085', '#27AE60'
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
      },
    ],
  }

  const monthlyTrendData = {
    labels: metrics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: metrics.monthlyTrend.map(item => item.income),
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: metrics.monthlyTrend.map(item => item.expense),
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const topCategoriesData = {
    labels: metrics.topCategories.map(item => item.category),
    datasets: [
      {
        label: 'Amount (₹)',
        data: metrics.topCategories.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ₹${context.parsed.toFixed(2)}`
          }
        }
      }
    }
  }

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 11,
            weight: '500'
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blue-600 font-semibold">Loading analytics...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Period Selector */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Analytics
            </h2>
            <p className="text-gray-600 mt-1">Track your spending patterns and insights</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'year', label: 'This Year' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Income</p>
              <p className="text-3xl font-bold text-green-700">₹{metrics.totalIncome.toFixed(2)}</p>
              <p className="text-xs text-green-500 mt-1">Selected period</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-red-700">₹{metrics.totalExpense.toFixed(2)}</p>
              <p className="text-xs text-red-500 mt-1">Selected period</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💸</span>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${metrics.netBalance >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-orange-50 to-red-50 border-orange-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${metrics.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-1`}>Net Balance</p>
              <p className={`text-3xl font-bold ${metrics.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ₹{metrics.netBalance.toFixed(2)}
              </p>
              <p className={`text-xs ${metrics.netBalance >= 0 ? 'text-blue-500' : 'text-orange-500'} mt-1`}>
                {metrics.netBalance >= 0 ? 'In profit' : 'In deficit'}
              </p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${metrics.netBalance >= 0 ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-red-500'} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-xl">{metrics.netBalance >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
            <p className="text-sm text-gray-600">Where your money goes</p>
          </div>
          <div className="p-6">
            {metrics.expenseBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expense data</h3>
                <p className="text-gray-500">Add some transactions to see your spending breakdown</p>
              </div>
            ) : (
              <div className="h-80">
                <Pie data={expensePieData} options={pieChartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Income Breakdown Doughnut Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
            <p className="text-sm text-gray-600">Where your money comes from</p>
          </div>
          <div className="p-6">
            {metrics.incomeBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No income data</h3>
                <p className="text-gray-500">Add some income transactions to see your sources</p>
              </div>
            ) : (
              <div className="h-80">
                <Doughnut data={incomePieData} options={pieChartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
          <p className="text-sm text-gray-600">Income vs Expenses over the year</p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Line data={monthlyTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Spending Categories Bar Chart */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">Top Spending Categories</h3>
          <p className="text-sm text-gray-600">Your highest expense categories</p>
        </div>
        <div className="p-6">
          {metrics.topCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No spending data</h3>
              <p className="text-gray-500">Add some transactions to see your spending patterns</p>
            </div>
          ) : (
            <div className="h-80">
              <Bar data={topCategoriesData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricsPage
