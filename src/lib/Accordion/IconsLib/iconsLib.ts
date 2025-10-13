import fs from 'fs'
import { join } from 'path'

const scanAllIcons = async () => {
  const dirPath = 'src/lib/Accordion/IconsLib'
  const files = fs.readdirSync(dirPath)

  const icons = files.filter((file) => !file.endsWith('.ts'))

  const contents = icons.map((file) => {
    const fullPath = join(dirPath, file)
    return fs.readFileSync(fullPath, 'utf8')
  })

  const entries = contents.map((content) => JSON.stringify(content)).join(',\n  ')

  const content = `export const ICONS: string[] = [
  ${entries}
]`

  fs.writeFileSync('src/lib/Accordion/icons.ts', content)

  console.log('icons.ts создан:', icons)
}

scanAllIcons()
