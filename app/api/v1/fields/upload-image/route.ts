import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'

const uploadDir = join(process.cwd(), 'public/uploads/fields')

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename with timestamp and original extension
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const filename = `field-${timestamp}.${extension}`
    
    // Save the file
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const publicUrl = `/uploads/fields/${filename}`
    
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}