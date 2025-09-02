import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import * as path from 'path'
import { prisma } from '../../../../lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for documents
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/rtf',
  'application/zip',
  'application/x-zip-compressed'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const positionId = formData.get('positionId') as string
    const files = formData.getAll('files') as File[]

    if (!positionId) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Verify position exists
    const position = await prisma.position.findUnique({
      where: { id: positionId }
    })

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    const uploadedFiles = []
    const uploadDir = path.join(process.cwd(), 'public/uploads/documents')

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not allowed. Allowed types include PDF, Word, Excel, PowerPoint, Text files, and ZIP archives` 
        }, { status: 400 })
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum allowed size of 10MB` 
        }, { status: 400 })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = path.extname(file.name)
      const filename = `${timestamp}_${randomString}${fileExtension}`
      const filePath = path.join(uploadDir, filename)
      const publicUrl = `/uploads/documents/${filename}`

      // Save file to disk
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      // Save to database
      const positionDocument = await prisma.positionDocument.create({
        data: {
          positionId: positionId,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type
        }
      })

      uploadedFiles.push({
        id: positionDocument.id,
        name: file.name,
        originalName: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      })
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedFiles.length} document(s)`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get('positionId')

    if (!positionId) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 })
    }

    const documents = await prisma.positionDocument.findMany({
      where: { positionId: positionId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}