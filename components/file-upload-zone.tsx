"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle, HelpCircle, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConversionProgress } from '@/components/conversion-progress'

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  isUploading?: boolean
  uploadProgress?: number
  uploadStatus?: string
}

export function FileUploadZone({ 
  onFilesSelected, 
  isUploading = false, 
  uploadProgress = 0, 
  uploadStatus = '' 
}: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setSelectedFiles(acceptedFiles)
    setErrors([])
    
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorTypes = errors.map((e: any) => e.code).join(', ')
        return `${file.name}: ${errorTypes}`
      })
      setErrors(errorMessages)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/html': ['.html', '.htm'],
      'text/css': ['.css'],
      'text/javascript': ['.js'],
      'application/json': ['.json'],
      'text/xml': ['.xml'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Main Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-900/20 scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Main Upload Icon */}
        <div className="flex justify-center mb-4">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-pulse" />
        </div>

        {/* Main Heading */}
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          {isDragActive ? 'Drop files here!' : 'Drag & drop files here'}
        </h3>

        {/* Interactive Microcopy */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            or{' '}
            <span className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
              browse files
            </span>
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>50+ formats supported</span>
              <HelpCircle className="w-4 h-4 ml-1 cursor-help opacity-60 hover:opacity-100" />
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Up to 50MB per file</span>
              <HelpCircle className="w-4 h-4 ml-1 cursor-help opacity-60 hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {isUploading && (
          <div className="mb-4">
            <ConversionProgress
              fileName="Uploading files..."
              progress={uploadProgress}
              status={uploadStatus as 'uploading' | 'converting' | 'completed' | 'error'}
            />
          </div>
        )}

        {/* Empty State Illustration */}
        {selectedFiles.length === 0 && !isUploading && (
          <div className="mt-6 text-gray-400 dark:text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-xs">Drop files here to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <File className="w-4 h-4" />
            Selected Files ({selectedFiles.length})
            <HelpCircle className="w-4 h-4 cursor-help opacity-60 hover:opacity-100" />
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Errors ({errors.length})
            <HelpCircle className="w-4 h-4 cursor-help opacity-60 hover:opacity-100" />
          </h4>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-md"
              >
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeError(index)
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Upload className="w-4 h-4 mr-2 animate-pulse" />
            Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
} 