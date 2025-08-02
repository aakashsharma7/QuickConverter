import { NextRequest, NextResponse } from 'next/server'
import { 
  convertImageFormat, 
  convertVideoFormat, 
  extractAudioFromVideo,
  convertDocxToHtml,
  convertDocxToText
} from '@/lib/server-file-processing'
import { 
  getFileExtension,
  isValidImageFormat,
  isValidVideoFormat,
  isValidAudioFormat,
  isValidDocumentFormat
} from '@/lib/file-processing'

export async function POST(request: NextRequest) {
  let file: File | null = null
  let targetFormat: string | null = null
  
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
      isValidDocument: isValidDocumentFormat(fileExtension)
    })
    
    let result: Buffer
    let mimeType: string
    
    // Determine file type and convert accordingly
    if (isValidImageFormat(fileExtension)) {
      result = await convertImageFormat(buffer, targetFormat as any)
      mimeType = `image/${targetFormat}`
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
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    
    // Create response with converted file
    const response = new NextResponse(result)
    response.headers.set('Content-Type', mimeType)
    response.headers.set('Content-Disposition', `attachment; filename="${file.name.split('.')[0]}.${targetFormat}"`)
    
    return response
    
  } catch (error) {
    console.error('Conversion error:', error)
    console.error('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      targetFormat
    })
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