/* $lib/IconsCatalog/iconsLib.ts - сборка icons.ts из файлов каталога: «категория.имя.svg» (Tabler Icons, MIT) и папки наборов состояний (battery, bulb, propeller). Запуск: npm run UpdateIconsLib */
import fs from "fs"
import { join } from "path"

/* Порядок 12 категорий по 16 иконок (матрица 4×3 в пикере, в клетке сетка 4×4): темы и подсистемы устройства для заголовков аккордеонов, от простого оборудования к сложному, настройки и данные в конце */
const CATEGORY_ORDER = ["power", "electronics", "network", "sensors", "climate", "light", "industry", "transport", "space", "media", "home", "settings"]

const dirPath = "src/lib/IconsCatalog"
const files = fs.readdirSync(dirPath).sort()

/* Наборы состояний: папка - один набор иконок, которые виджет переключает по значению */
const stateSets: [string, string[]][] = files
  .filter((file) => !file.includes("."))
  .map((dir) => [
    dir,
    fs
      .readdirSync(join(dirPath, dir))
      .sort()
      .map((file) => fs.readFileSync(join(dirPath, dir, file), "utf8").trim()),
  ])

const categories = new Map<string, { names: string[]; svgs: string[] }>()
for (const file of files) {
  const parts = file.split(".")
  if (parts.length !== 3 || parts[2] !== "svg") continue
  const [category, name] = parts
  if (!CATEGORY_ORDER.includes(category)) throw new Error(`Категория ${category} не указана в CATEGORY_ORDER`)
  const entry = categories.get(category) ?? { names: [], svgs: [] }
  entry.names.push(name)
  entry.svgs.push(fs.readFileSync(join(dirPath, file), "utf8").trim())
  categories.set(category, entry)
}
const ordered = CATEGORY_ORDER.filter((category) => categories.has(category)).map((category) => [category, categories.get(category)!] as const)

const content = `/* $lib/icons.ts - собран из IconsCatalog скриптом npm run UpdateIconsLib, вручную не править */
/* Иконки по категориям: [категория, SVG[]], порядок категорий - CATEGORY_ORDER в iconsLib.ts */
export const ICONS: [string, string[]][] = ${JSON.stringify(
  ordered.map(([category, entry]) => [category, entry.svgs]),
  null,
  2,
)}

/* Имена иконок (Tabler) в том же порядке, что и в ICONS: для поиска в пикере и подписей на витрине */
export const ICON_NAMES: Record<string, string[]> = ${JSON.stringify(Object.fromEntries(ordered.map(([category, entry]) => [category, entry.names])), null, 2)}

/* Наборы состояний: [набор, SVG[]] */
export const ICONS_ARRAY: [string, string[]][] = ${JSON.stringify(stateSets, null, 2)}
`

fs.writeFileSync("src/lib/icons.ts", content)
console.log(
  `icons.ts создан: ${ordered.reduce((sum, [, entry]) => sum + entry.svgs.length, 0)} иконок в ${ordered.length} категориях, наборов состояний ${stateSets.length}`,
)
