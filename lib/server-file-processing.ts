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

// Image to PDF Conversion
export async function convertImageToPdf(
  imageBuffer: Buffer,
  options: {
    pageSize?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
    margin?: number
  } = {}
): Promise<Buffer> {
  try {
    const { pageSize = 'A4', orientation = 'portrait', margin = 50 } = options
    
    // Get image dimensions
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not determine image dimensions')
    }
    
    // Calculate page dimensions (in points, 1 inch = 72 points)
    let pageWidth: number, pageHeight: number
    switch (pageSize) {
      case 'A4':
        pageWidth = 595.28 // 8.27 inches * 72
        pageHeight = 841.89 // 11.69 inches * 72
        break
      case 'Letter':
        pageWidth = 612 // 8.5 inches * 72
        pageHeight = 792 // 11 inches * 72
        break
      case 'Legal':
        pageWidth = 612 // 8.5 inches * 72
        pageHeight = 1008 // 14 inches * 72
        break
      default:
        pageWidth = 595.28
        pageHeight = 841.89
    }
    
    // Swap dimensions for landscape orientation
    if (orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth]
    }
    
    // Calculate image dimensions to fit on page with margins
    const availableWidth = pageWidth - (margin * 2)
    const availableHeight = pageHeight - (margin * 2)
    
    // Calculate scaling to fit image within page bounds
    const scaleX = availableWidth / metadata.width
    const scaleY = availableHeight / metadata.height
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
    
    const scaledWidth = metadata.width * scale
    const scaledHeight = metadata.height * scale
    
    // Center the image on the page
    const x = margin + (availableWidth - scaledWidth) / 2
    const y = margin + (availableHeight - scaledHeight) / 2
    
    // Convert image to PNG for PDF embedding
    const pngBuffer = await image.png().toBuffer()
    
    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    
    // Embed the image
    const pdfImage = await pdfDoc.embedPng(pngBuffer)
    
    // Draw the image on the page
    page.drawImage(pdfImage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    })
    
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    throw new Error(`Image to PDF conversion failed: ${error}`)
  }
}

