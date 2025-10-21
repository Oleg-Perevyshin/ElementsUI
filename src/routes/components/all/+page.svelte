<!-- src/routes/test/+page.svelte -->
<script lang="ts">
  import * as UI from '$lib'
  import type { ITableHeader } from '$lib/types'
  import GitHub from '../../../appIcons/GitHub.svelte'
  import IconGripHorizontalUp from '../../../appIcons/IconGripHorizontalUp.svelte'
  import IconGripHorizontalDown from '../../../appIcons/IconGripHorizontalDown.svelte'
  import IconGripHorizontalDual from '../../../appIcons/IconGripHorizontalDual.svelte'
  import IconGripVerticalLeft from '../../../appIcons/IconGripVerticalLeft.svelte'
  import IconGripVerticalRight from '../../../appIcons/IconGripVerticalRight.svelte'
  import IconGripVerticalDual from '../../../appIcons/IconGripVerticalDual.svelte'

  const componentMap = {
    Button: { component: UI.Button },
    ColorPicker: { component: UI.ColorPicker },
    Accordion: { component: null },
    Input: { component: UI.Input },
    ProgressBar: { component: UI.ProgressBar },
    Select: { component: UI.Select },
    Slider: { component: UI.Slider },
    Switch: { component: UI.Switch },
    TextField: { component: UI.TextField },
    Graph: { component: UI.Graph },
    Table: { component: UI.Table },
  }

  /* Интерфейс для строки таблицы (в таблицу передается желаемый массив объектов) */
  interface ITableRow {
    id: string
    imageUrl: string
    name: string
    status: 'online' | 'offline'
    lastActive: string
    action?: string
  }
  const columns: ITableHeader<ITableRow>[] = [
    { label: { name: 'ID' }, key: 'id', width: '5%', sortable: true, align: 'center' },
    {
      label: { name: 'Image' },
      key: 'imageUrl',
      width: '20%',
      image: {
        src: (row: ITableRow) => row.imageUrl,
        alt: 'Image',
        width: '5rem',
        height: '5rem',
      },
    },
    { label: { name: 'Name' }, key: 'name', width: '12%', sortable: true },
    {
      label: { name: 'Status' },
      key: 'status',
      width: '10%',
      overflow: {
        truncated: true,
        formatting: (text) => {
          if (text === 'online') {
            return '1'
          } else return '2'
        },
      },
    },
    {
      label: { name: 'Last Active' },
      key: 'lastActive',
      width: 'auto',
      sortable: true,
      overflow: { truncated: true, copy: true, modal: true },
    },
    {
      label: { name: 'Actions' },
      key: 'action',
      width: '15%',
      align: 'center',
      buttons: [
        { name: 'Action 1 (id)', class: 'bg-blue', eventHandler: { Header: 'SET', Argument: 'save', Variables: ['name'] } },
        { name: 'Action 2 (name)', class: 'bg-green', onClick: (row) => console.log(row.name) },
      ],
    },
  ]
  const rows: ITableRow[] = [
    {
      id: '# 1',
      imageUrl:
        'data:image/svg+xml;base64,PHN2ZyBiYXNlUHJvZmlsZT0iZnVsbCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTIxIiBoZWlnaHQ9IjQ3NyI+DQo8ZGVmcz4NCjxzdHlsZT5jaXJjbGUscGF0aCxwb2x5bGluZXtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmR9PC9zdHlsZT4NCjwvZGVmcz4NCjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzc3NyIgc3Ryb2tlLXdpZHRoPSIxMCIgZD0iTTExNi42MyAxODguNjJsODMgNTIiLz4NCjxjaXJjbGUgY3g9Ijg0LjgzIiBjeT0iMTY4LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM3NzciIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik00MDkuMDMgMzgwLjAzbC04My01MiIvPg0KPGNpcmNsZSBjeD0iNDQwLjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik0xMTIuMDMgMzc5LjAzbDgzLTUyTTI2Mi4wMyAyMDQuMDN2LTg4Ii8+DQo8Y2lyY2xlIGN4PSIyNjEuMzMiIGN5PSIyODQuMzMiIHI9Ijc4LjMzIiBmaWxsPSIjZmZmIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTUiLz4NCjxjaXJjbGUgY3g9Ijc2LjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8Y2lyY2xlIGN4PSIyNjAuODMiIGN5PSI3Ni44MyIgcj0iMzYuODMiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzU5RiIgc3Ryb2tlLXdpZHRoPSIxMCIvPg0KPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIiBkPSJNNDY1IDM0MEM1MTMgMTQyIDMyOSA3OSAzMjkgNzlNNDI3IDMzMWM0MC0xNjItMTEwLTIxMy0xMTAtMjEzTTM4OSAzMTljMzEtMTI1LTg2LTE2NS04Ni0xNjUiLz4NCjwvc3ZnPg==',
      name: 'Device A',
      status: 'online',
      lastActive: String(new Date()),
    },
    {
      id: '# 2',
      imageUrl:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIg0KICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCINCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIg0KICAgaWQ9InN2ZzgiDQogICB2ZXJzaW9uPSIxLjEiDQogICB2aWV3Qm94PSIwIDAgMTMuMjI5MTY2IDEzLjIyOTE2NiINCiAgIGhlaWdodD0iMTMuMjI5MTY2bW0iDQogICB3aWR0aD0iMTMuMjI5MTY2bW0iDQogICBzb2RpcG9kaTpkb2NuYW1lPSJNdWx0aSBTd2l0Y2ggdjEyLnN2ZyINCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMSByMTUzNzEiDQogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9IkQ6XGFud29ya1zQmNC60L7QvdC60Lgg0YPRgdGC0YDQvtC50YHRgtCyXE11bHRpIFN3aXRjaCB2MTEucG5nIg0KICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuNDAwMDEiPg0KICA8c29kaXBvZGk6bmFtZWR2aWV3DQogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiINCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiDQogICAgIGJvcmRlcm9wYWNpdHk9IjEiDQogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiDQogICAgIGdyaWR0b2xlcmFuY2U9IjEwIg0KICAgICBndWlkZXRvbGVyYW5jZT0iMTAiDQogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIg0KICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIg0KICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE5MjAiDQogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciDQogICAgIGlkPSJuYW1lZHZpZXcxOSINCiAgICAgc2hvd2dyaWQ9ImZhbHNlIg0KICAgICBpbmtzY2FwZTp6b29tPSIxMy4zNTAxNzciDQogICAgIGlua3NjYXBlOmN4PSI3LjkyNjAxMDYiDQogICAgIGlua3NjYXBlOmN5PSIyMi41NjgwMjIiDQogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCINCiAgICAgaW5rc2NhcGU6d2luZG93LXk9Ii04Ig0KICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIg0KICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc4IiAvPg0KICA8ZGVmcw0KICAgICBpZD0iZGVmczIiPg0KICAgIDxtYXJrZXINCiAgICAgICBpbmtzY2FwZTpzdG9ja2lkPSJFbXB0eVRyaWFuZ2xlT3V0TSINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgcmVmWT0iMC4wIg0KICAgICAgIHJlZlg9IjAuMCINCiAgICAgICBpZD0ibWFya2VyNTQ3NSINCiAgICAgICBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZSINCiAgICAgICBpbmtzY2FwZTppc3N0b2NrPSJ0cnVlIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDU0NzMiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6I2ZmZmZmZjtzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPG1hcmtlcg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgc3R5bGU9Im92ZXJmbG93OnZpc2libGUiDQogICAgICAgaWQ9Im1hcmtlcjUxMTEiDQogICAgICAgcmVmWD0iMC4wIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iPg0KICAgICAgPHBhdGgNCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC40KSB0cmFuc2xhdGUoLTQuNSwwKSINCiAgICAgICAgIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtmaWxsOiM3Nzc3Nzc7c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjFwdDtzdHJva2Utb3BhY2l0eToxO2ZpbGwtb3BhY2l0eToxIg0KICAgICAgICAgZD0iTSA1Ljc3LDAuMCBMIC0yLjg4LDUuMCBMIC0yLjg4LC01LjAgTCA1Ljc3LDAuMCB6ICINCiAgICAgICAgIGlkPSJwYXRoNTEwOSIgLz4NCiAgICA8L21hcmtlcj4NCiAgICA8bWFya2VyDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iDQogICAgICAgb3JpZW50PSJhdXRvIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICByZWZYPSIwLjAiDQogICAgICAgaWQ9IkVtcHR5VHJpYW5nbGVPdXRNIg0KICAgICAgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlIg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgaW5rc2NhcGU6Y29sbGVjdD0iYWx3YXlzIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDQ5NzYiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6Izc3Nzc3NztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjE7ZmlsbC1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPGxpbmVhckdyYWRpZW50DQogICAgICAgaWQ9ImEiPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZDllYzAwIg0KICAgICAgICAgb2Zmc2V0PSIwIiAvPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTIiDQogICAgICAgICBzdG9wLW9wYWNpdHk9IjAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZjdmZjk4Ig0KICAgICAgICAgb2Zmc2V0PSIxIiAvPg0KICAgIDwvbGluZWFyR3JhZGllbnQ+DQogIDwvZGVmcz4NCiAgPG1ldGFkYXRhDQogICAgIGlkPSJtZXRhZGF0YTUiPg0KICAgIDxyZGY6UkRGPg0KICAgICAgPGNjOldvcmsNCiAgICAgICAgIHJkZjphYm91dD0iIj4NCiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+DQogICAgICAgIDxkYzp0eXBlDQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+DQogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPg0KICAgICAgPC9jYzpXb3JrPg0KICAgIDwvcmRmOlJERj4NCiAgPC9tZXRhZGF0YT4NCiAgPGNpcmNsZQ0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC43OTM3NTAwNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTtwYWludC1vcmRlcjpzdHJva2UgZmlsbCBtYXJrZXJzIg0KICAgICBpZD0icGF0aDQ1MTYiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgY3k9IjYuNjE0NTgzIg0KICAgICByPSI2LjIxNzcwODYiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiIC8+DQogIDxjaXJjbGUNCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC4zOTk5OSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC4zOTk5OSINCiAgICAgcj0iNi41NDg0Mzc2Ig0KICAgICBjeT0iNi42MTQ1ODMiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgaWQ9ImNpcmNsZTQ0OTUiDQogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTojNTU1NTU1O3N0cm9rZS13aWR0aDowLjEzMjI5MTY3O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiIC8+DQogIDxwYXRoDQogICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNlMDY2NjY7c3Ryb2tlLXdpZHRoOjAuNjYxNDU4Mzc7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiDQogICAgIGQ9Ik0gNi41NjgyNjEsMy43NjYxNzA2IFYgNi42MDQyMzQyIg0KICAgICBpZD0icGF0aDQ1MzEtOSINCiAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC40MDAwMSIgLz4NCiAgPHBhdGgNCiAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC42NjE0NTgzNztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSINCiAgICAgZD0iTSA5LjQ1NDY5Nyw2LjYwNDIzNDIgSCA2LjU2ODI2MSINCiAgICAgaWQ9InBhdGg0NTM3Ig0KICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjQwMDAxIg0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjQwMDAxIiAvPg0KICA8cmVjdA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2UwNjY2NjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC41MjkxNjY2ODtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6c3Ryb2tlIGZpbGwgbWFya2VycyINCiAgICAgaWQ9InJlY3Q0NTIyIg0KICAgICB3aWR0aD0iMS4zNjc0OTEyIg0KICAgICBoZWlnaHQ9IjEuMzY3NDkxMiINCiAgICAgeD0iOC44MzE3MjUxIg0KICAgICB5PSI4LjkxMTA0MTMiDQogICAgIHJ4PSIwLjIzODIzNzExIg0KICAgICByeT0iMC4yMzgyMzcxMSIgLz4NCiAgPHJlY3QNCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJyZWN0NTk4MiINCiAgICAgd2lkdGg9IjEuNTkxNzE0NCINCiAgICAgaGVpZ2h0PSIxLjU5MTcxNDQiDQogICAgIHg9IjIuODYwNDYxNyINCiAgICAgeT0iMi45MTk3MzI2Ig0KICAgICByeD0iMC4yOTQyOTI5Ig0KICAgICByeT0iMC4yOTQyOTI5IiAvPg0KICA8cGF0aA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC4yNjQ1ODMzNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTttYXJrZXItZW5kOnVybCgjRW1wdHlUcmlhbmdsZU91dE0pO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJjaXJjbGU0ODExIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjM5OTk5Ig0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjM5OTk5Ig0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIHNvZGlwb2RpOmN4PSI2LjYxNDU4MyINCiAgICAgc29kaXBvZGk6Y3k9IjYuNjE0NTgzIg0KICAgICBzb2RpcG9kaTpyeD0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpyeT0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpzdGFydD0iNC4zNDIxMDgxIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOm9wZW49InRydWUiDQogICAgIGQ9Ik0gNS4wMzU5Nzk1LDIuNTQ3OTcwMyBBIDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgOS42ODkyNjAyLDMuNTIwMTIyMSA0LjM2MjI2MTgsNC4zNjIyNjE4IDAgMCAxIDEwLjY5MTIzNyw4LjE2NzA3MTkiIC8+DQogIDxwYXRoDQogICAgIGQ9Im0gLTguMTY2NjMwMSwtMTAuODQ3NDU5IGEgNC4zNjIyNjE4LDQuMzYyMjYxOCAwIDAgMSA0LjYyNTg1ODYsMS4wMDU3MDM5IDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgMC45ODUyNjUxLDQuNjMwMjU1Ig0KICAgICBzb2RpcG9kaTpvcGVuPSJ0cnVlIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOnN0YXJ0PSI0LjM1MjkzODIiDQogICAgIHNvZGlwb2RpOnJ5PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOnJ4PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOmN5PSItNi43NjM5ODkiDQogICAgIHNvZGlwb2RpOmN4PSItNi42MzIxNjAyIg0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlkPSJwYXRoNTEwNyINCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7bWFya2VyLWVuZDp1cmwoI21hcmtlcjUxMTEpO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIHRyYW5zZm9ybT0ic2NhbGUoLTEpIiAvPg0KPC9zdmc+DQo=',
      name: 'Device B',
      status: 'offline',
      lastActive: String(new Date(Date.now() - 86400000 * 4)),
    },
  ]

  const dataForGraph = [
    { name: 'Roll', value: 0 },
    { name: 'Pitch', value: 0 },
    { name: 'Yay', value: 0 },
  ]

  let inputString: string = $state('String Data')
  let inputNumber: number = $state(7)
  let progressBarValue = $state(40)
  let selectOption = $state()
  let COMPONENT_OPTIONS = Object.keys(componentMap).map((name) => ({ id: name, name: name, value: name }))
  let switchValue = $state(1)

  let modalData = $state({ isOpen: false, rawData: '', formattedData: '' })
