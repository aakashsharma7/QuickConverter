"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/utils'

interface FileUploadZoneProps {
  onUpload: (files: File[]) => void
  isUploading?: boolean
  progress?: number
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
}

export function FileUploadZone({
  onUpload,
  isUploading = false,
  progress = 0,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ['*/*']
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    
    // Handle rejected files
    const newErrors = rejectedFiles.map(({ file, errors }) => {
      if (errors.some((e: { code: string }) => e.code === 'file-too-large')) {
        return `${file.name} is too large`
      }
      if (errors.some((e: { code: string }) => e.code === 'file-invalid-type')) {
        return `${file.name} has an invalid type`
      }
      return `${file.name} was rejected`
    })
    
    setErrors(prev => [...prev, ...newErrors])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: isUploading
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files)
      setFiles([])
      setErrors([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div {...getRootProps()}>
        <motion.div
          className={`upload-zone cursor-pointer transition-all duration-300 ${
            isDragActive ? 'dragover' : ''
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            </motion.div>
          </motion.div>
          
          <motion.h3 
            className="text-lg font-semibold mb-2"
            animate={{ 
              scale: isDragActive ? 1.05 : 1,
              color: isDragActive ? "#3b82f6" : "inherit"
            }}
            transition={{ duration: 0.2 }}
          >
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </motion.h3>
          
          <p className="text-muted-foreground mb-4">
            or click to browse files
          </p>
          
          <div className="text-sm text-muted-foreground">
            <p>Max {maxFiles} files, up to {formatFileSize(maxSize)} each</p>
            <p>Supports: {acceptedTypes.join(', ')}</p>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-destructive">Errors</h4>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeError(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      <AnimatePresence>
        {files.length > 0 && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button
                onClick={handleUpload}
                size="lg"
                variant="gradient"
                className="px-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                </motion.div>
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 