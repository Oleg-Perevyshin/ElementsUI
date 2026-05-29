<script lang="ts">
  import { type ITextFieldProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import TextFieldProps from "$lib/TextField/TextFieldProps.svelte"
  import { updateComponent, type IOption } from "$lib/types"
  import VideoViewer from "$lib/VideoViewer/VideoViewer.svelte"
  import { onMount } from "svelte"
  import { formatObjectToString } from "../../common"
  import Select from "$lib/Select/Select.svelte"

  let textFieldComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "TextField",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "text-[#333] dark:text-[#e2e3e7]",
      content: {
        name: "Text Field",
        class: "text-center",
        size: "large",
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let sources: MediaDeviceInfo[] = $state([])
  let devId: string = $state("")
  let stream: MediaStream | null = $state(null)

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      sources = deviceList.filter((d) => d.kind === "videoinput")
    } catch (e) {
      console.error("Failed to enumerate sources:", e)
      return []
    }

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
        ...(devId && { deviceId: { exact: devId } }),
      },
      audio: false,
    }
    console.log(devId)

    stream = await navigator.mediaDevices.getUserMedia(constraints)
  }

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.TextField
${formatObjectToString(textFieldComponent.properties as ITextFieldProps)} 
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

  onMount(() => {
    getDevices()
  })
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    {@const devList = sources.map((s) => ({ id: crypto.randomUUID(), name: s.label, value: s.deviceId }))}
    <div class="h-200">
      <VideoViewer bind:stream />
      <Select
        wrapperClass="w-[50%] m-auto mt-3"
        type="buttons"
        options={devList}
        value={devList.find((s) => s.value === devId) || devList[0]}
        onUpdate={(value) => {
          devId = (value as IOption<string>).value as string
          getDevices()
        }}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TextFieldProps
      component={textFieldComponent as UIComponent & { properties: Partial<ITextFieldProps> }}
      onPropertyChange={(updates) => (textFieldComponent = updateComponent(textFieldComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
</ComponentExample>
