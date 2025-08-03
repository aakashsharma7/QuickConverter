"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  Download,
  Calendar,
  FileText,
  Zap,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface AnalyticsSummary {
  totalConversions: number
  successfulConversions: number
  failedConversions: number
  successRate: number
  averageProcessingTime: number
  totalStorageUsed: number
  mostConvertedFormats: Array<{ format: string; count: number }>
  processingTimeByFormat: Array<{ format: string; avgTime: number }>
  dailyStats: Array<{ date: string; conversions: number; successRate: number }>
}

interface PerformanceInsights {
  recommendations: string[]
  bottlenecks: string[]
  optimizations: string[]
}

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [insights, setInsights] = useState<PerformanceInsights | null>(null)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [summaryRes, insightsRes] = await Promise.all([
        fetch(`/api/analytics?action=summary&timeRange=${timeRange}`),
        fetch('/api/analytics?action=insights')
      ])
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }
      
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your file conversion performance</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalConversions}</div>
              <p className="text-xs text-muted-foreground">
                Files processed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.successRate.toFixed(1)}%</div>
              <div className="flex items-center space-x-2">
                <Progress value={summary.successRate} className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  {summary.successfulConversions}/{summary.totalConversions}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(summary.averageProcessingTime)}</div>
              <p className="text-xs text-muted-foreground">
                Per conversion
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(summary.totalStorageUsed)}</div>
              <p className="text-xs text-muted-foreground">
                Total processed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Converted Formats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Most Converted Formats</span>
              </CardTitle>
              <CardDescription>Top conversion formats by usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.mostConvertedFormats.slice(0, 5).map((format, index) => (
                  <div key={format.format} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="text-sm font-medium">{format.format}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{format.count} conversions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Time by Format */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Processing Performance</span>
              </CardTitle>
              <CardDescription>Average processing time by format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.processingTimeByFormat.slice(0, 5).map((format, index) => (
                  <div key={format.format} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{format.format}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatTime(format.avgTime)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Performance Insights</span>
              </CardTitle>
              <CardDescription>AI-powered recommendations for optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Recommendations</span>
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations.length > 0 ? (
                      insights.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm p-2 bg-green-50 dark:bg-green-950 rounded">
                          {rec}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recommendations at this time</p>
                    )}
                  </div>
                </div>

                {/* Bottlenecks */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Bottlenecks</span>
                  </h4>
                  <div className="space-y-2">
                    {insights.bottlenecks.length > 0 ? (
                      insights.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className="text-sm p-2 bg-orange-50 dark:bg-orange-950 rounded">
                          {bottleneck}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No bottlenecks detected</p>
                    )}
                  </div>
                </div>

                {/* Optimizations */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Optimizations</span>
                  </h4>
                  <div className="space-y-2">
                    {insights.optimizations.length > 0 ? (
                      insights.optimizations.map((opt, index) => (
                        <div key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          {opt}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No optimizations needed</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Stats Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Conversion Trends</span>
            </CardTitle>
            <CardDescription>Conversion activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.dailyStats.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex-1 max-w-xs">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{day.conversions} conversions</span>
                        <span>{day.successRate.toFixed(1)}% success</span>
                      </div>
                      <Progress value={day.successRate} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center"
      >
        <Button 
          variant="outline" 
          onClick={async () => {
            try {
              const response = await fetch('/api/analytics?action=export')
              const data = await response.json()
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            } catch (error) {
              console.error('Failed to export analytics:', error)
            }
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analytics Data
        </Button>
      </motion.div>
    </div>
  )
} 