const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

/* Текст для вставки в HTML: спецсимволы заменяются сущностями */
export const escapeHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])

/* Видимый текст HTML-строки: DOMParser создаёт неактивный документ, скрипты и обработчики в нём не запускаются */
export const htmlToText = (html: string): string => {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]*>?/g, "")
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
}

/* Теги, которые остаются после очистки: значки SVG и простая разметка текста */
const SAFE_TAGS = new Set(
  (
    "svg g path circle ellipse line polyline polygon rect defs lineargradient radialgradient stop clippath mask pattern symbol use title desc text tspan " +
    "b strong i em u s small sub sup br span div p code pre ul ol li a"
  ).split(" "),
)

/* Теги, которые выбрасываются вместе с содержимым */
const DROP_WITH_CONTENT = new Set(["script", "style", "iframe", "object", "embed", "foreignobject", "noscript", "template", "textarea"])

/* Атрибуты, которые остаются после очистки; обработчики on*, src и прочее отбрасываются */
const SAFE_ATTRS = new Set(
  (
    "class id style role aria-hidden aria-label focusable xmlns xmlns:xlink version viewbox width height x y x1 y1 x2 y2 cx cy r rx ry fx fy d points " +
    "fill fill-rule fill-opacity stroke stroke-width stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset stroke-opacity " +
    "opacity transform clip-path clip-rule mask offset stop-color stop-opacity gradientunits gradienttransform spreadmethod patternunits patterntransform " +
    "preserveaspectratio color font-size font-family font-weight text-anchor dominant-baseline vector-effect xml:space href xlink:href"
  ).split(" "),
)

const TOKEN_RE = /<!--[\s\S]*?(?:-->|$)|<[!?][^>]*>?|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|</g
const ATTR_RE = /([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

/* Текст: сущности оставляются, одиночные & и угловые скобки экранируются */
const escapeText = (text: string) => text.replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;|#x[0-9a-fA-F]+;)/g, "&amp;").replace(/[<>]/g, (char) => HTML_ESCAPES[char])

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" }

/* Значение атрибута так, как его прочтёт браузер: числовые и основные именованные сущности раскрыты, остальные остаются текстом и при выводе экранируются */
const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (entity, body: string) => {
    if (body[0] !== "#") return NAMED_ENTITIES[body.toLowerCase()] ?? entity
    const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : Number(body.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "\ufffd"
  })

/* Значение атрибута (уже раскрытое) безопасно: ссылки только на свой фрагмент (#id) или http(s), в стилях и url() нет внешних ресурсов и скриптов, CSS-экранирования запрещены */
const safeAttrValue = (tag: string, name: string, value: string): boolean => {
  const v = value.replace(/[\s\u0000-\u001f]/g, "").toLowerCase()
  if (v.includes("javascript:") || v.includes("vbscript:") || v.includes("expression(") || v.includes("@import") || v.includes("\\")) return false
  if (/url\((?!['"]?#)/.test(v)) return false
  if (name === "href" || name === "xlink:href") return v.startsWith("#") || (tag === "a" && /^(https?:|mailto:)/.test(v))
  return true
}

const sanitizeCache = new Map<string, string>()

/* Очистка HTML из данных устройства и конфигурации интерфейса перед {@html}: разметка собирается заново только из разрешённых тегов и атрибутов, одинаково в браузере и при серверном рендере */
export const sanitizeHtml = (html: unknown): string => {
  const source = typeof html === "string" ? html : html == null ? "" : String(html)
  const cached = sanitizeCache.get(source)
  if (cached !== undefined) return cached

  let out = ""
  TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_RE.exec(source))) {
    const [token, closing, rawName, rawAttrs, text] = match
    if (text !== undefined) {
      out += escapeText(text)
      continue
    }
    if (rawName === undefined) {
      if (token === "<") out += "&lt;"
      continue
    }
    const tag = rawName.toLowerCase()
    if (DROP_WITH_CONTENT.has(tag)) {
      if (!closing) {
        const end = source.toLowerCase().indexOf(`</${tag}`, TOKEN_RE.lastIndex)
        TOKEN_RE.lastIndex = end < 0 ? source.length : end
      }
      continue
    }
    if (!SAFE_TAGS.has(tag)) continue
    if (closing) {
      out += `</${rawName}>`
      continue
    }
    let attrs = ""
    ATTR_RE.lastIndex = 0
    let attr: RegExpExecArray | null
    while ((attr = ATTR_RE.exec(rawAttrs))) {
      const name = attr[1].toLowerCase()
      if (!SAFE_ATTRS.has(name)) continue
      const value = decodeEntities(attr[2] ?? attr[3] ?? attr[4] ?? "")
      if (!safeAttrValue(tag, name, value)) continue
      attrs += ` ${attr[1]}="${escapeHtml(value)}"`
    }
    out += `<${rawName}${attrs}${/\/\s*$/.test(rawAttrs) ? " /" : ""}>`
  }

  if (sanitizeCache.size > 500) sanitizeCache.clear()
  sanitizeCache.set(source, out)
  return out
}
