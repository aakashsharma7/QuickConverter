// Analytics types and interfaces
export interface ConversionAnalytics {
  id: string
  fileName: string
  originalFormat: string
  targetFormat: string
  fileSize: number
  processingTime: number
  success: boolean
  errorMessage?: string
  timestamp: Date
  userId?: string
}

export interface AnalyticsSummary {
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

export interface FormatAnalytics {
  format: string
  totalConversions: number
  successCount: number
  failureCount: number
  successRate: number
  averageProcessingTime: number
  averageFileSize: number
  totalStorageUsed: number
}

// In-memory storage for analytics (in production, use a database)
let analyticsData: ConversionAnalytics[] = []

// Analytics functions
export function trackConversion(analytics: Omit<ConversionAnalytics, 'id' | 'timestamp'>): string {
  const id = generateId()
  const timestamp = new Date()
  
  const conversionData: ConversionAnalytics = {
    ...analytics,
    id,
    timestamp
  }
  
  analyticsData.push(conversionData)
  
  // Keep only last 1000 records for performance
  if (analyticsData.length > 1000) {
    analyticsData = analyticsData.slice(-1000)
  }
  
  return id
}

export function getAnalyticsSummary(timeRange: 'day' | 'week' | 'month' | 'all' = 'all'): AnalyticsSummary {
  const now = new Date()
  let filteredData = analyticsData
  
  // Filter by time range
  switch (timeRange) {
    case 'day':
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      filteredData = analyticsData.filter(item => item.timestamp >= dayAgo)
      break
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filteredData = analyticsData.filter(item => item.timestamp >= weekAgo)
      break
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filteredData = analyticsData.filter(item => item.timestamp >= monthAgo)
      break
  }
  
  const totalConversions = filteredData.length
  const successfulConversions = filteredData.filter(item => item.success).length
  const failedConversions = totalConversions - successfulConversions
  const successRate = totalConversions > 0 ? (successfulConversions / totalConversions) * 100 : 0
  const averageProcessingTime = totalConversions > 0 
    ? filteredData.reduce((sum, item) => sum + item.processingTime, 0) / totalConversions 
    : 0
  const totalStorageUsed = filteredData.reduce((sum, item) => sum + item.fileSize, 0)
  
  // Most converted formats
  const formatCounts = filteredData.reduce((acc, item) => {
    const key = `${item.originalFormat} → ${item.targetFormat}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostConvertedFormats = Object.entries(formatCounts)
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  // Processing time by format
  const formatTimes = filteredData.reduce((acc, item) => {
    const key = `${item.originalFormat} → ${item.targetFormat}`
    if (!acc[key]) acc[key] = []
    acc[key].push(item.processingTime)
    return acc
  }, {} as Record<string, number[]>)
  
  const processingTimeByFormat = Object.entries(formatTimes)
    .map(([format, times]) => ({
      format,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 10)
  
  // Daily stats
  const dailyStats = getDailyStats(filteredData)
  
  return {
    totalConversions,
    successfulConversions,
    failedConversions,
    successRate,
    averageProcessingTime,
    totalStorageUsed,
    mostConvertedFormats,
    processingTimeByFormat,
    dailyStats
  }
}

export function getFormatAnalytics(format?: string): FormatAnalytics[] {
  let filteredData = analyticsData
  
  if (format) {
    filteredData = analyticsData.filter(item => 
      item.originalFormat === format || item.targetFormat === format
    )
  }
  
  const formatGroups = filteredData.reduce((acc, item) => {
    const key = `${item.originalFormat} → ${item.targetFormat}`
    if (!acc[key]) {
      acc[key] = {
        format: key,
        totalConversions: 0,
        successCount: 0,
        failureCount: 0,
        processingTimes: [],
        fileSizes: [],
        storageUsed: 0
      }
    }
    
    acc[key].totalConversions++
    if (item.success) {
      acc[key].successCount++
    } else {
      acc[key].failureCount++
    }
    acc[key].processingTimes.push(item.processingTime)
    acc[key].fileSizes.push(item.fileSize)
    acc[key].storageUsed += item.fileSize
    
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(formatGroups).map(group => ({
    format: group.format,
    totalConversions: group.totalConversions,
    successCount: group.successCount,
    failureCount: group.failureCount,
    successRate: (group.successCount / group.totalConversions) * 100,
    averageProcessingTime: group.processingTimes.reduce((sum: number, time: number) => sum + time, 0) / group.processingTimes.length,
    averageFileSize: group.fileSizes.reduce((sum: number, size: number) => sum + size, 0) / group.fileSizes.length,
    totalStorageUsed: group.storageUsed
  }))
}

export function getPerformanceInsights(): {
  recommendations: string[]
  bottlenecks: string[]
  optimizations: string[]
} {
  const summary = getAnalyticsSummary()
  const formatAnalytics = getFormatAnalytics()
  
  const recommendations: string[] = []
  const bottlenecks: string[] = []
  const optimizations: string[] = []
  
  // Success rate recommendations
  if (summary.successRate < 95) {
    recommendations.push(`Success rate is ${summary.successRate.toFixed(1)}%. Consider optimizing conversion parameters.`)
  }
  
  // Processing time recommendations
  if (summary.averageProcessingTime > 5000) {
    recommendations.push(`Average processing time is ${(summary.averageProcessingTime / 1000).toFixed(1)}s. Consider upgrading server resources.`)
  }
  
  // Format-specific insights
  formatAnalytics.forEach(format => {
    if (format.successRate < 90) {
      bottlenecks.push(`${format.format} has low success rate (${format.successRate.toFixed(1)}%)`)
    }
    if (format.averageProcessingTime > 10000) {
      bottlenecks.push(`${format.format} is slow (${(format.averageProcessingTime / 1000).toFixed(1)}s average)`)
    }
  })
  
  // Storage optimizations
  if (summary.totalStorageUsed > 1024 * 1024 * 1024) { // 1GB
    optimizations.push('Consider implementing automatic file cleanup to reduce storage usage')
  }
  
  return { recommendations, bottlenecks, optimizations }
}

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getDailyStats(data: ConversionAnalytics[]): Array<{ date: string; conversions: number; successRate: number }> {
  const dailyGroups = data.reduce((acc, item) => {
    const date = item.timestamp.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { conversions: 0, successes: 0 }
    }
    acc[date].conversions++
    if (item.success) acc[date].successes++
    return acc
  }, {} as Record<string, { conversions: number; successes: number }>)
  
  return Object.entries(dailyGroups)
    .map(([date, stats]) => ({
      date,
      conversions: stats.conversions,
      successRate: (stats.successes / stats.conversions) * 100
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30) // Last 30 days
}

// Export analytics data for backup/restore
export function exportAnalyticsData(): ConversionAnalytics[] {
  return [...analyticsData]
}

export function importAnalyticsData(data: ConversionAnalytics[]): void {
  analyticsData = [...data]
} 