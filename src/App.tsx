import { useState, useReducer, useEffect } from 'react'
import {
  LayoutDashboard,
  FileText,
  Users,
  Banknote,
  MoreVertical,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react'
import './App.css'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Member {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: 'food' | 'travel' | 'accommodation' | 'utilities' | 'entertainment' | 'other'
  paidBy: string
  splitWith: string[]
  date: string
  settled: boolean
}

interface Settlement {
  id: string
  from: string
  to: string
  amount: number
  date: string
  status: 'pending' | 'settled'
}

interface AppState {
  members: Member[]
  expenses: Expense[]
  settlements: Settlement[]
}

type AppAction =
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'MARK_EXPENSE_SETTLED'; payload: string }
  | { type: 'ADD_SETTLEMENT'; payload: Settlement }
  | { type: 'MARK_SETTLEMENT_SETTLED'; payload: string }

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@company.com',
    phone: '+91 98765 43210',
    avatar: '🧑',
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya@company.com',
    phone: '+91 98765 43211',
    avatar: '👩',
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@company.com',
    phone: '+91 98765 43212',
    avatar: '🧑',
  },
  {
    id: '4',
    name: 'Neha Desai',
    email: 'neha@company.com',
    phone: '+91 98765 43213',
    avatar: '👩',
  },
  {
    id: '5',
    name: 'Vikram Sharma',
    email: 'vikram@company.com',
    phone: '+91 98765 43214',
    avatar: '🧑',
  },
]

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    description: 'Office Lunch',
    amount: 2500,
    category: 'food',
    paidBy: '1',
    splitWith: ['1', '2', '3'],
    date: '2026-06-19',
    settled: false,
  },
  {
    id: '2',
    description: 'Team Dinner',
    amount: 5000,
    category: 'food',
    paidBy: '2',
    splitWith: ['1', '2', '3', '4', '5'],
    date: '2026-06-18',
    settled: false,
  },
  {
    id: '3',
    description: 'Cab to Client Meeting',
    amount: 800,
    category: 'travel',
    paidBy: '3',
    splitWith: ['3', '4'],
    date: '2026-06-17',
    settled: false,
  },
  {
    id: '4',
    description: 'Office Supplies',
    amount: 1200,
    category: 'other',
    paidBy: '1',
    splitWith: ['1', '2', '3', '4', '5'],
    date: '2026-06-16',
    settled: false,
  },
  {
    id: '5',
    description: 'Team Coffee Break',
    amount: 600,
    category: 'food',
    paidBy: '4',
    splitWith: ['1', '2', '3', '4', '5'],
    date: '2026-06-15',
    settled: false,
  },
]

const INITIAL_STATE: AppState = {
  members: MOCK_MEMBERS,
  expenses: MOCK_EXPENSES,
  settlements: [],
}

// ============================================================================
// REDUCER
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] }
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.payload),
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'MARK_EXPENSE_SETTLED':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload ? { ...e, settled: true } : e
        ),
      }
    case 'ADD_SETTLEMENT':
      return { ...state, settlements: [...state.settlements, action.payload] }
    case 'MARK_SETTLEMENT_SETTLED':
      return {
        ...state,
        settlements: state.settlements.map((s) =>
          s.id === action.payload ? { ...s, status: 'settled' } : s
        ),
      }
    default:
      return state
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getMemberName(memberId: string, members: Member[]): string {
  return members.find((m) => m.id === memberId)?.name || 'Unknown'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-800',
    travel: 'bg-blue-100 text-blue-800',
    accommodation: 'bg-purple-100 text-purple-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    entertainment: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.other
}

function calculateBalances(
  expenses: Expense[],
  members: Member[]
): Record<string, number> {
  const balances: Record<string, number> = {}

  members.forEach((m) => {
    balances[m.id] = 0
  })

  expenses.forEach((expense) => {
    const splitAmount = expense.amount / expense.splitWith.length
    balances[expense.paidBy] += expense.amount

    expense.splitWith.forEach((memberId) => {
      balances[memberId] -= splitAmount
    })
  })

  return balances
}

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

