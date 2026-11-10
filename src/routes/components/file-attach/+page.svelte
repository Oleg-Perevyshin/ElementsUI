<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import FileAttach from "#lib/FileAttach/FileAttach.svelte"
  import FileAttachProps from "#lib/FileAttach/FileAttachProps.svelte"
  import { type IFileAttachProps, type UIComponent } from "#lib/types.ts"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/FileAttach/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let fileAttachComponent: UIComponent<"FileAttach"> = $state({
    id: crypto.randomUUID(),
    type: "FileAttach",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "",
      label: { name: "Label", class: "text-center" },
      accept: "*/*",
      type: "file",
      imageSize: { height: "10rem", width: "10rem", fitMode: "cover", form: "square" },
      disabled: false,
      onChange: () => {},
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.FileAttach
${formatObjectToString(fileAttachComponent.properties as IFileAttachProps)}
  onUpdate={() => {}}
/>`)

  const handleImageUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => (fileAttachComponent = applyPropertyChange(fileAttachComponent, { properties: { currentImage: String(reader.result) } }))
    reader.readAsDataURL(file)
  }
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <FileAttach {...localizeDeep(fileAttachComponent.properties, $Language) as IFileAttachProps} onUpdate={handleImageUpload} />
  {/snippet}
  {#snippet componentProps()}
    <FileAttachProps
      component={fileAttachComponent}
      onPropertyChange={(updates) => (fileAttachComponent = applyPropertyChange(fileAttachComponent, updates))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex w-full flex-row items-center justify-between gap-3">
      <FileAttach id={crypto.randomUUID()} label={{ name: "Выберите файл" }} type="file" />
      <FileAttach id={crypto.randomUUID()} label={{ name: "Выберите файл" }} type="file" disabled />
      <FileAttach
        id={crypto.randomUUID()}
        label={{ name: "Кнопка" }}
        type="button"
        componentClass="size-8 rounded-[10px] p-[6px]"
        info={{ text: "Открыть файл", side: "top" }}
      />
      <FileAttach
        id={crypto.randomUUID()}
        label={{ name: "Выберите изображение" }}
        type="image"
        imageSize={{ height: "10rem", width: "10rem", fitMode: "contain" }}
      />
      <FileAttach
        id={crypto.randomUUID()}
        label={{ name: "Выберите изображение" }}
        type="image"
        imageSize={{ height: "10rem", width: "10rem", fitMode: "cover" }}
      />
      <FileAttach
        id={crypto.randomUUID()}
        label={{ name: "Выберите изображение" }}
        type="image"
        disabled
        imageSize={{ height: "10rem", width: "10rem", fitMode: "cover" }}
      />
    </div>
  {/snippet}
</ComponentExample>
