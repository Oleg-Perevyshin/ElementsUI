/* $lib/libIcons/propsIcons.ts — иконки вариантов панелей свойств (IOption.icon): контурные 24×24 в стиле остальных иконок библиотеки */
const svg = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`

export const PROPS_ICONS = {
  /* Выравнивание текста и блока */
  alignLeft: svg("M15 12H3M17 18H3M21 6H3"),
  alignCenter: svg("M17 12H7M19 18H5M21 6H3"),
  alignRight: svg("M21 12H9M21 18H7M21 6H3"),
  alignJustify: svg("M3 12h18M3 18h18M3 6h18"),

  /* Начертание текста */
  bold: svg("M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"),
  italic: svg("M19 4h-9M14 20H5M15 4 9 20"),
  underline: svg("M6 4v6a6 6 0 0 0 12 0V4M4 20h16"),
  highlight: svg("m9 11-6 6v3h9l3-3m7-5-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"),

  /* Стороны и направления */
  arrowUp: svg("m5 12 7-7 7 7M12 19V5"),
  arrowDown: svg("M12 5v14m7-7-7 7-7-7"),
  arrowLeft: svg("m12 19-7-7 7-7m7 7H5"),
  arrowRight: svg("M5 12h14m-7-7 7 7-7 7"),

  /* Привязка по вертикали */
  anchorTop: svg("M5 3h14M18 13l-6-6-6 6M12 7v14"),
  anchorCenter: svg("M3 12h18M8 4l4 4 4-4M8 20l4-4 4 4"),
  anchorBottom: svg("M12 17V3M6 11l6 6 6-6M19 21H5"),

  /* Формы и ориентация */
  square: svg("M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"),
  circle: svg("M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"),
  toggleHorizontal: svg("M8 5h8a7 7 0 0 1 0 14H8A7 7 0 0 1 8 5zm8 4a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"),
  toggleVertical: svg("M5 8a7 7 0 0 1 14 0v8a7 7 0 0 1-14 0zm7-3a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"),
  checkbox: svg("M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm4 9 2 2 4-4"),

  /* Слайдер и разделитель */
  sliderSingle: svg("M3 12h2m6 0h10M8 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"),
  sliderRange: svg("M3 12h1m6 0h4m6 0h1M7 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zm10 0a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"),
  dividerLine: svg("M3 12h18"),
  dividerSpace: svg("M4 6v12M20 6v12M8 12h8"),

  /* Вписывание изображения */
  fitCover: svg("M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"),
  fitContain: svg("M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m8 0v-3a2 2 0 0 1 2-2h3"),

  /* Файлы */
  file: svg("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6"),
  image: svg("M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm4 6h.01M21 15l-5-5L5 21"),

  /* Настройки ячеек и полей */
  sort: svg("m3 16 4 4 4-4M7 20V4m14 4-4-4-4 4m4-4v16"),
  copy: svg("M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"),
  ellipsis: svg("M5 12h.01M12 12h.01M19 12h.01"),
  tooltip: svg("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"),
  modal: svg("M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM2 9h20"),
  lock: svg("M7 11V7a5 5 0 0 1 10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"),
}
