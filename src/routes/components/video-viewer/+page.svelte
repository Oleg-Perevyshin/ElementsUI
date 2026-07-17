<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IVideoViewerProps } from "$lib/types"
  import VideoViewer from "$lib/VideoViewer/VideoViewer.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import VideoViewerProps from "$lib/VideoViewer/VideoViewerProps.svelte"
  import { onMount } from "svelte"
  import readmeRaw from "$lib/VideoViewer/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

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

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="h-full">
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
</ComponentExample>
