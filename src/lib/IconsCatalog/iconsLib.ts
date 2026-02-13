import fs from "fs"
import { join } from "path"

const scanAllIcons = async () => {
  const dirPath = "src/lib/IconsCatalog"
  const files = fs.readdirSync(dirPath)

  const categories: Record<string, string[]> = {}
  const iconArray: Record<string, string[]> = {}

  files
    .filter((file) => !file.endsWith(".ts") && !file.includes("."))
    .forEach((dir) => {
      if (!iconArray[dir]) {
        iconArray[dir] = []
      }
      const newDirPath = join(dirPath, dir)
      const arrayFiles = fs.readdirSync(newDirPath)

      arrayFiles.forEach((file) => {
        const fullPath = join(newDirPath, file)
        const svgContent = fs.readFileSync(fullPath, "utf8")
        iconArray[dir].push(svgContent)
      })
    })

  files
    .filter((file) => !file.endsWith(".ts") && file.includes("."))
    .forEach((file) => {
      const parts = file.split(".")
      if (parts.length < 3) return

      const category = parts[0]
      const extension = parts[parts.length - 1]

      if (extension !== "svg") return

      const fullPath = join(dirPath, file)
      const svgContent = fs.readFileSync(fullPath, "utf8")

      if (!categories[category]) {
        categories[category] = []
      }

      categories[category].push(svgContent)
    })

  const content = `export const ICONS: [string, string[]][] = [
${Object.entries(categories)
  .map(([category, svgs]) => {
    const svgArray = svgs.map((svg) => JSON.stringify(svg)).join(",\n    ")
    return `  [${JSON.stringify(category)}, [\n    ${svgArray}\n  ]]`
  })
  .join(",\n")}
]

export const ICONS_ARRAY: [string, string[]][] = [
${Object.entries(iconArray)
  .map(([name, svgs]) => {
    const svgArray = svgs.map((svg) => JSON.stringify(svg)).join(",\n    ")
    return `  [${JSON.stringify(name)}, [\n    ${svgArray}\n  ]]`
  })
  .join(",\n")}
]
`

  fs.writeFileSync("src/lib/icons.ts", content)

  console.log("icons.ts создан успешно")
}
scanAllIcons()
