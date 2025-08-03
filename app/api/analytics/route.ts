import { NextRequest, NextResponse } from 'next/server'
import { 
  trackConversion, 
  getAnalyticsSummary, 
  getFormatAnalytics, 
  getPerformanceInsights,
  exportAnalyticsData 
} from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'all' || 'all'
    const format = searchParams.get('format')

    switch (action) {
      case 'summary':
        const summary = getAnalyticsSummary(timeRange)
        return NextResponse.json(summary)
      
      case 'formats':
        const formatAnalytics = getFormatAnalytics(format || undefined)
        return NextResponse.json(formatAnalytics)
      
      case 'insights':
        const insights = getPerformanceInsights()
        return NextResponse.json(insights)
      
      case 'export':
        const data = exportAnalyticsData()
        return NextResponse.json(data)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      fileName, 
      originalFormat, 
      targetFormat, 
      fileSize, 
      processingTime, 
      success, 
      errorMessage 
    } = body

    // Validate required fields
    if (!fileName || !originalFormat || !targetFormat || fileSize === undefined || processingTime === undefined || success === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Track the conversion
    const analyticsId = trackConversion({
      fileName,
      originalFormat,
      targetFormat,
      fileSize,
      processingTime,
      success,
      errorMessage
    })

    return NextResponse.json({ 
      success: true, 
      analyticsId,
      message: 'Conversion tracked successfully' 
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    )
  }
} 