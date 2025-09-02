import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import * as path from 'path'
import { prisma } from '../../../../../lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params

    if (!['image', 'document'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "image" or "document"' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    let fileRecord: any = null
    let filePath: string = ''

    if (type === 'image') {
      // Find the image record
      fileRecord = await prisma.positionImage.findUnique({
        where: { id: id }
      })

      if (!fileRecord) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })
      }

      filePath = path.join(process.cwd(), 'public', fileRecord.url)

      // Delete from database
      await prisma.positionImage.delete({
        where: { id: id }
      })
    } else if (type === 'document') {
      // Find the document record
      fileRecord = await prisma.positionDocument.findUnique({
        where: { id: id }
      })

      if (!fileRecord) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      filePath = path.join(process.cwd(), 'public', fileRecord.url)

      // Delete from database
      await prisma.positionDocument.delete({
        where: { id: id }
      })
    }

    // Delete the actual file from filesystem
    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`File not found on filesystem: ${filePath}`, error)
      // Continue execution - database record is already deleted
    }

    return NextResponse.json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
      id: id,
      name: fileRecord.name
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params

    if (!['image', 'document'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "image" or "document"' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    let fileRecord: any = null

    if (type === 'image') {
      fileRecord = await prisma.positionImage.findUnique({
        where: { id: id },
        include: {
          position: {
            select: {
              id: true,
              numero: true,
              titre: true
            }
          }
        }
      })
    } else if (type === 'document') {
      fileRecord = await prisma.positionDocument.findUnique({
        where: { id: id },
        include: {
          position: {
            select: {
              id: true,
              numero: true,
              titre: true
            }
          }
        }
      })
    }

    if (!fileRecord) {
      return NextResponse.json({ error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` }, { status: 404 })
    }

    return NextResponse.json(fileRecord)

  } catch (error) {
    console.error('Error fetching file details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file details' },
      { status: 500 }
    )
  }
}