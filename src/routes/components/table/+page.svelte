<script lang="ts">
  import { Button, Modal, type ITableHeader, type ITableProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Table from "$lib/Table/Table.svelte"
  import TableProps from "$lib/Table/TableProps.svelte"
  import { updateComponent, type IOption, type ITableButton } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { formatObjectToString, TableColumns } from "../../common"

  let tableComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Table",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Label", class: "text-center" },
      dataBuffer: { bufferSize: 10, visibleRows: 5, logger: false },
      header: [
        {
          label: { name: "ID" },
          width: "30%",
          align: "left",
          content: [
            { type: "select", data: { key: "id-S" } },
            {
              type: "button",
              data: {
                name: "send",
                class: "bg-blue",
                eventHandler: { Header: "SET", Argument: "Save", Variables: ["id-S"] },
              },
            },
            { type: "text", data: { key: "id", sortable: true, truncated: false, copy: false } },
          ],
        } as ITableHeader<any>,
        {
          label: { name: "Device" },
          width: "20%",

          align: "left",
          disableSelect: true,
          content: [
            {
              type: "image",
              data: { width: "0rem", height: "0rem" },
            },
            {
              type: "text",
              data: {
                key: "device",
                truncated: true,
                copy: false,
                modal: true,
              },
            },
          ],
        } as ITableHeader<any>,
        {
          label: { name: "Действия" },
          width: "20%",
          content: [
            {
              type: "button",
              data: {
                name: "send",
                class: "bg-blue",
                eventHandler: { Header: "SET", Argument: "Save", Variables: ["id-S"] },
              },
            },
          ],
          align: "left",
        } as ITableHeader<any>,
        {
          label: { name: "Индикатор прогресса" },
          width: "30%",
          align: "left",
          disableSelect: true,
          content: [
            {
              type: "progressBar",
              data: { key: "progress", minNum: 0, maxNum: 100, units: "%" },
            },
          ],
        } as ITableHeader<any>,
      ],
      body: [
        {
          "id-S": [
            { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
            { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
            { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
            { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
          ],
          id: "Value of id5",
          device: "Value of device",
          progress: 1000,
        },
        {
          "id-S": [
            { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
            { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
            { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
            { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
          ],
          id: "Value of id2",
          device: "Value of device",
          buttons: [],
          progress: 10,
        },
      ],
      footer: "",
      autoscroll: true,
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let body: any | null = $state(null)
  let intervalId: any | null = null

  const generateStashingData = (): { "id-S": string; device: string; buttons: ITableButton<object>[] }[] => {
    return [
      {
        "id-S": `Value of id ${Math.floor(Math.random() * 10)}`,
        device: `Value of device ${Math.floor(Math.random() * 10)}`,
        buttons: [],
      },
      // {
      //   id: `Value of id ${Math.floor(Math.random() * 10)}`,
      //   device: `Value of device ${Math.floor(Math.random() * 10)}`,
      // },
    ]
  }

  let tableRef: any = $state(null)

  $effect(() => {
    if (!(tableComponent.properties as ITableProps<object>).dataBuffer?.stashData && tableRef) {
      tableRef.clearBuffer()
    }
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Table
${formatObjectToString(tableComponent.properties as ITableProps<object>)} 
  onClick={() => {}}
/>`)

  interface ITableRow {
    id: string
    imageUrl: string
    name: string
    status: "online" | "offline"
    lastActive: string
    action?: IOption[]
  }
  const columns: ITableHeader<ITableRow>[] = [
    { label: { name: "ID" }, content: [{ type: "text", data: { key: "id", sortable: true } }], width: "5%", align: "center" },
    {
      label: { name: "Image" },
      content: [{ type: "image", data: { src: (row: ITableRow) => row.imageUrl, alt: "Image", width: "5rem", height: "5rem" } }],
      width: "20%",
    },
    { label: { name: "Name" }, content: [{ type: "text", data: { key: "name", sortable: true } }], width: "12%" },
    {
      label: { name: "Status" },
      content: [
        {
          type: "text",
          data: {
            key: "status",
            truncated: true,
            formatting: (text) => {
              if (text === "online") {
                return "1"
              } else return "2"
            },
          },
        },
      ],
      width: "10%",
    },
    {
      label: { name: "Last Active" },
      content: [{ type: "text", data: { key: "lastActive", sortable: true, truncated: true, copy: true, modal: true } }],
      width: "1fr",
    },
    {
      label: { name: "Actions" },
      content: [{ type: "select", data: { key: "action", keyCol: "" } }],
      width: "1fr",
      align: "left",
    },
  ]
  const rows: ITableRow[] = [
    {
      id: "# 1",
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyBiYXNlUHJvZmlsZT0iZnVsbCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTIxIiBoZWlnaHQ9IjQ3NyI+DQo8ZGVmcz4NCjxzdHlsZT5jaXJjbGUscGF0aCxwb2x5bGluZXtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmR9PC9zdHlsZT4NCjwvZGVmcz4NCjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzc3NyIgc3Ryb2tlLXdpZHRoPSIxMCIgZD0iTTExNi42MyAxODguNjJsODMgNTIiLz4NCjxjaXJjbGUgY3g9Ijg0LjgzIiBjeT0iMTY4LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM3NzciIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik00MDkuMDMgMzgwLjAzbC04My01MiIvPg0KPGNpcmNsZSBjeD0iNDQwLjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik0xMTIuMDMgMzc5LjAzbDgzLTUyTTI2Mi4wMyAyMDQuMDN2LTg4Ii8+DQo8Y2lyY2xlIGN4PSIyNjEuMzMiIGN5PSIyODQuMzMiIHI9Ijc4LjMzIiBmaWxsPSIjZmZmIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTUiLz4NCjxjaXJjbGUgY3g9Ijc2LjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8Y2lyY2xlIGN4PSIyNjAuODMiIGN5PSI3Ni44MyIgcj0iMzYuODMiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzU5RiIgc3Ryb2tlLXdpZHRoPSIxMCIvPg0KPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIiBkPSJNNDY1IDM0MEM1MTMgMTQyIDMyOSA3OSAzMjkgNzlNNDI3IDMzMWM0MC0xNjItMTEwLTIxMy0xMTAtMjEzTTM4OSAzMTljMzEtMTI1LTg2LTE2NS04Ni0xNjUiLz4NCjwvc3ZnPg==",
      name: "Device A",
      status: "online",
      lastActive: String(new Date()),
      action: [
        { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
        { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
        { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
        { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
      ],
    },
    {
      id: "# 2",
      imageUrl:
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIg0KICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCINCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIg0KICAgaWQ9InN2ZzgiDQogICB2ZXJzaW9uPSIxLjEiDQogICB2aWV3Qm94PSIwIDAgMTMuMjI5MTY2IDEzLjIyOTE2NiINCiAgIGhlaWdodD0iMTMuMjI5MTY2bW0iDQogICB3aWR0aD0iMTMuMjI5MTY2bW0iDQogICBzb2RpcG9kaTpkb2NuYW1lPSJNdWx0aSBTd2l0Y2ggdjEyLnN2ZyINCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMSByMTUzNzEiDQogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9IkQ6XGFud29ya1zQmNC60L7QvdC60Lgg0YPRgdGC0YDQvtC50YHRgtCyXE11bHRpIFN3aXRjaCB2MTEucG5nIg0KICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuNDAwMDEiPg0KICA8c29kaXBvZGk6bmFtZWR2aWV3DQogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiINCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiDQogICAgIGJvcmRlcm9wYWNpdHk9IjEiDQogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiDQogICAgIGdyaWR0b2xlcmFuY2U9IjEwIg0KICAgICBndWlkZXRvbGVyYW5jZT0iMTAiDQogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIg0KICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIg0KICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE5MjAiDQogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciDQogICAgIGlkPSJuYW1lZHZpZXcxOSINCiAgICAgc2hvd2dyaWQ9ImZhbHNlIg0KICAgICBpbmtzY2FwZTp6b29tPSIxMy4zNTAxNzciDQogICAgIGlua3NjYXBlOmN4PSI3LjkyNjAxMDYiDQogICAgIGlua3NjYXBlOmN5PSIyMi41NjgwMjIiDQogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCINCiAgICAgaW5rc2NhcGU6d2luZG93LXk9Ii04Ig0KICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIg0KICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc4IiAvPg0KICA8ZGVmcw0KICAgICBpZD0iZGVmczIiPg0KICAgIDxtYXJrZXINCiAgICAgICBpbmtzY2FwZTpzdG9ja2lkPSJFbXB0eVRyaWFuZ2xlT3V0TSINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgcmVmWT0iMC4wIg0KICAgICAgIHJlZlg9IjAuMCINCiAgICAgICBpZD0ibWFya2VyNTQ3NSINCiAgICAgICBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZSINCiAgICAgICBpbmtzY2FwZTppc3N0b2NrPSJ0cnVlIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDU0NzMiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6I2ZmZmZmZjtzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPG1hcmtlcg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgc3R5bGU9Im92ZXJmbG93OnZpc2libGUiDQogICAgICAgaWQ9Im1hcmtlcjUxMTEiDQogICAgICAgcmVmWD0iMC4wIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iPg0KICAgICAgPHBhdGgNCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC40KSB0cmFuc2xhdGUoLTQuNSwwKSINCiAgICAgICAgIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtmaWxsOiM3Nzc3Nzc7c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjFwdDtzdHJva2Utb3BhY2l0eToxO2ZpbGwtb3BhY2l0eToxIg0KICAgICAgICAgZD0iTSA1Ljc3LDAuMCBMIC0yLjg4LDUuMCBMIC0yLjg4LC01LjAgTCA1Ljc3LDAuMCB6ICINCiAgICAgICAgIGlkPSJwYXRoNTEwOSIgLz4NCiAgICA8L21hcmtlcj4NCiAgICA8bWFya2VyDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iDQogICAgICAgb3JpZW50PSJhdXRvIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICByZWZYPSIwLjAiDQogICAgICAgaWQ9IkVtcHR5VHJpYW5nbGVPdXRNIg0KICAgICAgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlIg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgaW5rc2NhcGU6Y29sbGVjdD0iYWx3YXlzIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDQ5NzYiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6Izc3Nzc3NztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjE7ZmlsbC1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPGxpbmVhckdyYWRpZW50DQogICAgICAgaWQ9ImEiPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZDllYzAwIg0KICAgICAgICAgb2Zmc2V0PSIwIiAvPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTIiDQogICAgICAgICBzdG9wLW9wYWNpdHk9IjAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZjdmZjk4Ig0KICAgICAgICAgb2Zmc2V0PSIxIiAvPg0KICAgIDwvbGluZWFyR3JhZGllbnQ+DQogIDwvZGVmcz4NCiAgPG1ldGFkYXRhDQogICAgIGlkPSJtZXRhZGF0YTUiPg0KICAgIDxyZGY6UkRGPg0KICAgICAgPGNjOldvcmsNCiAgICAgICAgIHJkZjphYm91dD0iIj4NCiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+DQogICAgICAgIDxkYzp0eXBlDQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+DQogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPg0KICAgICAgPC9jYzpXb3JrPg0KICAgIDwvcmRmOlJERj4NCiAgPC9tZXRhZGF0YT4NCiAgPGNpcmNsZQ0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC43OTM3NTAwNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTtwYWludC1vcmRlcjpzdHJva2UgZmlsbCBtYXJrZXJzIg0KICAgICBpZD0icGF0aDQ1MTYiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgY3k9IjYuNjE0NTgzIg0KICAgICByPSI2LjIxNzcwODYiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiIC8+DQogIDxjaXJjbGUNCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC4zOTk5OSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC4zOTk5OSINCiAgICAgcj0iNi41NDg0Mzc2Ig0KICAgICBjeT0iNi42MTQ1ODMiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgaWQ9ImNpcmNsZTQ0OTUiDQogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTojNTU1NTU1O3N0cm9rZS13aWR0aDowLjEzMjI5MTY3O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiIC8+DQogIDxwYXRoDQogICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNlMDY2NjY7c3Ryb2tlLXdpZHRoOjAuNjYxNDU4Mzc7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiDQogICAgIGQ9Ik0gNi41NjgyNjEsMy43NjYxNzA2IFYgNi42MDQyMzQyIg0KICAgICBpZD0icGF0aDQ1MzEtOSINCiAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC40MDAwMSIgLz4NCiAgPHBhdGgNCiAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC42NjE0NTgzNztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSINCiAgICAgZD0iTSA5LjQ1NDY5Nyw2LjYwNDIzNDIgSCA2LjU2ODI2MSINCiAgICAgaWQ9InBhdGg0NTM3Ig0KICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjQwMDAxIg0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjQwMDAxIiAvPg0KICA8cmVjdA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2UwNjY2NjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC41MjkxNjY2ODtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6c3Ryb2tlIGZpbGwgbWFya2VycyINCiAgICAgaWQ9InJlY3Q0NTIyIg0KICAgICB3aWR0aD0iMS4zNjc0OTEyIg0KICAgICBoZWlnaHQ9IjEuMzY3NDkxMiINCiAgICAgeD0iOC44MzE3MjUxIg0KICAgICB5PSI4LjkxMTA0MTMiDQogICAgIHJ4PSIwLjIzODIzNzExIg0KICAgICByeT0iMC4yMzgyMzcxMSIgLz4NCiAgPHJlY3QNCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJyZWN0NTk4MiINCiAgICAgd2lkdGg9IjEuNTkxNzE0NCINCiAgICAgaGVpZ2h0PSIxLjU5MTcxNDQiDQogICAgIHg9IjIuODYwNDYxNyINCiAgICAgeT0iMi45MTk3MzI2Ig0KICAgICByeD0iMC4yOTQyOTI5Ig0KICAgICByeT0iMC4yOTQyOTI5IiAvPg0KICA8cGF0aA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC4yNjQ1ODMzNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTttYXJrZXItZW5kOnVybCgjRW1wdHlUcmlhbmdsZU91dE0pO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJjaXJjbGU0ODExIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjM5OTk5Ig0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjM5OTk5Ig0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIHNvZGlwb2RpOmN4PSI2LjYxNDU4MyINCiAgICAgc29kaXBvZGk6Y3k9IjYuNjE0NTgzIg0KICAgICBzb2RpcG9kaTpyeD0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpyeT0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpzdGFydD0iNC4zNDIxMDgxIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOm9wZW49InRydWUiDQogICAgIGQ9Ik0gNS4wMzU5Nzk1LDIuNTQ3OTcwMyBBIDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgOS42ODkyNjAyLDMuNTIwMTIyMSA0LjM2MjI2MTgsNC4zNjIyNjE4IDAgMCAxIDEwLjY5MTIzNyw4LjE2NzA3MTkiIC8+DQogIDxwYXRoDQogICAgIGQ9Im0gLTguMTY2NjMwMSwtMTAuODQ3NDU5IGEgNC4zNjIyNjE4LDQuMzYyMjYxOCAwIDAgMSA0LjYyNTg1ODYsMS4wMDU3MDM5IDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgMC45ODUyNjUxLDQuNjMwMjU1Ig0KICAgICBzb2RpcG9kaTpvcGVuPSJ0cnVlIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOnN0YXJ0PSI0LjM1MjkzODIiDQogICAgIHNvZGlwb2RpOnJ5PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOnJ4PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOmN5PSItNi43NjM5ODkiDQogICAgIHNvZGlwb2RpOmN4PSItNi42MzIxNjAyIg0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlkPSJwYXRoNTEwNyINCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7bWFya2VyLWVuZDp1cmwoI21hcmtlcjUxMTEpO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIHRyYW5zZm9ybT0ic2NhbGUoLTEpIiAvPg0KPC9zdmc+DQo=",
      name: "Device B",
      status: "offline",
      lastActive: String(new Date(Date.now() - 86400000 * 4)),
      action: [
        { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
        { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
        { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
        { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
      ],
    },
  ]
  let modalData = $state({ isOpen: false, rawData: "", formattedData: "" })

  const propsRows = [
    {
      name: "id",
      type: "string",
      default: "crypto.randomUUID()",
      description: "Уникальный идентификатор компонента",
    },
    {
      name: "wrapperClass",
      type: "string",
      default: '""',
      description: "Дополнительные CSS-классы для внешней обёртки компонента",
    },
    {
      name: "label",
      type: "{ name?: string; class?: string }",
      default: '{ name: "", class: "" }',
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "body",
      type: "any[] | any | null",
      default: "undefined",
      description:
        "Данные строк таблицы: массив объектов или единичный объект; каждый объект представляет строку с ключами, соответствующими колонкам; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "header",
      type: "ITableHeader<any>[]",
      default: "[]",
      description:
        "Конфигурация колонок: массив объектов с настройками `width` (ширина), `align` (выравнивание), `label` (заголовок), `content` (массив элементов: `text`/`image`/`button`/`select`/`progressBar` с типизированными `data`)",
    },
    {
      name: "footer",
      type: "string",
      default: '""',
      description: "Текст сводной информации, отображаемый в нижней панели таблицы",
    },
    {
      name: "dataBuffer",
      type: "{ stashData?: boolean; bufferSize?: number; clearButton?: boolean; clearClass?: string; logger?: boolean; visibleRows?: number }",
      default: '{ stashData: false, bufferSize: 10, clearButton: false, clearClass: "", logger: false, visibleRows: 5 }',
      description:
        "Настройки буферизации: `stashData` — включение внутреннего буфера, `bufferSize` — максимальное количество хранимых строк, `clearButton` — показать кнопку очистки, `logger` — режим логов (добавление строк сверху), `visibleRows` — количество строк для расчёта высоты контейнера",
    },
    {
      name: "outline",
      type: "boolean",
      default: "false",
      description: "Режим отображения границ: при `true` добавляет видимые разделители между ячейками и колонками",
    },
    {
      name: "cursor",
      type: "any | null",
      default: "null",
      description: "Курсор пагинации для бесконечной прокрутки: передаётся в `getData` при достижении конца списка; при `null` загрузка новых данных отключена",
    },
    {
      name: "loader",
      type: "Readable<boolean> | null",
      default: "undefined",
      description: "Svelte store с состоянием загрузки: при `true` блокирует повторные запросы `getData` во время получения данных",
    },
    {
      name: "autoscroll",
      type: "boolean",
      default: "false",
      description: "Автоматическая прокрутка: при `true` таблица всегда прокручивается к последней строке при добавлении новых данных",
    },
    {
      name: "getData",
      type: "() => void",
      default: "() => {}",
      description: "Callback-функция для загрузки следующей порции данных: вызывается при достижении конца прокрутки (если заданы `cursor` и `loader`)",
    },
    {
      name: "onClick",
      type: "(handler: { Value: string; Variables: string[] }) => void",
      default: "undefined",
      description:
        "Callback-функция для обработки кликов по кнопкам в ячейках: передаёт объект с сериализованными значениями строки (`Value`) и списком запрошенных переменных (`Variables`)",
    },
  ]

  onMount(() => {
    body = generateStashingData()

    intervalId = setInterval(() => {
      body = generateStashingData()
    }, 1000)
  })

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId)
  })
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="h-60">
      <Table bind:this={tableRef} {...tableComponent.properties as ITableProps<object>} body={(tableComponent.properties as ITableProps<object>).body} />
    </div>
  {/snippet}

  {#snippet componentProps()}
    <TableProps
      component={tableComponent as UIComponent & { properties: Partial<ITableProps<object>> }}
      onPropertyChange={(updates) => (tableComponent = updateComponent(tableComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <Table
      wrapperClass="h-71"
      label={{ name: "Devices" }}
      header={columns}
      body={rows}
      onClick={(eventHandler) => console.log(eventHandler)}
      footer={`rows: ${rows.length}`}
    />
    <Modal isOpen={modalData.isOpen} title="Full data">
      {#snippet main()}
        {@html modalData.formattedData}
      {/snippet}
      {#snippet footer()}
        <Button
          content={{ name: "Copy" }}
          wrapperClass="w-20 bg-pink"
          onClick={() => {
            navigator.clipboard.writeText(modalData.rawData)
            modalData.isOpen = false
          }}
        />
      {/snippet}
    </Modal>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={propsRows} outline />
  {/snippet}</ComponentExample
>
