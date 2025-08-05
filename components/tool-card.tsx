"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Tool {
  name: string
  description: string
  icon: any
}

interface ToolCategory {
  id: string
  title: string
  description: string
  icon: any
  color: string
  tools: Tool[]
}

interface ToolCardProps {
  category: ToolCategory
  onToolSelect: (toolName: string) => void
}

export function ToolCard({ category, onToolSelect }: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCardClick = () => {
    onToolSelect(category.title)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { 
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full tool-card overflow-hidden cursor-pointer group"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div 
                className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <category.icon className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
              <div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{category.title}</CardTitle>
                <CardDescription className="text-sm group-hover:text-foreground/80 transition-colors">
                  {category.description}
                </CardDescription>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandClick}
                className="p-1"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-4 border-t">
              {category.tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToolSelect(tool.name)
                    }}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <tool.icon className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onToolSelect(category.title)
                }}
              >
                Use {category.title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 