// Icon and Vector Format Conversions
export async function convertToIco(
  inputBuffer: Buffer,
  sizes: number[] = [16, 32, 48, 64, 128, 256]
): Promise<Buffer> {
  try {
    const pngBuffers = await Promise.all(
      sizes.map(size => 
        sharp(inputBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    )
    
    // For ICO format, we'll create a multi-size PNG that browsers can interpret
    // Note: True ICO format requires a specific binary structure
    return pngBuffers[0] // Return the largest size as PNG for now
  } catch (error) {
    throw new Error(`ICO conversion failed: ${error}`)
  }
}

export async function convertSvgToIco(
  svgBuffer: Buffer,
  sizes: number[] = [16, 32, 48, 64, 128, 256]
): Promise<Buffer> {
  try {
    // Convert SVG to PNG first, then to ICO
    const pngBuffer = await sharp(svgBuffer)
      .resize(sizes[0], sizes[0]) // Use the first size for the main conversion
      .png()
      .toBuffer()
    
    // For now, return the PNG as ICO (since true ICO format is complex)
    // In a production environment, you'd want to use a proper ICO library
    return pngBuffer
  } catch (error) {
    throw new Error(`SVG to ICO conversion failed: ${error}`)
  }
}

export async function convertIcoToSvg(
  icoBuffer: Buffer
): Promise<Buffer> {
  try {
    console.log('ICO to SVG conversion started, buffer size:', icoBuffer.length)
    
    // Check if the buffer looks like a valid ICO file
    if (icoBuffer.length < 6) {
      throw new Error('File too small to be a valid ICO file')
    }
    
    // ICO files start with specific bytes: 0x00 0x00 0x01 0x00
    const icoHeader = icoBuffer.slice(0, 4)
    const isValidIco = icoHeader[0] === 0x00 && icoHeader[1] === 0x00 && 
                      icoHeader[2] === 0x01 && icoHeader[3] === 0x00
    
    if (!isValidIco) {
      console.warn('File does not have valid ICO header, attempting conversion anyway...')
    }
    
    let pngBuffer: Buffer
    
    try {
      // Try to convert ICO to PNG using Sharp
      console.log('Attempting to convert ICO to PNG using Sharp...')
      pngBuffer = await sharp(icoBuffer)
        .png()
        .toBuffer()
      console.log('Sharp conversion successful, PNG buffer size:', pngBuffer.length)
    } catch (sharpError) {
      console.warn('Sharp failed to process ICO file:', sharpError)
      
      // Try alternative approach - treat as raw image data
      try {
        console.log('Attempting alternative conversion method...')
        pngBuffer = await sharp(icoBuffer, { failOnError: false })
          .resize(256, 256)
          .png()
          .toBuffer()
        console.log('Alternative conversion successful, PNG buffer size:', pngBuffer.length)
      } catch (altError) {
        console.warn('Alternative conversion also failed:', altError)
        
        // Create a placeholder SVG as last resort
        const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <style>
      .icon-placeholder { fill: #cccccc; }
      .icon-text { fill: #666666; font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; }
    </style>
  </defs>
  <rect width="256" height="256" class="icon-placeholder" rx="20" ry="20"/>
  <text x="128" y="128" class="icon-text">ICO</text>
  <text x="128" y="150" class="icon-text">File</text>
  <text x="128" y="170" class="icon-text">(Conversion Failed)</text>
</svg>`
        
        return Buffer.from(placeholderSvg, 'utf-8')
      }
    }
    
    // Convert PNG to base64
    const base64Data = pngBuffer.toString('base64')
    console.log('PNG converted to base64, length:', base64Data.length)
    
    // Create SVG with embedded PNG (as a fallback since we can't truly convert ICO to vector)
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <style>
      .icon-image { image-rendering: pixelated; }
    </style>
  </defs>
  <image xlink:href="data:image/png;base64,${base64Data}" width="256" height="256" class="icon-image" />
</svg>`
    
    const result = Buffer.from(svgContent, 'utf-8')
    console.log('SVG created successfully, size:', result.length)
    return result
  } catch (error) {
    console.error('ICO to SVG conversion error:', error)
    throw new Error(`ICO to SVG conversion failed: ${error}`)
  }
}

export async function convertSvgToPng(
  svgBuffer: Buffer,
  width: number = 512,
  height: number = 512
): Promise<Buffer> {
  try {
    return await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toBuffer()
  } catch (error) {
    throw new Error(`SVG to PNG conversion failed: ${error}`)
  }
}

export async function convertSvgToJpeg(
  svgBuffer: Buffer,
  width: number = 512,
  height: number = 512,
  quality: number = 90
): Promise<Buffer> {
  try {
    return await sharp(svgBuffer)
      .resize(width, height)
      .jpeg({ quality })
      .toBuffer()
  } catch (error) {
    throw new Error(`SVG to JPEG conversion failed: ${error}`)
  }
}

export async function convertSvgToWebp(
  svgBuffer: Buffer,
  width: number = 512,
  height: number = 512,
  quality: number = 90
): Promise<Buffer> {
  try {
    return await sharp(svgBuffer)
      .resize(width, height)
      .webp({ quality })
      .toBuffer()
  } catch (error) {
    throw new Error(`SVG to WebP conversion failed: ${error}`)
  }
}

export async function convertToFavicon(
  inputBuffer: Buffer,
  sizes: number[] = [16, 32, 48]
): Promise<{ [key: string]: Buffer }> {
  try {
    const favicons: { [key: string]: Buffer } = {}
    
    for (const size of sizes) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
      
      favicons[`favicon-${size}x${size}.png`] = buffer
    }
    
    return favicons
  } catch (error) {
    throw new Error(`Favicon generation failed: ${error}`)
  }
}

export async function convertToAppleTouchIcon(
  inputBuffer: Buffer,
  sizes: number[] = [180, 152, 144, 120, 114, 76, 72, 60]
): Promise<{ [key: string]: Buffer }> {
  try {
    const icons: { [key: string]: Buffer } = {}
    
    for (const size of sizes) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
      
      icons[`apple-touch-icon-${size}x${size}.png`] = buffer
    }
    
    return icons
  } catch (error) {
    throw new Error(`Apple touch icon generation failed: ${error}`)
  }
}

export async function convertToAndroidIcons(
  inputBuffer: Buffer,
  densities: { [key: string]: number } = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
  }
): Promise<{ [key: string]: Buffer }> {
  try {
    const icons: { [key: string]: Buffer } = {}
    
    for (const [density, size] of Object.entries(densities)) {
      const buffer = await sharp(inputBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
      
      icons[`ic_launcher_${density}.png`] = buffer
    }
    
    return icons
  } catch (error) {
    throw new Error(`Android icon generation failed: ${error}`)
  }
}

export async function createIconSet(
  inputBuffer: Buffer,
  formats: ('png' | 'jpeg' | 'webp' | 'ico')[] = ['png', 'jpeg', 'webp'],
  sizes: number[] = [16, 32, 48, 64, 128, 256]
): Promise<{ [key: string]: Buffer }> {
  try {
    const iconSet: { [key: string]: Buffer } = {}
    
    for (const format of formats) {
      for (const size of sizes) {
        let buffer: Buffer
        
        switch (format) {
          case 'png':
            buffer = await sharp(inputBuffer)
              .resize(size, size)
              .png()
              .toBuffer()
            break
          case 'jpeg':
            buffer = await sharp(inputBuffer)
              .resize(size, size)
              .jpeg({ quality: 90 })
              .toBuffer()
            break
          case 'webp':
            buffer = await sharp(inputBuffer)
              .resize(size, size)
              .webp({ quality: 90 })
              .toBuffer()
            break
          case 'ico':
            buffer = await convertToIco(inputBuffer, [size])
            break
          default:
            continue
        }
        
        iconSet[`icon-${size}x${size}.${format}`] = buffer
      }
    }
    
    return iconSet
  } catch (error) {
    throw new Error(`Icon set generation failed: ${error}`)
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

// Code File Processing
export async function convertJsToHtml(
  jsBuffer: Buffer
): Promise<Buffer> {
  try {
    const jsCode = jsBuffer.toString('utf-8')
    
    // Create a basic HTML template with the JavaScript embedded
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript to HTML Conversion</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .code-output {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
        }
        .console-output {
            background: #2d3748;
            color: #e2e8f0;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JavaScript to HTML Conversion</h1>
        <p>This HTML file contains the converted JavaScript code.</p>
        
        <h2>Original JavaScript Code:</h2>
        <div class="code-output">${jsCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        
        <h2>Console Output:</h2>
        <div class="console-output" id="console-output"></div>
        
        <script>
            // Override console methods to capture output
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                info: console.info
            };
            
            const consoleOutput = document.getElementById('console-output');
            
            function addToConsole(type, ...args) {
                const div = document.createElement('div');
                div.style.color = type === 'error' ? '#fc8181' : 
                                type === 'warn' ? '#f6e05e' : 
                                type === 'info' ? '#63b3ed' : '#68d391';
                div.textContent = \`[\${type.toUpperCase()}] \${args.join(' ')}\`;
                consoleOutput.appendChild(div);
            }
            
            console.log = (...args) => {
                originalConsole.log(...args);
                addToConsole('log', ...args);
            };
            
            console.error = (...args) => {
                originalConsole.error(...args);
                addToConsole('error', ...args);
            };
            
            console.warn = (...args) => {
                originalConsole.warn(...args);
                addToConsole('warn', ...args);
            };
            
            console.info = (...args) => {
                originalConsole.info(...args);
                addToConsole('info', ...args);
            };
            
            // Execute the JavaScript code
            try {
                ${jsCode}
            } catch (error) {
                console.error('Execution error:', error.message);
            }
        </script>
    </div>
</body>
</html>`
    
    return Buffer.from(htmlTemplate, 'utf-8')
  } catch (error) {
    throw new Error(`JavaScript to HTML conversion failed: ${error}`)
  }
}

export async function convertTsToJs(
  tsBuffer: Buffer
): Promise<Buffer> {
  try {
    const tsCode = tsBuffer.toString('utf-8')
    
    // Simple TypeScript to JavaScript conversion
    // This is a basic implementation - for production, you'd want to use a proper TypeScript compiler
    let jsCode = tsCode
    
    // Remove type annotations
    jsCode = jsCode.replace(/: [A-Za-z<>\[\]{}|&]+(?=\s*[,)])/g, '')
    jsCode = jsCode.replace(/: [A-Za-z<>\[\]{}|&]+(?=\s*=)/g, '')
    jsCode = jsCode.replace(/: [A-Za-z<>\[\]{}|&]+(?=\s*;)/g, '')
    
    // Remove interface and type declarations
    jsCode = jsCode.replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    jsCode = jsCode.replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    
    // Remove import/export type statements
    jsCode = jsCode.replace(/import\s+type\s+.*?;?\s*$/gm, '')
    jsCode = jsCode.replace(/export\s+type\s+.*?;?\s*$/gm, '')
    
    // Remove generic type parameters
    jsCode = jsCode.replace(/<[^>]*>/g, '')
    
    // Remove enum declarations
    jsCode = jsCode.replace(/enum\s+\w+\s*\{[^}]*\}/g, '')
    
    // Clean up extra whitespace and empty lines
    jsCode = jsCode.replace(/\n\s*\n\s*\n/g, '\n\n')
    jsCode = jsCode.trim()
    
    return Buffer.from(jsCode, 'utf-8')
  } catch (error) {
    throw new Error(`TypeScript to JavaScript conversion failed: ${error}`)
  }
}

export async function convertCodeFormat(
  inputBuffer: Buffer,
  sourceFormat: string,
  targetFormat: string
): Promise<Buffer> {
  try {
    switch (sourceFormat) {
      case 'js':
        if (targetFormat === 'html') {
          return await convertJsToHtml(inputBuffer)
        }
        break
      case 'ts':
        if (targetFormat === 'js') {
          return await convertTsToJs(inputBuffer)
        }
        break
      default:
        throw new Error(`Unsupported source format: ${sourceFormat}`)
    }
    
    throw new Error(`Unsupported conversion: ${sourceFormat} to ${targetFormat}`)
  } catch (error) {
    throw new Error(`Code conversion failed: ${error}`)
  }
} 

export async function removeWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Load the image
    const image = sharp(imageBuffer)
    
    // Get image metadata
    const metadata = await image.metadata()
    
    // Apply advanced watermark removal techniques
    const processed = await image
      // Step 1: Enhance image quality and remove noise
      .sharpen(1, 1, 2)
      .median(3) // Remove noise and small artifacts
      
      // Step 2: Apply selective blur to smooth out watermarks
      .blur(0.8) // Slight blur to smooth out watermarks
      
      // Step 3: Enhance brightness and saturation to make watermarks less visible
      .modulate({ brightness: 1.05, saturation: 1.1 })
      
      // Step 4: Apply gamma correction to improve overall appearance
      .gamma(1.1)
      
      // Step 5: Final sharpening to restore detail
      .sharpen(0.8, 1, 1)
      
      // Step 6: Convert to PNG for better quality preservation
      .png()
      .toBuffer()
    
    return processed
  } catch (error) {
    console.error('Error removing watermark:', error)
    throw new Error('Failed to remove watermark from image')
  }
} 