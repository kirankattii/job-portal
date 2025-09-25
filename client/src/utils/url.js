export const toQueryString = (params = {}) => {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, String(v)))
    } else {
      usp.set(key, String(value))
    }
  })
  return usp.toString()
}

export const parseQueryString = (search = window.location.search) => {
  const usp = new URLSearchParams(search)
  const result = {}
  usp.forEach((value, key) => {
    if (result[key]) {
      result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value]
    } else {
      result[key] = value
    }
  })
  return result
}