interface DashboardProps {
  state: AppState
}

function Dashboard({ state }: DashboardProps) {
  const balances = calculateBalances(state.expenses, state.members)
  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0)
  const averagePerPerson = totalExpenses / (state.members.length || 1)

  const recentExpenses = state.expenses.slice(0, 5)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">OfficeSplit</h1>
        <p className="text-blue-100">Split expenses fairly with your team</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Per Person</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{averagePerPerson.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.members.length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Your Balance */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balance</h2>
        <div className="space-y-3">
          {state.members.slice(0, 3).map((member) => {
            const balance = balances[member.id]
            const isPositive = balance > 0
            return (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{member.avatar}</span>
                  <span className="font-medium text-gray-900">{member.name}</span>
                </div>
                <span
                  className={`font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{expense.description}</p>
                <p className="text-sm text-gray-600">
                  {getMemberName(expense.paidBy, state.members)} •{' '}
                  {new Date(expense.date).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{expense.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXPENSES PAGE
// ============================================================================

interface ExpensesPageProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

function ExpensesPage({ state, dispatch }: ExpensesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    description: string
    amount: string
    category: 'food' | 'travel' | 'accommodation' | 'utilities' | 'entertainment' | 'other'
    paidBy: string
    splitWith: string[]
  }>({
    description: '',
    amount: '',
    category: 'food',
    paidBy: state.members[0]?.id || '',
    splitWith: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || formData.splitWith.length === 0) {
      alert('Please fill all fields')
      return
    }

    const expense: Expense = {
      id: editingId || generateId(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      paidBy: formData.paidBy,
      splitWith: formData.splitWith,
      date: new Date().toISOString().split('T')[0],
      settled: false,
    }

    if (editingId) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense })
      setEditingId(null)
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expense })
    }

    setFormData({
      description: '',
      amount: '',
      category: 'food',
      paidBy: state.members[0]?.id || '',
      splitWith: [],
    })
    setShowForm(false)
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      paidBy: expense.paidBy,
      splitWith: expense.splitWith,
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleToggleSplitMember = (memberId: string) => {
    setFormData({
      ...formData,
      splitWith: formData.splitWith.includes(memberId)
        ? formData.splitWith.filter((id) => id !== memberId)
        : [...formData.splitWith, memberId],
    })
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({
              description: '',
              amount: '',
              category: 'food',
              paidBy: state.members[0]?.id || '',
              splitWith: [],
            })
          }}
          className="bg-white text-blue-600 p-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4"
        >
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as Expense['category'],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="accommodation">Accommodation</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>

          <select
            value={formData.paidBy}
            onChange={(e) =>
              setFormData({ ...formData, paidBy: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select who paid</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split with:
            </label>
            <div className="space-y-2">
              {state.members.map((member) => (
                <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.splitWith.includes(member.id)}
                    onChange={() => handleToggleSplitMember(member.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Add'} Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {state.expenses.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
            <p>No expenses yet. Add one to get started!</p>
          </div>
        ) : (
          state.expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {expense.description}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                    {expense.settled && (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                        Settled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getMemberName(expense.paidBy, state.members)} •{' '}
                    {new Date(expense.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Split with: {expense.splitWith.map((id) => getMemberName(id, state.members)).join(', ')}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-200"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })}
                  className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {!expense.settled && (
                  <button
                    onClick={() =>
                      dispatch({ type: 'MARK_EXPENSE_SETTLED', payload: expense.id })
                    }
                    className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-200"
                  >
                    <Check className="w-4 h-4" />
                    Settle
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MEMBERS PAGE
// ============================================================================

interface MembersPageProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

function MembersPage({ state, dispatch }: MembersPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Please fill all required fields')
      return
    }

    const member: Member = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.name[0].toUpperCase() === 'A' ? '👩' : '🧑',
    }

    dispatch({ type: 'ADD_MEMBER', payload: member })
    setFormData({ name: '', email: '', phone: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-blue-600 p-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="tel"
            placeholder="Phone (Optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Add Member
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {state.members.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
            <p>No members yet. Add one to get started!</p>
          </div>
        ) : (
          state.members.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-4xl">{member.avatar}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  {member.phone && (
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'DELETE_MEMBER', payload: member.id })}
                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// SETTLEMENTS PAGE
// ============================================================================

interface SettlementsPageProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

function SettlementsPage({ state, dispatch }: SettlementsPageProps) {
  const balances = calculateBalances(state.expenses, state.members)
  const [settlements, setSettlements] = useState<Array<{ from: string; to: string; amount: number }>>([])

  // Calculate who owes whom
  const calculateSettlements = () => {
    const result: Array<{ from: string; to: string; amount: number }> = []
    const memberBalances = { ...balances }

    const debtors = Object.entries(memberBalances)
      .filter(([, amount]) => amount < 0)
      .sort((a, b) => a[1] - b[1])

    const creditors = Object.entries(memberBalances)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])

    let debtorIdx = 0
    let creditorIdx = 0

    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
      const [debtor, debtAmount] = debtors[debtorIdx]
      const [creditor, creditAmount] = creditors[creditorIdx]

      const settleAmount = Math.min(Math.abs(debtAmount), creditAmount)

      result.push({
        from: debtor,
        to: creditor,
        amount: settleAmount,
      })

      memberBalances[debtor] += settleAmount
      memberBalances[creditor] -= settleAmount

      if (memberBalances[debtor] >= -0.01) debtorIdx++
      if (memberBalances[creditor] <= 0.01) creditorIdx++
    }

    return result
  }

  useEffect(() => {
    setSettlements(calculateSettlements())
  }, [state.expenses])

  return (
    <div className="space-y-4 pb-24">
      <div className="p-4 bg-blue-600 text-white rounded-lg">
        <h1 className="text-2xl font-bold">Settlements</h1>
        <p className="text-blue-100 text-sm mt-1">Mark payments as settled</p>
      </div>

      {settlements.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
          <p>All settled! Everyone is even.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settlements.map((settlement, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">
                    {state.members.find((m) => m.id === settlement.from)?.avatar}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getMemberName(settlement.from, state.members)}
                    </p>
                    <p className="text-sm text-gray-600">owes</p>
                  </div>
                </div>
                <Banknote className="w-5 h-5 text-blue-600 mx-2" />
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {getMemberName(settlement.to, state.members)}
                    </p>
                    <p className="text-sm text-gray-600">receives</p>
                  </div>
                  <span className="text-2xl">
                    {state.members.find((m) => m.id === settlement.to)?.avatar}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{settlement.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <button
                onClick={() => {
                  const newSettlement: Settlement = {
                    id: generateId(),
                    from: settlement.from,
                    to: settlement.to,
                    amount: settlement.amount,
                    date: new Date().toISOString().split('T')[0],
                    status: 'settled',
                  }
                  dispatch({ type: 'ADD_SETTLEMENT', payload: newSettlement })
                  setSettlements(settlements.filter((_, i) => i !== idx))
                }}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Mark as Settled
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Settled Transactions */}
      {state.settlements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Settled Transactions
          </h2>
          <div className="space-y-3">
            {state.settlements.map((settlement) => (
              <div
                key={settlement.id}
                className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    {getMemberName(settlement.from, state.members)} paid{' '}
                    {getMemberName(settlement.to, state.members)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(settlement.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <p className="font-semibold text-green-600">
                  ₹{settlement.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MORE MENU PAGES
// ============================================================================

function PersonalFinancePage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">Personal Finance</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4 text-center">
        <p className="text-gray-600 mb-4">View your personal financial summary</p>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">You are Owed</p>
            <p className="text-3xl font-bold text-blue-600">₹0</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">You Owe</p>
            <p className="text-3xl font-bold text-red-600">₹0</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Net Balance</p>
            <p className="text-3xl font-bold text-green-600">₹0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminPanelPage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">Admin Panel</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4">
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Manage Groups
          </button>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Manage Categories
          </button>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            System Settings
          </button>
          <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  )
}

function AuditTrailPage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">Audit Trail</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4">
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Added member Rajesh Kumar - Today at 9:30 AM</p>
          <p>• Created expense "Office Lunch" - Today at 12:00 PM</p>
          <p>• Updated expense "Team Dinner" - Yesterday</p>
          <p>• Marked settlement as completed - 2 days ago</p>
        </div>
      </div>
    </div>
  )
}

function NotificationsPage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">Notifications</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4 space-y-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-semibold text-gray-900">New Expense Added</p>
          <p className="text-sm text-gray-600">Team Dinner - ₹5000 • 2 hours ago</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="font-semibold text-gray-900">Settlement Completed</p>
          <p className="text-sm text-gray-600">Payment received • 1 day ago</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="font-semibold text-gray-900">New Member</p>
          <p className="text-sm text-gray-600">Vikram Sharma joined • 3 days ago</p>
        </div>
      </div>
    </div>
  )
}

function GSTQueuePage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">GST Queue</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4 text-center">
        <p className="text-gray-600 mb-6">Track GST-compliant expenses</p>
        <div className="space-y-3">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-semibold text-gray-900">Awaiting GST Filing</p>
            <p className="text-2xl font-bold text-yellow-600">₹9,100</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Next filing: 25th June 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OfflineDraftsPage() {
  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mx-4">Offline Drafts</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 m-4 text-center">
        <p className="text-gray-600">No offline drafts available</p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

type TabType = 'dashboard' | 'expenses' | 'members' | 'settlements' | 'more'
type MoreMenuType = null | 'finance' | 'admin' | 'audit' | 'notifications' | 'gst' | 'drafts'

function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [moreMenuOpen, setMoreMenuOpen] = useState<MoreMenuType>(null)

  const renderContent = () => {
    if (moreMenuOpen) {
      return (
        <div className="pb-24">
          <div className="flex items-center gap-3 p-4 bg-blue-600 text-white">
            <button
              onClick={() => setMoreMenuOpen(null)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Back</h1>
          </div>
          {moreMenuOpen === 'finance' && <PersonalFinancePage />}
          {moreMenuOpen === 'admin' && <AdminPanelPage />}
          {moreMenuOpen === 'audit' && <AuditTrailPage />}
          {moreMenuOpen === 'notifications' && <NotificationsPage />}
          {moreMenuOpen === 'gst' && <GSTQueuePage />}
          {moreMenuOpen === 'drafts' && <OfflineDraftsPage />}
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} />
      case 'expenses':
        return <ExpensesPage state={state} dispatch={dispatch} />
      case 'members':
        return <MembersPage state={state} dispatch={dispatch} />
      case 'settlements':
        return <SettlementsPage state={state} dispatch={dispatch} />
      case 'more':
        return (
          <div className="space-y-3 pb-24 p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">More Options</h1>
            <button
              onClick={() => setMoreMenuOpen('finance')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              Personal Finance
            </button>
            <button
              onClick={() => setMoreMenuOpen('admin')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              Admin Panel
            </button>
            <button
              onClick={() => setMoreMenuOpen('audit')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              Audit Trail
            </button>
            <button
              onClick={() => setMoreMenuOpen('notifications')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              Notifications
            </button>
            <button
              onClick={() => setMoreMenuOpen('gst')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              GST Queue
            </button>
            <button
              onClick={() => setMoreMenuOpen('drafts')}
              className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              Offline Drafts
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-w-4xl mx-auto">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => {
              setActiveTab('dashboard')
              setMoreMenuOpen(null)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('expenses')
              setMoreMenuOpen(null)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              activeTab === 'expenses'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs font-semibold">Expenses</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('members')
              setMoreMenuOpen(null)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              activeTab === 'members'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold">Members</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settlements')
              setMoreMenuOpen(null)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              activeTab === 'settlements'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span className="text-xs font-semibold">Settle</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('more')
              setMoreMenuOpen(null)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              activeTab === 'more'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MoreVertical className="w-5 h-5" />
            <span className="text-xs font-semibold">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
