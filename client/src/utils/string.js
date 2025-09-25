export const capitalize = (s) => (typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s)
export const titleCase = (s = '') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
export const truncate = (s = '', max = 100) => (s.length > max ? `${s.slice(0, max)}…` : s)
export const slugify = (s = '') => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')


