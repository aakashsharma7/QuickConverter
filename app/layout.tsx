import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans'
})

export const metadata: Metadata = {
  title: 'QuickConvertor - All-in-One File Conversion Platform',
  description: 'Premium file conversion tools including PDF editor, image converter, watermark remover, OCR, and more. Fast, secure, and professional-grade conversion services.',
  keywords: 'file converter, PDF editor, image converter, watermark remover, OCR, video converter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 