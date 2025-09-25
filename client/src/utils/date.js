import { format, formatDistanceToNow, parseISO, addDays, isBefore } from 'date-fns'
import { DATE_FORMATS } from '@/constants'

export const formatDate = (date, fmt = DATE_FORMATS.DISPLAY) => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export const timeAgo = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export const addDaysFrom = (date, days) => addDays(typeof date === 'string' ? parseISO(date) : date, days)

export const isExpired = (date) => isBefore(new Date(date), new Date())


