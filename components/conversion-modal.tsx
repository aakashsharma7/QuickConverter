"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  getFileExtension,
  isValidImageFormat,
  isValidVideoFormat,
  isValidAudioFormat,
  isValidDocumentFormat
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
}

const formatOptions = {
  image: [
    { value: 'jpeg', label: 'JPEG (.jpg)', icon: '🖼️' },
    { value: 'png', label: 'PNG (.png)', icon: '🖼️' },
    { value: 'webp', label: 'WebP (.webp)', icon: '🖼️' },
    { value: 'avif', label: 'AVIF (.avif)', icon: '🖼️' }
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
  ]
}

export function ConversionModal({ isOpen, onClose, files }: ConversionModalProps) {
  const [conversionJobs, setConversionJobs] = useState<ConversionJob[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const { toast } = useToast()

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'unknown' => {
    const extension = getFileExtension(file.name)
    
    if (isValidImageFormat(extension)) return 'image'
    if (isValidVideoFormat(extension)) return 'video'
    if (isValidAudioFormat(extension)) return 'audio'
    if (isValidDocumentFormat(extension)) return 'document'
    
    return 'unknown'
  }

  const getDefaultFormat = (file: File): string => {
    const fileType = getFileType(file)
    const extension = getFileExtension(file.name)
    
    switch (fileType) {
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
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setConversionJobs(prev => prev.map((job, i) => 
          i === index ? { ...job, progress: Math.min(job.progress + 10, 90) } : job
        ))
      }, 200)
      
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
    if (!job.result) return
    
    const url = URL.createObjectURL(job.result)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job.file.name.split('.')[0]}.${job.targetFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    conversionJobs
      .filter(job => job.status === 'completed' && job.result)
      .forEach(job => downloadFile(job))
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
                  
                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
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
                          
                          <div className="flex items-center space-x-2">
                            {job.status === 'pending' && (
                              <span className="text-sm text-muted-foreground">Pending</span>
                            )}
                            {job.status === 'converting' && (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Converting...</span>
                              </div>
                            )}
                            {job.status === 'completed' && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                                 <motion.div
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   transition={{ type: "spring", stiffness: 400 }}
                                 >
                                   <Button
                                     size="sm"
                                     onClick={() => downloadFile(job)}
                                     className="h-8"
                                   >
                                     <motion.div
                                       animate={{ 
                                         y: [0, -2, 0],
                                         scale: [1, 1.1, 1]
                                       }}
                                       transition={{ 
                                         duration: 1.5,
                                         repeat: Infinity,
                                         repeatType: "reverse",
                                         ease: "easeInOut"
                                       }}
                                     >
                                       <Download className="w-4 h-4 mr-1" />
                                     </motion.div>
                                     Download
                                   </Button>
                                 </motion.div>
                              </div>
                            )}
                            {job.status === 'error' && (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-500">{job.error}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {job.status === 'converting' && (
                          <Progress value={job.progress} className="h-2" />
                        )}
                        
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