</script>

<div class="flex h-full flex-col items-center overflow-hidden overflow-y-visible">
  <UI.Modal>{#snippet main()}{/snippet}</UI.Modal>

  <h2>Обзорная страница компонентов</h2>

  <div class="flex w-full flex-col">
    <!-- Компонент ACCORDION -->
    <UI.Accordion label={{ name: 'Accordion' }} isOpen={false} wrapperClass="mb-2">
      <UI.Accordion label={{ name: 'Accordion 1', class: '' }} isOpen={false} outline={true} wrapperClass="col-span-3">
        <h6>Содержимое вложенного Accordion 1</h6>
        <h5>Содержимое вложенного Accordion 1</h5>
        <h4>Содержимое вложенного Accordion 1</h4>
        <h3>Содержимое вложенного Accordion 1</h3>
        <h2>Содержимое вложенного Accordion 1</h2>
        <h1>Содержимое вложенного Accordion 1</h1>
      </UI.Accordion>
      <UI.Accordion label={{ name: 'Accordion 2', class: '' }} isOpen={false} outline={true} wrapperClass="col-span-3">
        <h1>Содержимое вложенного Accordion 2</h1>
        <h2>Содержимое вложенного Accordion 2</h2>
        <h3>Содержимое вложенного Accordion 2</h3>
        <h4>Содержимое вложенного Accordion 2</h4>
        <h5>Содержимое вложенного Accordion 2</h5>
      </UI.Accordion>
      <UI.Accordion label={{ name: 'Accordion 3', class: '' }} isOpen={false} outline={true} wrapperClass="col-span-3">
        <h4>Содержимое вложенного Accordion 3</h4>
        <h3>Содержимое вложенного Accordion 3</h3>
        <h2>Содержимое вложенного Accordion 3</h2>
        <h1>Содержимое вложенного Accordion 3</h1>
      </UI.Accordion>
    </UI.Accordion>

    <!-- Компонент BUTTON -->
    <UI.Accordion label={{ name: 'Button' }} isOpen={false} wrapperClass="mb-2">
      <UI.Button content={{ name: 'Button 1', icon: IconGripHorizontalUp }} componentClass="h-20 bg-gray" />
      <UI.Button content={{ icon: IconGripVerticalLeft }} componentClass="h-9 w-9 bg-red border-none rounded-full" />
      <UI.Button content={{ icon: IconGripVerticalRight }} componentClass="h-15 w-50 bg-blue rounded-full" />
      <UI.Button wrapperClass="w-50" content={{ icon: IconGripVerticalDual }} componentClass="h-10 bg-green rounded-full" />
      <UI.Button content={{ icon: IconGripHorizontalUp }} componentClass="h-15 w-20 rounded-full" />
      <UI.Button content={{ icon: IconGripHorizontalDown }} componentClass="h-15 rounded-full" />
      <UI.Button content={{ icon: IconGripHorizontalDual }} componentClass="h-15 rounded-full" />
      <UI.Button content={{ icon: GitHub }} componentClass="w-15 rounded-full" />
      <UI.Button content={{ name: 'Button 3', info: 'button for send to server' }} componentClass="bg-yellow" />
      <UI.Button content={{ name: 'Button 4' }} componentClass="bg-blue h-12 rounded-xl" />
      <UI.Button content={{ name: 'Button 5' }} componentClass="bg-green" />
      <UI.Button content={{ name: 'Button 6' }} componentClass="bg-purple" />
    </UI.Accordion>

    <!-- Компонент COLOR PICKER -->
    <UI.Accordion label={{ name: 'Color Picker' }} isOpen={false} wrapperClass="mb-2">
      <UI.ColorPicker wrapperClass="!w-100" label={{ name: 'Выбор цвета из палитры' }} value={[186, 25, 255]} />
    </UI.Accordion>

    <!-- Компонент FILE ATTACH -->
    <UI.Accordion label={{ name: 'File Attach' }} isOpen={false} wrapperClass="mb-2">
      <div class="flex w-full flex-row items-start gap-4">
        <UI.FileAttach id={crypto.randomUUID()} label={{ name: 'Выберите файл' }} type="file" />
        <UI.FileAttach id={crypto.randomUUID()} label={{ name: 'Выберите файл' }} type="file" disabled />
        <UI.FileAttach
          id={crypto.randomUUID()}
          label={{ name: 'Выберите изображение' }}
          type="image"
          imageSize={{ height: '10rem', width: '10rem', fitMode: 'contain' }}
        />
        <UI.FileAttach
          id={crypto.randomUUID()}
          label={{ name: 'Выберите изображение' }}
          type="image"
          imageSize={{ height: '10rem', width: '10rem', fitMode: 'cover' }}
        />
        <UI.FileAttach
          id={crypto.randomUUID()}
          label={{ name: 'Выберите изображение' }}
          type="image"
          disabled
          imageSize={{ height: '10rem', width: '10rem', fitMode: 'cover' }}
        />
      </div>
    </UI.Accordion>

    <!-- Компонент GRAPH -->
    <UI.Accordion label={{ name: 'Graph' }} isOpen={false} wrapperClass="mb-2">
      <UI.Graph label={{ name: 'Пример компонента график' }} streamingData={{ data: dataForGraph }} isTest={true} />
    </UI.Accordion>

    <!-- Компонент INPUT -->
    <UI.Accordion label={{ name: 'Input' }} isOpen={false} wrapperClass="mb-2 ">
      <div class="flex w-full flex-col items-center gap-2">
        <UI.Input wrapperClass="!w-60" help={{ copyButton: true, regExp: /^[\w\s-]{4,16}$/ }} bind:value={inputString} type="text" maxlength={20} />
        <UI.Input
          wrapperClass="!w-30 bg-green"
          value={inputNumber}
          type="number"
          maxlength={3}
          number={{ maxNum: 100, minNum: 0, step: 10 }}
          help={{ info: 'Информационная подсказка' }}
          onUpdate={(value) => (inputNumber = value as number)}
        />
        <UI.Input wrapperClass="w-100" bind:value={inputString} type="password" maxlength={20} />
        <UI.Input
          wrapperClass="w-150"
          bind:value={inputString}
          help={{ copyButton: true, info: 'Информационная подсказка. Может быть многострочной, если не вмещается!' }}
          type="text-area"
          maxlength={150}
          textareaRows={2}
        />
        <p>bind:string: {inputString}</p>
        <p>number: {inputNumber}</p>
      </div>
    </UI.Accordion>

    <!-- Компонент PROGRESS BAR -->
    <UI.Accordion label={{ name: 'Progress Bar' }} isOpen={false} wrapperClass="mb-2">
      <UI.ProgressBar value={progressBarValue} wrapperClass="bg-yellow" />
      <div class="flex">
        <UI.Button
          wrapperClass="m-2 !w-10"
          content={{ name: '-' }}
          componentClass="h-10 rounded-full bg-purple"
          onClick={() => (progressBarValue -= 5)}
        />
        <UI.Button
          wrapperClass="m-2 !w-10"
          content={{ name: '+' }}
          componentClass="h-10 rounded-full bg-green"
          onClick={() => (progressBarValue += 5)}
        />
      </div>
    </UI.Accordion>

    <!-- Компонент SELECT -->
    <UI.Accordion label={{ name: 'Select' }} isOpen={false} wrapperClass="mb-2">
      <div class="col-span-10 flex flex-col items-center">
        <UI.Select type="input" label={{ name: 'Компоненты' }} options={COMPONENT_OPTIONS} onUpdate={(option) => (selectOption = option)} />
        <p>{JSON.stringify(selectOption)}</p>
        <UI.Select label={{ name: 'Компоненты' }} options={COMPONENT_OPTIONS} onUpdate={(option) => (selectOption = option)} />
        <UI.Select type="buttons" label={{ name: 'Компоненты' }} options={COMPONENT_OPTIONS} onUpdate={(option) => (selectOption = option)} />
      </div>
    </UI.Accordion>

    <!-- Компонент SLIDER -->
    <UI.Accordion label={{ name: 'Slider' }} isOpen={false} wrapperClass="mb-2">
      <UI.Slider
        wrapperClass="!w-1/3 bg-red px-2"
        label={{ name: 'Слайдер' }}
        value={0}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <UI.Slider
        wrapperClass="!w-1/3 bg-blue px-2"
        label={{ name: 'Слайдер с диапазоном' }}
        value={[-12, 35]}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <UI.Slider
        wrapperClass="!w-1/3 bg-blue px-2"
        label={{ name: 'Слайдер с диапазоном (не активный)' }}
        value={[-10, 12]}
        number={{ minNum: -15, maxNum: 15, step: 1 }}
        disabled={true}
      />
      <UI.Slider
        wrapperClass="!w-1/2 bg-green px-2"
        label={{ name: 'Слайдер' }}
        value={-10}
        number={{ minNum: -25, maxNum: 25, step: 1 }}
        disabled={false}
      />
      <UI.Slider
        wrapperClass="!w-1/2 bg-yellow px-2"
        label={{ name: 'Слайдер' }}
        value={-25}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <UI.Slider
        wrapperClass="!w-1/2 bg-purple px-2"
        label={{ name: 'Слайдер' }}
        value={0}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <UI.Slider
        wrapperClass="!w-1/2 bg-pink px-2"
        label={{ name: 'Слайдер' }}
        value={25}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
    </UI.Accordion>

    <!-- Компонент SWITCH -->
    <UI.Accordion label={{ name: 'Switch' }} isOpen={false} wrapperClass="mb-2">
      <div class="flex">
        <UI.Switch
          wrapperClass="bg-blue"
          label={{ name: 'Switch', captionLeft: 'Off', captionRight: 'On' }}
          bind:value={switchValue}
          onChange={() => console.log(switchValue)}
        />
      </div>
    </UI.Accordion>

    <!-- Компонент TABLE -->
    <UI.Accordion label={{ name: 'Table' }} isOpen={true} wrapperClass="mb-2">
      <UI.Table
        label={{ name: 'Devices' }}
        header={columns}
        body={rows}
        onClick={(eventHandler) => console.log(eventHandler)}
        footer={`rows: ${rows.length}`}
        bind:modalData
      />
      <UI.Modal isOpen={modalData.isOpen} title="Full data">
        {#snippet main()}
          {@html modalData.formattedData}
        {/snippet}
        {#snippet footer()}
          <UI.Button
            content={{ name: 'Copy' }}
            wrapperClass="w-20 bg-pink"
            onClick={() => {
              navigator.clipboard.writeText(modalData.rawData)
              modalData.isOpen = false
            }}
          />
        {/snippet}
      </UI.Modal>
    </UI.Accordion>

    <!-- Компонент TEXT FIELD -->
    <UI.Accordion label={{ name: 'Text Field' }} isOpen={false} wrapperClass="mb-2">
      <UI.TextField content={{ name: 'Random text', size: 'small', class: '' }} wrapperClass="text-gray-400" />
      <UI.TextField content={{ name: 'Random text', size: 'base', class: 'font-bold' }} wrapperClass="text-red-400" />
      <UI.TextField content={{ name: 'Random text', size: 'large', class: '' }} wrapperClass="text-lime-400" />
      <UI.TextField content={{ name: 'Random text', size: 'huge', class: 'italic' }} wrapperClass="text-sky-400" />
      <UI.TextField content={{ name: 'Random text', size: 'massive', class: 'italic font-bold' }} wrapperClass="text-blue-400" />
      <UI.TextField content={{ name: 'Random text', size: 'massive', class: 'font-bold' }} wrapperClass="text-purple-400" />
      <UI.TextField content={{ name: 'Random text', size: 'massive', class: '' }} wrapperClass="text-pink-400" />
    </UI.Accordion>
  </div>
</div>
