'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, MoreVertical, Pencil, Trash2, SearchIcon, X } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Category options based on transaction type
const categoryOptions = {
  income: [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investments', label: 'Investments' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'other_income', label: 'Other Income' }
  ],
  expense: [
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'housing', label: 'Housing' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other_expense', label: 'Other Expense' }
  ],
  savings: [
    { value: 'emergency_fund', label: 'Emergency Fund' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'investment_savings', label: 'Investment Savings' },
    { value: 'goals', label: 'Goals' },
    { value: 'other_savings', label: 'Other Savings' }
  ]
}

interface Transaction {
  id: number
  date: string
  type: 'income' | 'expense' | 'savings'
  category: string
  amount: number
  description: string
}

export default function TransactionsPage() {
  const [date, setDate] = useState<Date>()
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'savings' | ''>('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null)

  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/transactions/recent')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        console.error('Failed to fetch recent transactions')
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
    }
  }

  // Helper function to format date without date-fns
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `${Math.abs(amount).toFixed(2).replace('.', ',')} kr`
  }

  // Handle transaction type change
  const handleTypeChange = (value: string) => {
    setTransactionType(value as 'income' | 'expense' | 'savings')
    setCategory('') // Reset category when type changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !transactionType || !category || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const transaction = {
      date: date.toISOString().split('T')[0],
      type: transactionType,
      category,
      amount: transactionType === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      description
    }

    try {
      const response = await fetch('/api/transactions/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Transaction added successfully')
        setDate(undefined)
        setTransactionType('')
        setCategory('')
        setAmount('')
        setDescription('')
        fetchRecentTransactions()
      } else {
        console.error('Server response:', data)
        toast.error(`Failed to add transaction: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast.error('An error occurred while adding the transaction')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDate(new Date(transaction.date))
    setTransactionType(transaction.type)
    setCategory(transaction.category)
    setAmount(Math.abs(transaction.amount).toString())
    setDescription(transaction.description || '')
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction || !date || !transactionType || !category || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedTransaction = {
      id: editingTransaction.id,
      date: date.toISOString().split('T')[0],
      type: transactionType,
      category,
      amount: transactionType === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      description
    }

    try {
      const response = await fetch('/api/transactions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      })

      if (response.ok) {
        toast.success('Transaction updated successfully')
        setIsEditDialogOpen(false)
        setEditingTransaction(null)
        resetForm()
        fetchRecentTransactions()
      } else {
        const data = await response.json()
        toast.error(`Failed to update transaction: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('An error occurred while updating the transaction')
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingTransactionId(id)
  }

  const confirmDelete = async () => {
    if (!deletingTransactionId) return

    try {
      const response = await fetch('/api/transactions/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deletingTransactionId }),
      })

      if (response.ok) {
        toast.success('Transaction deleted successfully')
        fetchRecentTransactions()
      } else {
        const data = await response.json()
        toast.error(`Failed to delete transaction: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('An error occurred while deleting the transaction')
    } finally {
      setDeletingTransactionId(null)
    }
  }

  const resetForm = () => {
    setDate(undefined)
    setTransactionType('')
    setCategory('')
    setAmount('')
    setDescription('')
  }

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    const searchString = searchQuery.toLowerCase()
    return (
      transaction.description?.toLowerCase().includes(searchString) ||
      transaction.category.toLowerCase().includes(searchString) ||
      formatDate(transaction.date).toLowerCase().includes(searchString) ||
      formatCurrency(transaction.amount).toLowerCase().includes(searchString)
    )
  })

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* New Transaction Form */}
          <Card className="w-full md:w-[400px] flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate)
                          setOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={transactionType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!transactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionType && categoryOptions[transactionType].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">Add Transaction</Button>
              </form>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="w-full min-w-[800px] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <div className="mt-6 mb-2 relative">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-8"
                />
                <SearchIcon className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {(() => {
                            const categoryOption = categoryOptions[transaction.type]?.find(
                              opt => opt.value === transaction.category
                            )
                            return categoryOption 
                              ? categoryOption.label
                              : transaction.category.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')
                          })()}
                        </TableCell>
                        <TableCell className={`text-right ${
                          transaction.type === 'income' 
                            ? 'text-green-600 font-medium' 
                            : 'text-red-600 font-medium'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(transaction.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={transactionType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={!transactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionType && categoryOptions[transactionType].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input 
                id="edit-amount" 
                type="number" 
                placeholder="Enter amount" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTransactionId} onOpenChange={() => setDeletingTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

