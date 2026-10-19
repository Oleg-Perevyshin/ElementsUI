/* $lib/Table/columnWidth.ts */
/* Ширина колонки моноширинного текста таблицы в символах: растёт вместе с --table-font-size (знак моноширинного шрифта — 0.6–0.62em, берётся 0.64 с запасом),
   не уже подписи шапки (11px, заглавные, ~0.5rem на знак); 1.5rem — внутренние отступы ячейки, 1px — разделитель колонок */
export const tableMonoWidth = (chars: number, labelChars = 0): string =>
  `max(calc(var(--table-font-size, 13px) * ${+(chars * 0.64).toFixed(2)} + 1.5rem + 1px), calc(${labelChars * 0.5}rem + 1.5rem + 1px))`
