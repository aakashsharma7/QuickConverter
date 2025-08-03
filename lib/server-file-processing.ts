import sharp from 'sharp'
import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import { createWorker } from 'tesseract.js'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import mammoth from 'mammoth'
import JSZip from 'jszip'

// Image Processing with Sharp
export async function convertImageFormat(
  inputBuffer: Buffer,
  targetFormat: 'jpeg' | 'png' | 'webp' | 'avif'
): Promise<Buffer> {
  try {
    let pipeline = sharp(inputBuffer)
    
    switch (targetFormat) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: 90 })
        break
      case 'png':
        pipeline = pipeline.png()
        break
      case 'webp':
        pipeline = pipeline.webp({ quality: 90 })
        break
      case 'avif':
        pipeline = pipeline.avif({ quality: 90 })
        break
    }
    
    return await pipeline.toBuffer()
  } catch (error) {
    throw new Error(`Image conversion failed: ${error}`)
  }
}

export async function removeImageBackground(
  inputBuffer: Buffer
): Promise<Buffer> {
  try {
    return await sharp(inputBuffer)
      .removeAlpha()
      .png()
      .toBuffer()
  } catch (error) {
    throw new Error(`Background removal failed: ${error}`)
  }
}

export async function compressImage(
  inputBuffer: Buffer,
  quality: number = 80
): Promise<Buffer> {
  try {
    return await sharp(inputBuffer)
      .jpeg({ quality })
      .toBuffer()
  } catch (error) {
    throw new Error(`Image compression failed: ${error}`)
  }
}

// PDF Processing with PDF-lib
export async function editPDF(
  inputBuffer: Buffer,
  operations: {
    addText?: { text: string; x: number; y: number; size: number }[]
    addImage?: { imageBuffer: Buffer; x: number; y: number; width: number; height: number }[]
  }
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(inputBuffer)
    const pages = pdfDoc.getPages()
    
    if (pages.length > 0) {
      const firstPage = pages[0]
      
      if (operations.addText) {
        operations.addText.forEach(({ text, x, y, size }) => {
          firstPage.drawText(text, {
            x,
            y,
            size,
            color: rgb(0, 0, 0)
          })
        })
      }
      
      if (operations.addImage) {
        for (const { imageBuffer, x, y, width, height } of operations.addImage) {
          const image = await pdfDoc.embedPng(imageBuffer)
          firstPage.drawImage(image, {
            x,
            y,
            width,
            height
          })
        }
      }
    }
    
    return Buffer.from(await pdfDoc.save())
  } catch (error) {
    throw new Error(`PDF editing failed: ${error}`)
  }
}

export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  try {
    const mergedPdf = await PDFDocument.create()
    
    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }
    
    return Buffer.from(await mergedPdf.save())
  } catch (error) {
    throw new Error(`PDF merge failed: ${error}`)
  }
}

// OCR with Tesseract.js
export async function extractTextFromImage(
  imageBuffer: Buffer,
  language: string = 'eng'
): Promise<string> {
  try {
    const worker = await createWorker(language)
    const { data: { text } } = await worker.recognize(imageBuffer)
    await worker.terminate()
    return text
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error}`)
  }
}

// Video/Audio Processing with FFmpeg.wasm
export async function convertVideoFormat(
  inputBuffer: Buffer,
  targetFormat: 'mp4' | 'avi' | 'mov' | 'webm'
): Promise<Buffer> {
  try {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load()
    
    const inputName = 'input.mp4'
    const outputName = `output.${targetFormat}`
    
    ffmpeg.writeFile(inputName, inputBuffer)
    
    await ffmpeg.exec(['-i', inputName, outputName])
    
    const data = await ffmpeg.readFile(outputName)
    return Buffer.from(data)
  } catch (error) {
    console.warn('Video conversion failed, returning original:', error)
    return inputBuffer
  }
}

export async function extractAudioFromVideo(
  videoBuffer: Buffer,
  audioFormat: 'mp3' | 'wav' | 'aac' = 'mp3'
): Promise<Buffer> {
  try {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load()
    
    const inputName = 'input.mp4'
    const outputName = `audio.${audioFormat}`
    
    ffmpeg.writeFile(inputName, videoBuffer)
    
    await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'libmp3lame', outputName])
    
    const data = await ffmpeg.readFile(outputName)
    return Buffer.from(data)
  } catch (error) {
    console.warn('Audio extraction failed, returning original:', error)
    return videoBuffer
  }
}

// Document Processing with Mammoth
export async function convertDocxToHtml(
  docxBuffer: Buffer
): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer: docxBuffer })
    return result.value
  } catch (error) {
    throw new Error(`DOCX to HTML conversion failed: ${error}`)
  }
}

export async function convertDocxToText(
  docxBuffer: Buffer
): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: docxBuffer })
    return result.value
  } catch (error) {
    throw new Error(`DOCX to text conversion failed: ${error}`)
  }
}

// File Compression with JSZip
export async function compressFiles(
  files: { name: string; buffer: Buffer }[]
): Promise<Buffer> {
  try {
    const zip = new JSZip()
    
    files.forEach(({ name, buffer }) => {
      zip.file(name, buffer)
    })
    
    return await zip.generateAsync({ type: 'nodebuffer' })
  } catch (error) {
    throw new Error(`File compression failed: ${error}`)
  }
}

export async function extractZipFile(
  zipBuffer: Buffer
): Promise<{ name: string; buffer: Buffer }[]> {
  try {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipBuffer)
    
    const files: { name: string; buffer: Buffer }[] = []
    
    for (const [name, file] of Object.entries(zipContent.files)) {
      if (!file.dir) {
        const buffer = await file.async('nodebuffer')
        files.push({ name, buffer })
      }
    }
    
    return files
  } catch (error) {
    throw new Error(`ZIP extraction failed: ${error}`)
  }
} 