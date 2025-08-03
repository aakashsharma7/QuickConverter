import { NextRequest, NextResponse } from 'next/server'
import { 
  convertImageFormat, 
  convertVideoFormat, 
  extractAudioFromVideo,
  convertDocxToHtml,
  convertDocxToText,
  convertSvgToPng,
  convertSvgToJpeg,
  convertSvgToWebp,
  convertToIco,
  convertToFavicon,
  convertToAppleTouchIcon,
  convertToAndroidIcons,
  createIconSet,
  convertCodeFormat
} from '@/lib/server-file-processing'
import { 
  getFileExtension,
  isValidImageFormat,
  isValidVideoFormat,
  isValidAudioFormat,
  isValidDocumentFormat,
  isValidIconFormat,
  isValidVectorFormat,
  isValidCodeFormat
} from '@/lib/file-processing'

export async function POST(request: NextRequest) {
  let file: File | null = null
  let targetFormat: string | null = null
  const startTime = Date.now()
  
  try {
    const formData = await request.formData()
    file = formData.get('file') as File
    targetFormat = formData.get('targetFormat') as string
    
    console.log('Conversion request:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      targetFormat
    })
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!targetFormat) {
      return NextResponse.json({ error: 'No target format specified' }, { status: 400 })
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileExtension = getFileExtension(file.name)
    
    console.log('File processing:', {
      fileExtension,
      bufferLength: buffer.length,
      isValidImage: isValidImageFormat(fileExtension),
      isValidVideo: isValidVideoFormat(fileExtension),
      isValidAudio: isValidAudioFormat(fileExtension),
      isValidDocument: isValidDocumentFormat(fileExtension),
      isValidCode: isValidCodeFormat(fileExtension)
    })
    
    let result: Buffer
    let mimeType: string
    
    // Determine file type and convert accordingly
    if (isValidImageFormat(fileExtension)) {
      // Handle SVG conversions
      if (fileExtension === 'svg') {
        switch (targetFormat) {
          case 'png':
            result = await convertSvgToPng(buffer)
            mimeType = 'image/png'
            break
          case 'jpeg':
          case 'jpg':
            result = await convertSvgToJpeg(buffer)
            mimeType = 'image/jpeg'
            break
          case 'webp':
            result = await convertSvgToWebp(buffer)
            mimeType = 'image/webp'
            break
          case 'ico':
            result = await convertToIco(buffer)
            mimeType = 'image/x-icon'
            break
          default:
            result = await convertImageFormat(buffer, targetFormat as any)
            mimeType = `image/${targetFormat}`
        }
      } else {
        // Handle regular image to icon conversions
        if (targetFormat === 'ico') {
          result = await convertToIco(buffer)
          mimeType = 'image/x-icon'
        } else {
          result = await convertImageFormat(buffer, targetFormat as any)
          mimeType = `image/${targetFormat}`
        }
      }
    } else if (isValidVideoFormat(fileExtension)) {
      if (['mp3', 'wav', 'aac'].includes(targetFormat)) {
        result = await extractAudioFromVideo(buffer, targetFormat as any)
        mimeType = `audio/${targetFormat}`
      } else {
        result = await convertVideoFormat(buffer, targetFormat as any)
        mimeType = `video/${targetFormat}`
      }
    } else if (isValidDocumentFormat(fileExtension)) {
      // Handle different document types
      if (file.name.toLowerCase().endsWith('.docx')) {
        const text = targetFormat === 'html' 
          ? await convertDocxToHtml(buffer)
          : await convertDocxToText(buffer)
        result = Buffer.from(text, 'utf-8')
        mimeType = targetFormat === 'html' ? 'text/html' : 'text/plain'
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        // For text files, we can convert to HTML or keep as text
        const textContent = buffer.toString('utf-8')
        if (targetFormat === 'html') {
          const htmlContent = textContent
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('')
          result = Buffer.from(`<html><body>${htmlContent}</body></html>`, 'utf-8')
          mimeType = 'text/html'
        } else {
          result = buffer // Keep as text
          mimeType = 'text/plain'
        }
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we can extract text (simplified)
        if (targetFormat === 'txt') {
          // This is a simplified PDF text extraction
          // In a real implementation, you'd use a proper PDF parser
          result = Buffer.from('PDF text extraction would be implemented here', 'utf-8')
          mimeType = 'text/plain'
        } else if (targetFormat === 'html') {
          result = Buffer.from('<html><body><p>PDF to HTML conversion would be implemented here</p></body></html>', 'utf-8')
          mimeType = 'text/html'
        } else {
          return NextResponse.json({ error: 'PDF conversion to this format is not supported' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ 
          error: `Document conversion not supported for ${fileExtension} files. Supported formats: .docx, .txt, .pdf` 
        }, { status: 400 })
      }
    } else if (isValidCodeFormat(fileExtension)) {
      // Handle code file conversions
      result = await convertCodeFormat(buffer, fileExtension, targetFormat)
      
      // Set appropriate MIME type based on target format
      switch (targetFormat) {
        case 'html':
          mimeType = 'text/html'
          break
        case 'js':
          mimeType = 'application/javascript'
          break
        case 'ts':
          mimeType = 'application/typescript'
          break
        case 'txt':
          mimeType = 'text/plain'
          break
        default:
          mimeType = 'text/plain'
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    
    // Track analytics
    const processingTime = Date.now() - startTime
    try {
      await fetch(`${request.nextUrl.origin}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          originalFormat: fileExtension,
          targetFormat,
          fileSize: buffer.length,
          processingTime,
          success: true
        })
      })
    } catch (error) {
      console.warn('Failed to track analytics:', error)
    }
    
    // Create response with converted file
    const response = new NextResponse(result.slice(), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.${targetFormat}"`
      }
    })
    
    return response
    
  } catch (error) {
    console.error('Conversion error:', error)
    console.error('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      targetFormat
    })
    
    // Track failed conversion analytics
    const processingTime = Date.now() - startTime
    try {
      await fetch(`${request.nextUrl.origin}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file?.name || 'unknown',
          originalFormat: file ? getFileExtension(file.name) : 'unknown',
          targetFormat: targetFormat || 'unknown',
          fileSize: file?.size || 0,
          processingTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
      })
    } catch (analyticsError) {
      console.warn('Failed to track analytics:', analyticsError)
    }
    
    return NextResponse.json(
      { 
        error: 'Conversion failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fileInfo: {
          name: file?.name,
          size: file?.size,
          type: file?.type,
          targetFormat
        }
      }, 
      { status: 500 }
    )
  }
}

// GET endpoint removed as it's not needed for the current implementation 