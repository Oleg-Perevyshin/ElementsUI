import type { UIComponent } from '$lib'

export const formatObjectToString = (properties: UIComponent['properties']): string => {
  const clearValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/\s+/g, ' ').trim()
    } else if (Array.isArray(value)) {
      return value.map((item) => clearValue(item))
    } else if (value !== null && typeof value === 'object') {
      const sanitized: any = {}
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = clearValue(val)
      }
      return sanitized
    }
    return value
  }

  const clearedValue = clearValue(properties)

  const jsonString = JSON.stringify(clearedValue, null, 2)
  const obj = JSON.parse(jsonString)

  const formatValue = (value: any, depth: number = 0): string => {
    if (typeof value === 'string') {
      return `'${value}'`
    } else if (typeof value === 'number') {
      return String(value)
    } else if (typeof value === 'boolean') {
      return String(value)
    } else if (value === null) {
      return "''"
    } else if (Array.isArray(value)) {
      const items = value.map((item) => formatValue(item, depth + 1))
      return `[${items.join(`, `)}]`
    } else if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return '{}'
      }
      const lines = entries.map(([key, val]) => {
        const formattedVal = formatValue(val, depth + 1)
        return `${key}: ${formattedVal}`
      })
      return '{ ' + lines.join(', ') + ' }'
    } else {
      return String(value)
    }
  }

  const lines: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    let formattedValue = formatValue(value)

    if (typeof value === 'object' && value !== null) {
      formattedValue = `{${formattedValue}}`
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      formattedValue = `{${formattedValue}}`
    }

    if (typeof value === 'string') {
      lines.push(`  ${key}=${formattedValue}`)
    } else if (value === null) {
      lines.push(`${key}=''`)
    } else {
      lines.push(`  ${key}=${formattedValue}`)
    }
  }

  return lines.join('\n')
}
