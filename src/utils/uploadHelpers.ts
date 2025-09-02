// Utility functions for file uploads

export interface UploadedFile {
  id: string
  name: string
  originalName: string
  url: string
  size: number
  type: string
  createdAt?: string
}

export interface UploadResponse {
  message: string
  files: UploadedFile[]
}

export interface UploadError {
  error: string
}

// Upload images to a position
export async function uploadImages(positionId: string, files: File[]): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('positionId', positionId)
  
  files.forEach(file => {
    formData.append('files', file)
  })

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || 'Failed to upload images')
  }

  return response.json()
}

// Upload documents to a position
export async function uploadDocuments(positionId: string, files: File[]): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('positionId', positionId)
  
  files.forEach(file => {
    formData.append('files', file)
  })

  const response = await fetch('/api/upload/document', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || 'Failed to upload documents')
  }

  return response.json()
}

// Get images for a position
export async function getImages(positionId: string): Promise<UploadedFile[]> {
  const response = await fetch(`/api/upload/image?positionId=${positionId}`)
  
  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || 'Failed to fetch images')
  }

  return response.json()
}

// Get documents for a position
export async function getDocuments(positionId: string): Promise<UploadedFile[]> {
  const response = await fetch(`/api/upload/document?positionId=${positionId}`)
  
  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || 'Failed to fetch documents')
  }

  return response.json()
}

// Delete a file (image or document)
export async function deleteFile(type: 'image' | 'document', fileId: string): Promise<void> {
  const response = await fetch(`/api/upload/${type}/${fileId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || `Failed to delete ${type}`)
  }
}

// Get file details
export async function getFileDetails(type: 'image' | 'document', fileId: string): Promise<UploadedFile> {
  const response = await fetch(`/api/upload/${type}/${fileId}`)
  
  if (!response.ok) {
    const errorData: UploadError = await response.json()
    throw new Error(errorData.error || `Failed to fetch ${type} details`)
  }

  return response.json()
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file before upload
export function validateFile(file: File, type: 'image' | 'document'): string | null {
  const maxSizeImage = 10 * 1024 * 1024 // 10MB
  const maxSizeDocument = 10 * 1024 * 1024 // 10MB
  
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const allowedDocumentTypes = [
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

  if (type === 'image') {
    if (!allowedImageTypes.includes(file.type)) {
      return `Invalid image type. Allowed: ${allowedImageTypes.join(', ')}`
    }
    if (file.size > maxSizeImage) {
      return `Image size ${formatFileSize(file.size)} exceeds maximum of ${formatFileSize(maxSizeImage)}`
    }
  } else if (type === 'document') {
    if (!allowedDocumentTypes.includes(file.type)) {
      return 'Invalid document type. Allowed: PDF, Word, Excel, PowerPoint, Text files, ZIP archives'
    }
    if (file.size > maxSizeDocument) {
      return `Document size ${formatFileSize(file.size)} exceeds maximum of ${formatFileSize(maxSizeDocument)}`
    }
  }

  return null // No validation error
}

// Batch validate files
export function validateFiles(files: File[], type: 'image' | 'document'): string[] {
  const errors: string[] = []
  
  files.forEach((file, index) => {
    const error = validateFile(file, type)
    if (error) {
      errors.push(`File ${index + 1} (${file.name}): ${error}`)
    }
  })
  
  return errors
}