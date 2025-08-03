"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import { FileUploadZone } from '@/components/file-upload-zone'
import { ToolCard } from '@/components/tool-card'
import { ConversionModal } from '@/components/conversion-modal'

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showConversionModal, setShowConversionModal] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadedFiles(files)
          setShowConversionModal(true)
          toast({
            title: "Upload Complete!",
            description: `${files.length} file(s) uploaded successfully. Ready to convert!`,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
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
      <header className="sticky top-0 z-50 glass dark:glass-dark border-b border-white/20">
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
              
              <Button variant="gradient" className="hidden sm:flex">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
          <div className="max-w-2xl mx-auto mb-8">
            <FileUploadZone 
              onUpload={handleFileUpload}
              isUploading={isUploading}
              progress={uploadProgress}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass dark:glass-dark p-6 rounded-xl"
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
              className="glass dark:glass-dark p-6 rounded-xl"
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
              className="glass dark:glass-dark p-6 rounded-xl"
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

        {/* Tool Categories */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.h3 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
              }}
            >
              Choose Your Tool
            </motion.h3>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ 
                scale: 1.01,
                color: "hsl(var(--foreground))"
              }}
            >
              Select from our comprehensive suite of conversion tools
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ToolCard
                  category={category}
                  onToolSelect={handleToolSelect}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.h3 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
              }}
            >
              Why Choose QuickConvertor?
            </motion.h3>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ 
                scale: 1.01,
                color: "hsl(var(--foreground))"
              }}
            >
              Built for professionals, designed for everyone
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast Processing",
                description: "Advanced algorithms ensure your files are processed in seconds, not minutes."
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Your files are encrypted and automatically deleted after processing."
              },
              {
                icon: Download,
                title: "Batch Processing",
                description: "Convert multiple files at once with our powerful batch processing engine."
              },
              {
                icon: File,
                title: "100+ File Formats",
                description: "Support for virtually every file format you'll ever need."
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Our platform is always available when you need it most."
              },
              {
                icon: CheckCircle,
                title: "Quality Guaranteed",
                description: "We maintain the highest quality standards for all conversions."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full tool-card">
                  <CardHeader>
                    <feature.icon className="w-8 h-8 text-blue-500 mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="glass dark:glass-dark p-8">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <CardTitle className="text-3xl mb-4">Ready to Get Started?</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <CardDescription className="text-lg">
                  Join thousands of professionals who trust QuickConvertor for their file conversion needs.
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="gradient" className="mr-4">
                Start Converting Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        files={uploadedFiles}
      />
    </div>
  )
} 