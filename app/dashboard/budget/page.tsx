'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PlusIcon, AlertCircle, Home, Utensils, Car, Plug, Tv, Heart, ShoppingBag, MoreHorizontal, Wallet } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryData {
  category: string
  spent: number
  budget_limit: number
}

interface BudgetData {
  categories: CategoryData[]
  totals: {
    spent: number
    budget: number
  }
}

const categoryIcons: Record<string, any> = {
  housing: Home,
  food: Utensils,
  transport: Car,
  utilities: Plug,
  entertainment: Tv,
  healthcare: Heart,
  shopping: ShoppingBag,
  other: MoreHorizontal,
  other_expense: MoreHorizontal,
}

const categoryLabels: Record<string, string> = {
  housing: 'Housing',
  food: 'Food & Dining',
  transport: 'Transportation',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  shopping: 'Shopping',
  other: 'Other',
  other_expense: 'Other Expenses',
}

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBudgetData()
  }, [])

  const fetchBudgetData = async () => {
    try {
      const response = await fetch('/api/budget/overview')
      const data = await response.json()
    
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch budget data')
      }
    
      setBudgetData(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load budget data')
      console.error('Budget data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory || !newLimit || parseFloat(newLimit) <= 0) {
      toast.error('Please select a category and enter a valid limit')
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/budget/limits/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          limit: parseFloat(newLimit)
        }),
      })

      if (!response.ok) throw new Error('Failed to update budget limit')

      await fetchBudgetData() // Refresh data
      toast.success('Budget limit updated successfully')
      setSelectedCategory('')
      setNewLimit('')
    } catch (error) {
      toast.error('Failed to update budget limit')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!budgetData) return null

  const totalProgress = (budgetData.totals.spent / budgetData.totals.budget) * 100

  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Budget Management</h1>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Overall Budget Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Overall Budget</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{budgetData.totals.spent.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">{budgetData.totals.budget.toLocaleString('sv-SE')} kr</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Budget Utilization</span>
                  <span>{totalProgress.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={totalProgress} 
                  className="h-2"
                  indicator={totalProgress > 90 ? "bg-red-500" : undefined}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {budgetData.categories.map((category) => {
            const progress = (category.spent / category.budget_limit) * 100
            const isOverBudget = progress > 100
            const Icon = categoryIcons[category.category] || MoreHorizontal

            return (
              <Card key={category.category} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">
                      {categoryLabels[category.category] || category.category}
                    </CardTitle>
                  </div>
                  {isOverBudget && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {category.spent.toLocaleString('sv-SE')} kr spent
                      </span>
                      <span className="text-muted-foreground">
                        {category.budget_limit.toLocaleString('sv-SE')} kr limit
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                      indicator={isOverBudget ? "bg-red-500" : undefined}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {progress.toFixed(1)}% used
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {(category.budget_limit - category.spent).toLocaleString('sv-SE')} kr remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Update Budget Form */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5 text-primary" />
              <CardTitle>Update Budget Limits</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateLimit} className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetData.categories.map((category) => {
                    const Icon = categoryIcons[category.category] || MoreHorizontal
                    return (
                      <SelectItem key={category.category} value={category.category}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{categoryLabels[category.category] || category.category}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="New limit"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-[200px]"
                min="0"
                step="100"
              />
              <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update Limit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

