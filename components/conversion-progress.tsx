import React from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConversionProgressProps {
  status: 'uploading' | 'converting' | 'completed' | 'error'
  progress: number
  className?: string
  onDownload?: () => void
  error?: string
  fileName?: string
}

export function ConversionProgress({
  status,
  progress,
  className,
  onDownload,
  error,
  fileName
}: ConversionProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'converting':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'converting':
        return 'Converting...'
      case 'completed':
        return 'Conversion Complete'
      case 'error':
        return 'Conversion Failed'
      default:
        return ''
    }
  }

  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Status and Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {status === 'error' && (
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Progress 
            value={progress} 
            className="h-2"
          />
        </motion.div>
        <motion.div 
          className="flex justify-between text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span>{fileName || 'File'}</span>
          <motion.span
            key={progress}
            initial={{ scale: 1.2, color: "#3b82f6" }}
            animate={{ scale: 1, color: "inherit" }}
            transition={{ duration: 0.2 }}
          >
            {progress}%
          </motion.span>
        </motion.div>
      </div>

      {/* Download Button */}
      {status === 'completed' && onDownload && (
        <Button
          onClick={onDownload}
          size="sm"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          variant="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
} 