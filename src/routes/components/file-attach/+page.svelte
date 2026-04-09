<script lang="ts">
  import ComponentExample from "$lib/ComponentExample.svelte"
  import FileAttach from "$lib/FileAttach/FileAttach.svelte"
  import FileAttachProps from "$lib/FileAttach/FileAttachProps.svelte"
  import { updateComponent, type IFileAttachProps, type UIComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"

  let fileAttachComponent: UIComponent = $state({
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

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.FileAttach
${formatObjectToString(fileAttachComponent.properties as IFileAttachProps)} 
  onChange={() => {}}
/>`)

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64WithPrefix = reader.result as string
      updateComponent(fileAttachComponent, { properties: { ["currentImage"]: base64WithPrefix } })
    }
    reader.readAsDataURL(file)
  }
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <FileAttach {...fileAttachComponent.properties as IFileAttachProps} onChange={(event) => handleImageUpload(event)} />
  {/snippet}
  {#snippet componentProps()}
    <FileAttachProps
      component={fileAttachComponent as UIComponent & { properties: Partial<IFileAttachProps> }}
      onPropertyChange={(updates) => (fileAttachComponent = updateComponent(fileAttachComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex w-full flex-row items-center justify-between gap-3">
      <FileAttach id={crypto.randomUUID()} label={{ name: "Выберите файл" }} type="file" />
      <FileAttach id={crypto.randomUUID()} label={{ name: "Выберите файл" }} type="file" disabled />
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
