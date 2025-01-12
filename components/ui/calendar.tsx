"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
}

export function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  initialFocus,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    )
  }

  const handleDateSelect = (date: Date) => {
    onSelect?.(date)
  }

  const days = React.useMemo(() => {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      )
    }
    return days
  }, [currentMonth, firstDayOfMonth, daysInMonth])

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between space-x-2 pb-4">
        <h2 className="text-sm font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="space-x-1">
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="p-1 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="p-1" />
          }

          const isSelected = selected?.toDateString() === date.toDateString()
          const isToday = new Date().toDateString() === date.toDateString()

          return (
            <Button
              key={date.toISOString()}
              variant="ghost"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isSelected && "bg-primary text-primary-foreground",
                isToday && !isSelected && "bg-muted"
              )}
              onClick={() => handleDateSelect(date)}
            >
              {date.getDate()}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

