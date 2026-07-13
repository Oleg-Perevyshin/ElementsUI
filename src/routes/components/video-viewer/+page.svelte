<script lang="ts">
  import { Table, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IVideoViewerProps } from "$lib/types"
  import VideoViewer from "$lib/VideoViewer/VideoViewer.svelte"
  import { formatObjectToString, TableColumns } from "../../common"
  import VideoViewerProps from "$lib/VideoViewer/VideoViewerProps.svelte"
  import { onMount } from "svelte"

  let videoViewerComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "VideoViewer",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Label" },
      showSelect: true,
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.VideoViewer
${formatObjectToString(videoViewerComponent.properties as IVideoViewerProps)}
/>`)

  const rows = [
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
      description: "Настройки заголовка компонента",
    },
    {
      name: "showSelect",
      type: "boolean",
      default: "true",
      description: 'Показывать селектор источника (список доступных камер) — применяется только в режиме source="camera"',
    },
    {
      name: "source",
      type: '"camera" | "remote"',
      default: '"camera"',
      description:
        "Режим работы: `camera` — локальный доступ к веб-камере через getUserMedia (как раньше), `remote` — компонент только отображает кадры, переданные извне через проп `frame` (WebSocket/протокол — забота приложения, не компонента)",
    },
    {
      name: "streamKey",
      type: "string",
      default: "undefined",
      description: "Ключ потока для приложения/конструктора — самим компонентом не используется (компонент не открывает соединений)",
    },
    {
      name: "frame",
      type: "Uint8Array | Blob | null",
      default: "null",
      description: "Последний полученный кадр (JPEG) в режиме `remote` — обновляется родительским приложением при получении нового кадра",
    },
    {
      name: "status",
      type: '"connecting" | "live" | "offline" | "error"',
      default: "undefined",
      description: "Статус соединения в режиме `remote` — управляет индикатором поверх кадра (не показывается при `live`)",
    },
  ]

  /* Пример remote-режима: синтетические JPEG-кадры (canvas → toBlob) имитируют получение потока извне,
     без реального устройства — так новый режим можно проверить в браузере */
  let remoteFrame = $state<Blob | null>(null)
  let remoteStatus = $state<IVideoViewerProps["status"]>("connecting")

  onMount(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext("2d")!
    let hue = 0

    const interval = setInterval(() => {
      hue = (hue + 15) % 360
      ctx.fillStyle = `hsl(${hue}, 60%, 45%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#fff"
      ctx.font = "20px monospace"
      ctx.fillText(new Date().toLocaleTimeString(), 20, 120)
      canvas.toBlob((blob) => {
        if (blob) {
          remoteFrame = blob
          remoteStatus = "live"
        }
      }, "image/jpeg")
    }, 500)

    return () => clearInterval(interval)
  })
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="h-200">
      <VideoViewer {...videoViewerComponent.properties as IVideoViewerProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <VideoViewerProps
      component={videoViewerComponent as UIComponent & { properties: Partial<IVideoViewerProps> }}
      onPropertyChange={(updates) => (videoViewerComponent = updateComponent(videoViewerComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="h-80">
      <VideoViewer label={{ name: "Удалённый поток (синтетические кадры)" }} source="remote" frame={remoteFrame} status={remoteStatus} />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}
</ComponentExample>
