/* Тема карты по элементу виджета: тёмная ли она (ближайший предок .dark/.light), цвета слоёв из токенов темы и мастер-цвета, стиль подложки; смена темы отслеживается */
import { isDarkTheme, watchTheme } from "../themeWatch"
import { readMapColors, type IMapColors } from "../widgetAccent"
import { mapStyles } from "./mapWrapper/utils"

export const themeState = (el: () => Element | undefined, accent: () => unknown = () => undefined) => {
  let dark = $state(false)
  let colors = $state.raw<IMapColors>(readMapColors(undefined))
  $effect(() => {
    const node = el()
    void accent()
    if (!node) return
    const read = () => {
      dark = isDarkTheme(node)
      colors = readMapColors(node)
    }
    read()
    return watchTheme(read)
  })
  return {
    get dark() {
      return dark
    },
    get colors() {
      return colors
    },
    get style() {
      return mapStyles[dark ? "dark" : "light"]
    },
  }
}
