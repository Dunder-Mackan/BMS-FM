'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface InvestmentData {
  name: string
  value: number
}

// Define the order of days for sorting
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Mock data for initial render and testing
const mockData = [
  { name: 'Monday', value: 2400 },
  { name: 'Tuesday', value: 1398 },
  { name: 'Wednesday', value: 9800 },
  { name: 'Thursday', value: 3908 },
  { name: 'Friday', value: 4800 },
]

export function InvestmentPerformance() {
  const [data, setData] = useState<InvestmentData[]>(mockData) // Initialize with mock data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/investment-performance')
        if (!response.ok) {
          throw new Error('Failed to fetch investment data')
        }
        const rawData = await response.json()
        // Sort the data according to dayOrder
        const sortedData = rawData.sort((a: InvestmentData, b: InvestmentData) => 
          dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name)
        )
        setData(sortedData.length > 0 ? sortedData : mockData) // Use mock data if no real data
        setError(null)
      } catch (error) {
        console.error('Error fetching investment data:', error)
        setError('Failed to load investment data')
        // Keep the mock data in case of error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Investment Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {error ? (
            <div className="h-full flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(value) => value.substring(0, 3)} // Show first 3 letters of day
                />
                <YAxis 
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatValue(value)}
                  labelFormatter={(label) => label}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  animationDuration={1000}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(value: number) => formatValue(value)}
                    style={{ 
                      fontSize: '12px',
                      fill: '#666',
                      fontWeight: 500
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

