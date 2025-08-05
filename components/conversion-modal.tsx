"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConversionProgress } from '@/components/conversion-progress'
import { useToast } from '@/hooks/use-toast'
import { 
  getFileExtension,
  isValidImageFormat,
  isValidVideoFormat,
  isValidAudioFormat,
  isValidDocumentFormat,
  isValidCodeFormat
} from '@/lib/file-processing'

interface ConversionModalProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
}

interface ConversionJob {
  file: File
  targetFormat: string
  status: 'pending' | 'converting' | 'completed' | 'error'
  progress: number
  result?: Blob
  error?: string
  downloadedAt?: number
  isMarkedForRemoval?: boolean
  completedAt?: number
  autoRemoveCountdown?: number
}

const formatOptions = {
  image: [
    { value: 'jpeg', label: 'JPEG (.jpg)', icon: '🖼️' },
    { value: 'png', label: 'PNG (.png)', icon: '🖼️' },
    { value: 'webp', label: 'WebP (.webp)', icon: '🖼️' },
    { value: 'avif', label: 'AVIF (.avif)', icon: '🖼️' },
    { value: 'ico', label: 'ICO (.ico)', icon: '🎯' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
    { value: 'watermark-removed', label: 'Remove Watermark', icon: '🚫' }
  ],
  svg: [
    { value: 'png', label: 'PNG (.png)', icon: '🖼️' },
    { value: 'jpeg', label: 'JPEG (.jpg)', icon: '🖼️' },
    { value: 'webp', label: 'WebP (.webp)', icon: '🖼️' },
    { value: 'ico', label: 'ICO (.ico)', icon: '🎯' }
  ],
  ico: [
    { value: 'png', label: 'PNG (.png)', icon: '🖼️' },
    { value: 'jpeg', label: 'JPEG (.jpg)', icon: '🖼️' },
    { value: 'webp', label: 'WebP (.webp)', icon: '🖼️' },
    { value: 'svg', label: 'SVG (.svg) - Limited support', icon: '📐' }
  ],
  video: [
    { value: 'mp4', label: 'MP4 (.mp4)', icon: '🎥' },
    { value: 'avi', label: 'AVI (.avi)', icon: '🎥' },
    { value: 'mov', label: 'MOV (.mov)', icon: '🎥' },
    { value: 'webm', label: 'WebM (.webm)', icon: '🎥' }
  ],
  audio: [
    { value: 'mp3', label: 'MP3 (.mp3)', icon: '🎵' },
    { value: 'wav', label: 'WAV (.wav)', icon: '🎵' },
    { value: 'aac', label: 'AAC (.aac)', icon: '🎵' },
    { value: 'ogg', label: 'OGG (.ogg)', icon: '🎵' }
  ],
  document: [
    { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
    { value: 'txt', label: 'Text (.txt)', icon: '📄' },
    { value: 'html', label: 'HTML (.html)', icon: '📄' }
  ],
  code: [
    { value: 'html', label: 'HTML (.html)', icon: '🌐' },
    { value: 'js', label: 'JavaScript (.js)', icon: '⚡' },
    { value: 'ts', label: 'TypeScript (.ts)', icon: '📘' },
    { value: 'txt', label: 'Text (.txt)', icon: '📄' }
  ]
}

export function ConversionModal({ isOpen, onClose, files }: ConversionModalProps) {
  const [conversionJobs, setConversionJobs] = useState<ConversionJob[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { toast } = useToast()

  // Cleanup effect to remove downloaded files and update countdown
  React.useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setCountdown(now)
      
      setConversionJobs(prev => {
        const updatedJobs = prev.map(job => {
          // Update countdown for completed jobs
          if (job.status === 'completed' && job.completedAt) {
            const elapsed = Math.floor((now - job.completedAt) / 1000)
            const remaining = Math.max(0, 5 - elapsed)
            return { ...job, autoRemoveCountdown: remaining }
          }
          return job
        }).filter(job => {
          // Remove files that were downloaded more than 10 seconds ago
          if (job.downloadedAt && now - job.downloadedAt > 10000) {
            return false
          }
          // Remove files that were completed more than 5 seconds ago
          if (job.status === 'completed' && job.completedAt && now - job.completedAt > 5000) {
            return false
          }
          return true
        })
        
        // If all jobs are removed, close the modal
        if (updatedJobs.length === 0 && prev.length > 0) {
          setTimeout(() => {
            onClose()
          }, 500) // Small delay for smooth animation
        }
        
        return updatedJobs
      })
    }, 1000) // Check every second

    return () => clearInterval(cleanupInterval)
  }, [onClose])

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'svg' | 'ico' | 'code' | 'unknown' => {
    const extension = getFileExtension(file.name)
    
    if (extension === 'svg') return 'svg'
    if (extension === 'ico') return 'ico'
    if (isValidImageFormat(extension)) return 'image'
    if (isValidVideoFormat(extension)) return 'video'
    if (isValidAudioFormat(extension)) return 'audio'
    if (isValidDocumentFormat(extension)) return 'document'
    if (isValidCodeFormat(extension)) return 'code'
    
    return 'unknown'
  }

  const getDefaultFormat = (file: File): string => {
    const fileType = getFileType(file)
    const extension = getFileExtension(file.name)
    
    switch (fileType) {
      case 'svg':
        return 'png' // Default SVG conversion to PNG
      case 'ico':
        return 'png' // Default ICO conversion to PNG
      case 'image':
        return formatOptions.image.find(f => f.value === extension)?.value || 'jpeg'
      case 'video':
        return formatOptions.video.find(f => f.value === extension)?.value || 'mp4'
      case 'audio':
        return formatOptions.audio.find(f => f.value === extension)?.value || 'mp3'
      case 'document':
        return formatOptions.document.find(f => f.value === extension)?.value || 'pdf'
      default:
        return 'pdf'
    }
  }

  const initializeJobs = () => {
    const jobs: ConversionJob[] = files.map(file => ({
      file,
      targetFormat: getDefaultFormat(file),
      status: 'pending',
      progress: 0
    }))
    setConversionJobs(jobs)
  }

  const updateJob = (index: number, updates: Partial<ConversionJob>) => {
    setConversionJobs(prev => prev.map((job, i) => 
      i === index ? { ...job, ...updates } : job
    ))
  }

  const convertFile = async (job: ConversionJob, index: number): Promise<void> => {
    try {
      updateJob(index, { status: 'converting', progress: 0 })
      
      // Check for ICO to SVG conversion and show warning
      const fileExtension = getFileExtension(job.file.name)
      if (fileExtension === 'ico' && job.targetFormat === 'svg') {
        toast({
          title: "ICO to SVG Conversion",
          description: "ICO files are complex binary formats. SVG conversion may not work perfectly and will create a raster-based SVG.",
          duration: 5000,
        })
      }
      
      // Simulate progress updates with more realistic timing
      const progressInterval = setInterval(() => {
        setConversionJobs(prev => prev.map((job, i) => {
          if (i !== index) return job
          
          // More realistic progress simulation
          let increment = Math.random() * 15 + 5 // 5-20% increments
          if (job.progress > 80) {
            increment = Math.random() * 5 + 2 // Slower progress near completion
          }
          return { ...job, progress: Math.min(job.progress + increment, 90) }
        }))
      }, 300 + Math.random() * 400) // Random interval between 300-700ms
      
      // Create form data for API request
      const formData = new FormData()
      formData.append('file', job.file)
      formData.append('targetFormat', job.targetFormat)
      
      // Call the conversion API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Conversion API error:', errorData)
        throw new Error(errorData.error || 'Conversion failed')
      }
      
      // Get the converted file as blob
      const result = await response.blob()
      
             clearInterval(progressInterval)
       updateJob(index, { 
         status: 'completed', 
         progress: 100,
         result
       })
       
       // Auto-remove the file after 5 seconds when conversion is complete
       updateJob(index, { 
         completedAt: Date.now(),
         autoRemoveCountdown: 5
       })
       
       setTimeout(() => {
         setConversionJobs(prev => prev.filter((job, i) => i !== index))
         
         // If this was the last job, close the modal
         if (conversionJobs.length === 1) {
           setTimeout(() => {
             onClose()
           }, 500) // Small delay for smooth animation
         }
       }, 5000) // 5 seconds delay
      
    } catch (error) {
      updateJob(index, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Conversion failed'
      })
    }
  }

  const startConversion = async () => {
    setIsConverting(true)
    
    // Initialize jobs if not already done
    if (conversionJobs.length === 0) {
      initializeJobs()
    }
    
    // Convert all files
    for (let i = 0; i < conversionJobs.length; i++) {
      await convertFile(conversionJobs[i], i)
    }
    
    setIsConverting(false)
    
    const completedCount = conversionJobs.filter(job => job.status === 'completed').length
    if (completedCount > 0) {
      toast({
        title: "Conversion Complete!",
        description: `${completedCount} file(s) converted successfully.`,
      })
    }
  }

  const downloadFile = (job: ConversionJob) => {
    if (!job.result) {
      toast({
        title: "Download Failed",
        description: "No converted file available for download.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const url = URL.createObjectURL(job.result)
      const a = document.createElement('a')
      a.href = url
      // Handle watermark removal files
      const fileName = job.targetFormat === 'watermark-removed' 
        ? `${job.file.name.split('.')[0]}_watermark_removed.png`
        : `${job.file.name.split('.')[0]}.${job.targetFormat}`
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Mark the file for removal after 10 seconds
      const jobIndex = conversionJobs.findIndex(j => j.file === job.file)
      if (jobIndex !== -1) {
        updateJob(jobIndex, { 
          downloadedAt: Date.now(),
          isMarkedForRemoval: true
        })
      }
      
      toast({
        title: "Download Started",
        description: `${job.file.name} is being downloaded.`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the converted file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadAll = () => {
    const completedJobs = conversionJobs.filter(job => job.status === 'completed' && job.result)
    
    if (completedJobs.length === 0) {
      toast({
        title: "No Files to Download",
        description: "No completed conversions available for download.",
        variant: "destructive",
      })
      return
    }
    
    try {
      completedJobs.forEach(job => {
        const url = URL.createObjectURL(job.result!)
        const a = document.createElement('a')
        a.href = url
        // Handle watermark removal files
        const fileName = job.targetFormat === 'watermark-removed' 
          ? `${job.file.name.split('.')[0]}_watermark_removed.png`
          : `${job.file.name.split('.')[0]}.${job.targetFormat}`
        a.download = fileName
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
      
      // Mark all completed files for removal
      const now = Date.now()
      setConversionJobs(prev => prev.map(job => 
        job.status === 'completed' && job.result 
          ? { ...job, downloadedAt: now, isMarkedForRemoval: true }
          : job
      ))
      
      toast({
        title: "All Files Downloaded",
        description: `${completedJobs.length} file(s) will be removed in 10 seconds.`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Download all error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download some files. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFormatChange = (index: number, format: string) => {
    updateJob(index, { targetFormat: format })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <motion.h2 
                className="text-2xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Convert Files
              </motion.h2>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Select target formats and convert your files
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {conversionJobs.length === 0 ? (
              <div className="space-y-4">
                {files.map((file, index) => {
                  const fileType = getFileType(file)
                  const defaultFormat = getDefaultFormat(file)
                  
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                                                 <div className="flex items-center space-x-3">
                           <motion.div
                             whileHover={{ 
                               scale: 1.2,
                               rotate: 15,
                               color: "#3b82f6"
                             }}
                             transition={{ type: "spring", stiffness: 400 }}
                           >
                             <File className="w-8 h-8 text-blue-500" />
                           </motion.div>
                           <div>
                             <motion.p 
                               className="font-medium"
                               whileHover={{ scale: 1.02 }}
                               transition={{ type: "spring", stiffness: 400 }}
                             >
                               {file.name}
                             </motion.p>
                             <p className="text-sm text-muted-foreground">
                               {fileType !== 'unknown' ? fileType.toUpperCase() : 'Unknown'} • {file.size} bytes
                             </p>
                           </div>
                         </div>
                        
                        {fileType !== 'unknown' && (
                          <Select
                            value={defaultFormat}
                            onValueChange={(value) => {
                              if (conversionJobs.length === 0) {
                                initializeJobs()
                              }
                              handleFormatChange(index, value)
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formatOptions[fileType]?.map((format) => (
                                <SelectItem key={format.value} value={format.value}>
                                  <span className="flex items-center space-x-2">
                                    <span>{format.icon}</span>
                                    <span>{format.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {conversionJobs.map((job, index) => {
                  const fileType = getFileType(job.file)
                  
                  // Determine status for ConversionProgress component
                  const getProgressStatus = () => {
                    if (job.status === 'pending') return 'uploading'
                    if (job.status === 'converting') return 'converting'
                    if (job.status === 'completed') return 'done'
                    if (job.status === 'error') return 'error'
                    return 'uploading'
                  }
                  
                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        {/* File Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <File className="w-6 h-6 text-blue-500" />
                            <div>
                              <p className="font-medium">{job.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Converting to {job.targetFormat.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Format Selector for pending jobs */}
                          {fileType !== 'unknown' && job.status === 'pending' && (
                            <Select
                              value={job.targetFormat}
                              onValueChange={(value) => handleFormatChange(index, value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {formatOptions[fileType]?.map((format) => (
                                  <SelectItem key={format.value} value={format.value}>
                                    <span className="flex items-center space-x-2">
                                      <span>{format.icon}</span>
                                      <span>{format.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        
                                                 {/* Progress Display */}
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1, duration: 0.3 }}
                         >
                           <ConversionProgress
                             status={job.status === 'pending' ? 'uploading' : 
                                    job.status === 'converting' ? 'converting' : 
                                    job.status === 'completed' ? 'completed' : 'error'}
                             progress={job.progress}
                             fileName={job.file.name}
                             onDownload={job.status === 'completed' ? () => downloadFile(job) : undefined}
                             error={job.error}
                           />
                         </motion.div>
                        
                                                 {/* Auto-Removal Countdown */}
                         {job.status === 'completed' && job.autoRemoveCountdown !== undefined && job.autoRemoveCountdown > 0 && (
                           <motion.div 
                             className="flex items-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             transition={{ duration: 0.3 }}
                           >
                             <motion.div
                               animate={{ 
                                 scale: [1, 1.1, 1],
                                 rotate: [0, 5, 0]
                               }}
                               transition={{ 
                                 duration: 2,
                                 repeat: Infinity,
                                 ease: "easeInOut"
                               }}
                             >
                               <AlertCircle className="w-4 h-4 text-blue-500" />
                             </motion.div>
                             <motion.span 
                               className="text-sm text-blue-500"
                               key={job.autoRemoveCountdown}
                               initial={{ scale: 1.1, color: "#ef4444" }}
                               animate={{ scale: 1, color: "#3b82f6" }}
                               transition={{ duration: 0.3 }}
                             >
                               Auto-removing in {job.autoRemoveCountdown}s
                             </motion.span>
                           </motion.div>
                         )}
                         
                         {/* Download Removal Countdown */}
                         {job.isMarkedForRemoval && (
                           <div className="flex items-center space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                             <AlertCircle className="w-4 h-4 text-orange-500" />
                             <span className="text-sm text-orange-500">
                               Removing in {Math.max(0, Math.ceil((10000 - (countdown - (job.downloadedAt || 0))) / 1000))}s
                             </span>
                           </div>
                         )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {conversionJobs.length > 0 && (
                <>
                  {conversionJobs.filter(job => job.status === 'completed').length} of {conversionJobs.length} completed
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              {conversionJobs.filter(job => job.status === 'completed').length > 0 && (
                <Button onClick={downloadAll} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
              
              {conversionJobs.length === 0 ? (
                <Button onClick={startConversion} disabled={isConverting}>
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Start Conversion'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={startConversion} 
                  disabled={isConverting || conversionJobs.every(job => job.status === 'completed')}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert Files'
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 