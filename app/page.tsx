"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Image,
  Video,
  Settings,
  Upload,
  Download,
  File,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Github,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import { FileUploadZone } from '@/components/file-upload-zone'
import { ToolCard } from '@/components/tool-card'
import { ConversionModal } from '@/components/conversion-modal'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'

const toolCategories = [
  {
    id: 'pdf',
    title: 'PDF Tools',
    description: 'Edit, convert, and manage PDF documents',
    icon: FileText,
    color: 'from-red-500 to-pink-500',
    tools: [
      { name: 'PDF Editor', description: 'Edit text, images, and pages', icon: FileText },
      { name: 'PDF to Word', description: 'Convert PDF to editable Word', icon: File },
      { name: 'PDF to Image', description: 'Convert PDF pages to images', icon: Image },
      { name: 'Merge PDFs', description: 'Combine multiple PDF files', icon: FileText },
    ]
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Convert, edit, and enhance images',
    icon: Image,
    color: 'from-green-500 to-teal-500',
    tools: [
      { name: 'Format Converter', description: 'JPG, PNG, WebP, and more', icon: Image },
      { name: 'Image to PDF', description: 'Convert JPG, PNG, WebP, TIFF to PDF', icon: FileText },
      { name: 'SVG to ICO', description: 'Convert SVG files to ICO format', icon: Image },
      { name: 'ICO to SVG', description: 'Convert ICO files to SVG format', icon: Image },
      { name: 'Background Remover', description: 'Remove image backgrounds', icon: Image },
      { name: 'Watermark Remover', description: 'Remove watermarks from images', icon: Shield },
      { name: 'Image Compressor', description: 'Reduce file size while maintaining quality', icon: Zap },
    ]
  },
  {
    id: 'video',
    title: 'Video & Audio',
    description: 'Convert and edit media files',
    icon: Video,
    color: 'from-purple-500 to-indigo-500',
    tools: [
      { name: 'Video Converter', description: 'MP4, AVI, MOV, and more', icon: Video },
      { name: 'Audio Extractor', description: 'Extract audio from video files', icon: Video },
      { name: 'Video Compressor', description: 'Reduce video file size', icon: Zap },
      { name: 'Audio Converter', description: 'MP3, WAV, AAC, and more', icon: Video },
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities',
    description: 'Advanced tools and utilities',
    icon: Settings,
    color: 'from-orange-500 to-yellow-500',
    tools: [
      { name: 'OCR Text Extraction', description: 'Extract text from images', icon: FileText },
      { name: 'Document Converter', description: 'DOCX, RTF, TXT conversions', icon: File },
      { name: 'File Compressor', description: 'Compress any file type', icon: Zap },
      { name: 'Batch Processing', description: 'Process multiple files at once', icon: Clock },
    ]
  }
]

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')

    // Simulate upload progress with more realistic timing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadedFiles(files)
          setUploadStatus('completed')
          setShowConversionModal(true)
          toast({
            title: "Upload Complete!",
            description: `${files.length} file(s) uploaded successfully. Ready to convert!`,
          })
          return 100
        }

        // More realistic progress simulation
        let increment = Math.random() * 20 + 10 // 10-30% increments
        if (prev > 80) {
          increment = Math.random() * 8 + 2 // Slower progress near completion
        }
        return Math.min(prev + increment, 100)
      })
    }, 150 + Math.random() * 200) // Random interval between 150-350ms
  }

  const handleToolSelect = (toolName: string) => {
    // Show a more detailed toast with action
    toast({
      title: "Tool Selected",
      description: `${toolName} is ready to use!`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Here you would typically navigate to the tool or open a modal
            setShowConversionModal(true)
            toast({
              title: "Tool Activated",
              description: `Starting ${toolName}...`,
            })
          }}
        >
          Start Now
        </Button>
      ),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
        <header className="sticky top-4 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-lg rounded-2xl mx-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{
                  scale: 1.05,
                  rotate: 5,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl font-bold text-gradient"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    textShadow: [
                      "0 0 5px rgba(59, 130, 246, 0.2)",
                      "0 0 15px rgba(59, 130, 246, 0.4)",
                      "0 0 5px rgba(59, 130, 246, 0.2)"
                    ]
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.6,
                    ease: "easeOut",
                    textShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{
                    scale: 1.05,
                    textShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
                  }}
                >
                  QuickConvertor
                </motion.h1>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10, x: -5 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.02,
                    color: "hsl(var(--foreground))"
                  }}
                >
                  All-in-One File Conversion Platform
                </motion.p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="hidden sm:flex"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="gradient" className="hidden sm:flex">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="inline-block">
              Convert Files with
            </span>
            <span className="text-gradient block relative">
              Lightning Speed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional-grade file conversion tools. Convert PDFs, images, videos, and more with our advanced processing engine.
          </p>

          {/* Upload Zone */}
          <motion.div
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <FileUploadZone
              onFilesSelected={handleFileUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadStatus={uploadStatus}
            />
          </motion.div>



          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-md bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20 p-6 rounded-xl shadow-lg"
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              </motion.div>
              <motion.h3
                className="text-2xl font-bold mb-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Lightning Fast
              </motion.h3>
              <p className="text-muted-foreground">Process files in seconds</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-md bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20 p-6 rounded-xl shadow-lg"
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              </motion.div>
              <motion.h3
                className="text-2xl font-bold mb-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Secure
              </motion.h3>
              <p className="text-muted-foreground">Your files are protected</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-md bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20 p-6 rounded-xl shadow-lg"
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              </motion.div>
              <motion.h3
                className="text-2xl font-bold mb-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Professional
              </motion.h3>
              <p className="text-muted-foreground">High-quality results</p>
            </motion.div>
          </div>
        </motion.section>



        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Why Choose QuickConverter?</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience lightning-fast file conversions with our advanced processing engine
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Lightning Fast Processing",
                  description: "Advanced algorithms ensure your files are processed in seconds, not minutes.",
                  icon: Zap
                },
                {
                  title: "Enterprise Security",
                  description: "Your files are encrypted and automatically deleted after processing.",
                  icon: Shield
                },
                {
                  title: "Batch Processing",
                  description: "Convert multiple files at once with our powerful batch processing engine.",
                  icon: Download
                },
                {
                  title: "100+ File Formats",
                  description: "Our platform offers comprehensive support for a wide variety of image file formats.",
                  icon: File
                },
                {
                  title: "24/7 Availability",
                  description: "Our platform is always available when you need it most.",
                  icon: Clock
                },
                {
                  title: "Quality Guaranteed",
                  description: "We maintain the highest quality standards for all conversions.",
                  icon: CheckCircle
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader className="text-center">
                      <motion.div
                        className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>






      </main>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Zap className="w-6 h-6 text-blue-500" />
              </motion.div>
              <Link 
                href="https://skyframe-io.vercel.app/"
                className="text-lg font-semibold text-gradient">QuickConvertor</Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <motion.a
                href="https://github.com/aakashsharma7/QuickConverter"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{
                  scale: 1.05,
                  color: "hsl(var(--foreground))"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  whileHover={{
                    rotate: 360,
                    scale: 1.2
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <Github className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">GitHub</span>
              </motion.a>

              {/* <motion.a
                href="https://skyframe-io.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                whileHover={{ 
                  scale: 1.05,
                  color: "hsl(var(--foreground))"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Aakash Sharma
              </motion.a> */}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground"
          >
            <p>© 2025 QuickConvertor. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        files={uploadedFiles}
      />

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAnalytics(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <AnalyticsDashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 