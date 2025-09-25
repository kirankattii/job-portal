import { FILE_UPLOAD } from '@/constants'

export const bytesToSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export const validateFile = (file, allowed = [...FILE_UPLOAD.ALLOWED_TYPES.DOCUMENT, ...FILE_UPLOAD.ALLOWED_TYPES.IMAGE], maxSize = FILE_UPLOAD.MAX_SIZE) => {
  const errors = []
  if (!allowed.includes(file.type)) errors.push('Unsupported file type')
  if (file.size > maxSize) errors.push('File too large')
  return { valid: errors.length === 0, errors }
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}


