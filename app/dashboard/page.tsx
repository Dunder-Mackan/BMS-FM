'use client'

import { useSidebar } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, PlusIcon, FileTextIcon, CreditCardIcon, PieChartIcon, TrendingUpIcon, BriefcaseIcon, PiggyBankIcon, AlertCircleIcon, BellIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LabelList } from 'recharts'
import { useState, useEffect } from 'react'
import { SpendingCategories } from './components/spending-categories'
import { MarketOverview } from './components/market-overview'
import { RecentActivity } from './components/recent-activity'
import { InvestmentPerformance } from './components/investment-performance'

// Mock data for the charts
//const chartData = [
//  { name: 'Jan', income: 4000, expenses: 2400 },
//  { name: 'Feb', income: 3000, expenses: 1398 },
//  { name: 'Mar', income: 2000, expenses: 9800 },
//  { name: 'Apr', income: 2780, expenses: 3908 },
//  { name: 'May', income: 1890, expenses: 4800 },
//  { name: 'Jun', income: 2390, expenses: 3800 },
//  { name: 'Jul', income: 3490, expenses: 4300 },
//  { name: 'Aug', income: 4000, expenses: 2800 },
//  { name: 'Sep', income: 3200, expenses: 2900 },
//  { name: 'Oct', income: 2800, expenses: 2300 },
//  { name: 'Nov', income: 3300, expenses: 2400 },
//  { name: 'Dec', income: 5000, expenses: 4200 }
//]

const marketData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 9800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface DashboardData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  changes: {
    balance: number
    income: number
    expenses: number
    savings: number
  }
}

interface SpendingCategory {
  name: string
  value: number
}

interface MonthlyStats {
  name: string
  income: number
  expenses: number
}

const categoryOptions = {
  expense: [
    { label: 'Housing', value: 'housing' },
    { label: 'Food', value: 'food' },
    { label: 'Transport', value: 'transport' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Entertainment', value: 'entertainment' },
  ]
}


export default function DashboardPage() {
  const { collapsed } = useSidebar()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    const fetchMonthlyStats = async () => {
      try {
        const response = await fetch('/api/dashboard/monthly-stats')
        if (response.ok) {
          const data = await response.json()
          setMonthlyStats(data)
        } else {
          console.error('Failed to fetch monthly stats')
        }
      } catch (error) {
        console.error('Error fetching monthly stats:', error)
      }
    }

    const fetchSpendingCategories = async () => {
      try {
        const response = await fetch('/api/dashboard/spending-categories')
        if (response.ok) {
          const data = await response.json()
          setSpendingCategories(data)
        } else {
          console.error('Failed to fetch spending categories')
        }
      } catch (error) {
        console.error('Error fetching spending categories:', error)
      }
    }

    fetchDashboardData()
    fetchMonthlyStats()
    fetchSpendingCategories()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { 
      style: 'currency', 
      currency: 'SEK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return value.toFixed(1)
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <BellIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData ? formatCurrency(dashboardData.totalBalance) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData ? (
                  `${dashboardData.changes.balance >= 0 ? '+' : ''}${formatPercentage(dashboardData.changes.balance)}% from last month`
                ) : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData ? formatCurrency(dashboardData.monthlyIncome) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData ? (
                  `${dashboardData.changes.income >= 0 ? '+' : ''}${formatPercentage(dashboardData.changes.income)}% from last month`
                ) : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData ? formatCurrency(dashboardData.monthlyExpenses) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData ? (
                  `${dashboardData.changes.expenses >= 0 ? '+' : ''}${formatPercentage(dashboardData.changes.expenses)}% from last month`
                ) : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <PiggyBankIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData ? formatCurrency(dashboardData.netSavings) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData ? (
                  `${dashboardData.changes.savings >= 0 ? '+' : ''}${formatPercentage(dashboardData.changes.savings)}% from last month`
                ) : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Income vs Expenses Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {monthlyStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelStyle={{ color: 'black' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Income"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ff0000" 
                          strokeWidth={2}
                          name="Expenses"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Quick Actions Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="w-full h-auto py-2 px-3 whitespace-normal text-sm" variant="outline">
                      <PlusIcon className="mr-2 h-4 w-4 shrink-0" /> Add Transaction
                    </Button>
                    <Button className="w-full h-auto py-2 px-3 whitespace-normal text-sm" variant="outline">
                      <FileTextIcon className="mr-2 h-4 w-4 shrink-0" /> Generate Report
                    </Button>
                    <Button className="w-full h-auto py-2 px-3 whitespace-normal text-sm" variant="outline">
                      <CreditCardIcon className="mr-2 h-4 w-4 shrink-0" /> Manage Cards
                    </Button>
                    <Button className="w-full h-auto py-2 px-3 whitespace-normal text-sm" variant="outline">
                      <PieChartIcon className="mr-2 h-4 w-4 shrink-0" /> Budget Planner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Health Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Savings Goal Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Budget Utilization</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Debt Reduction</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment Portfolio Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Investment Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Stocks</span>
                    </div>
                    <div className="text-2xl font-bold">$24,500</div>
                    <div className="text-sm text-muted-foreground">+12.3%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Bonds</span>
                    </div>
                    <div className="text-2xl font-bold">$12,300</div>
                    <div className="text-sm text-muted-foreground">+3.2%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PiggyBankIcon className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Savings</span>
                    </div>
                    <div className="text-2xl font-bold">$8,400</div>
                    <div className="text-sm text-muted-foreground">+5.8%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Other</span>
                    </div>
                    <div className="text-2xl font-bold">$3,200</div>
                    <div className="text-sm text-muted-foreground">+1.4%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Investment Performance Card */}
            <InvestmentPerformance />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Spending Categories */}
            <SpendingCategories data={spendingCategories} />

            {/* Market Overview */}
            <MarketOverview />

            {/* Recent Activity */}
            <RecentActivity />

            {/* Upcoming Bills */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Upcoming Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-medium">Rent</div>
                      <div className="text-sm text-muted-foreground">Due in 5 days</div>
                    </div>
                    <span className="font-semibold">$1,200.00</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-medium">Internet</div>
                      <div className="text-sm text-muted-foreground">Due in 12 days</div>
                    </div>
                    <span className="font-semibold">$59.99</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">Due in 15 days</div>
                    </div>
                    <span className="font-semibold">$45.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Car Insurance</div>
                      <div className="text-sm text-muted-foreground">Due in 18 days</div>
                    </div>
                    <span className="font-semibold">$85.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

