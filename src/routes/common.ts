import type { ITableHeader, UIComponent } from "$lib"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { t } from "$lib/locales/i18n"
import { get } from "svelte/store"

export const formatObjectToString = (properties: UIComponent["properties"]): string => {
  const clearValue = (value: any): any => {
    if (typeof value === "string") {
      return value.replace(/\s+/g, " ").trim()
    } else if (Array.isArray(value)) {
      return value.map((item) => clearValue(item))
    } else if (value !== null && typeof value === "object") {
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
    if (typeof value === "string") {
      return `'${value}'`
    } else if (typeof value === "number") {
      return String(value)
    } else if (typeof value === "boolean") {
      return String(value)
    } else if (value === null) {
      return "''"
    } else if (Array.isArray(value)) {
      const items = value.map((item) => formatValue(item, depth + 1))
      return `[${items.join(`, `)}]`
    } else if (typeof value === "object") {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return "{}"
      }
      const lines = entries.map(([key, val]) => {
        const formattedVal = formatValue(val, depth + 1)
        return `${key}: ${formattedVal}`
      })
      return "{ " + lines.join(", ") + " }"
    } else {
      return String(value)
    }
  }

  const lines: string[] = []
  const regExp = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/
  for (const [key, value] of Object.entries(obj)) {
    if (key === "eventHandler") continue
    if (key === "id" && regExp.test(value as string)) {
      lines.push(`  ${key}={crypto.randomUUID()}`)
      continue
    }
    let formattedValue = formatValue(value)

    if (typeof value === "object" && value !== null) {
      formattedValue = `{${formattedValue}}`
    } else if (typeof value === "boolean" || typeof value === "number") {
      formattedValue = `{${formattedValue}}`
    }

    if (typeof value === "string") {
      lines.push(`  ${key}=${formattedValue}`)
    } else if (value === null) {
      lines.push(`${key}=''`)
    } else {
      lines.push(`  ${key}=${formattedValue}`)
    }
  }

  return lines.join("\n")
}

const promises: Record<string, Promise<any>> = {}
export const importModule = async (url: string): Promise<any> => {
  if (await promises[url]) {
    return promises[url]
  }

  promises[url] = new Promise<any>((resolve, reject) => {
    const s = document.createElement("script")
    s.src = url
    s.type = "module"
    s.addEventListener("load", () => {
      resolve(undefined)
    })
    s.addEventListener("error", reject)
    document.head.appendChild(s)
  })

  return promises[url]
}

export const RenderMarkdown = async (text: string) => {
  if (typeof text !== "string") {
    return ""
  }

  try {
    /* Установка опций для обработки Markdown */
    marked.setOptions({
      async: false, // Отключаем асинхронный режим
      breaks: true, // Включает поддержку разрыва строк
      gfm: true, // Поддержка GitHub Flavored Markdown
      pedantic: false, // Отключает строгий режим
      silent: true, // Не вызывает ошибок при рендеринге
    })

    /* Преобразуем Markdown в HTML и очищаем */
    const html = await marked(text)
    const cleanHtml = DOMPurify.sanitize(html)
    return cleanHtml
  } catch (error) {
    return ""
  }
}

export interface TableRows {
  name: string
  type: string
  default: string
  description: string
}

const translate = get(t)
export const TableColumns: ITableHeader<TableRows>[] = [
  { label: { name: translate("library.props.name") }, content: [{ type: "text", data: { key: "name" } }], width: "15%" },
  {
    label: { name: translate("library.props.type") },
    content: [{ type: "text", data: { key: "type" } }],
    width: "30%",
  },
  { label: { name: translate("library.props.default") }, content: [{ type: "text", data: { key: "default" } }], width: "20%" },
  {
    label: { name: translate("library.props.desc") },
    content: [{ type: "text", data: { key: "description" } }],
    width: "35%",
  },
]
