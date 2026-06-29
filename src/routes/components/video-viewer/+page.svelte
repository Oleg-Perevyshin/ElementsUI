<script lang="ts">
  import { T, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IVideoViewerProps } from "$lib/types"
  import VideoViewer from "$lib/VideoViewer/VideoViewer.svelte"
  import { formatObjectToString } from "../../common"
  import VideoViewerProps from "$lib/VideoViewer/VideoViewerProps.svelte"

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
<UI.TextField
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
      name: "background",
      type: "boolean",
      default: "false",
      description: "Режим фона: при `true` добавляет закруглённый контейнер с отступами и цветом `--back-color`",
    },
    {
      name: "content",
      type: "{ name?: string; class?: string; size?: 'small' | 'base' | 'large' | 'huge' | 'massive' }",
      default: '{ name: "", class: "", size: "base" }',
      description:
        "Настройки текста: `name` — отображаемый контент, `class` — CSS-классы для стилизации, `size` — предустановленный размер шрифта (`small` = text-sm, `base` = text-base, `large` = text-2xl, `huge` = text-4xl, `massive` = text-5xl)",
    },
  ]
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
</ComponentExample>
