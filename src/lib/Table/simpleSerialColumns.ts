/* Колонка таблицы Simple Serial - общая для облака и терминала: строка порта как есть, отправленная - зелёным */
import { simpleSerialHtml } from "../protocols/simpleSerial.js"
import type { ITableHeader } from "../types"

/* Строка журнала: текст порта, sent - отправленная команда */
export interface SimpleSerialRow {
  data: string
  sent?: boolean
}

/* Длинная строка видна целиком по клику - окно таблицы переносит её */
export const simpleSerialTableColumns: ITableHeader<SimpleSerialRow>[] = [
  {
    label: { name: "Data" },
    content: [
      {
        type: "text",
        data: {
          key: "data",
          render: ({ data }) => simpleSerialHtml(data),
          html: true,
          accent: (row) => (row.sent ? "green" : undefined),
          truncated: true,
          copy: true,
          modal: true,
        },
      },
    ],
    width: "1fr",
    align: "left",
  },
]
