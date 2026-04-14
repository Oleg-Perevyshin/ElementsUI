<script lang="ts">
  import { Table } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import FileAttach from "$lib/FileAttach/FileAttach.svelte"
  import FileAttachProps from "$lib/FileAttach/FileAttachProps.svelte"
  import { updateComponent, type IFileAttachProps, type UIComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

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
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "type",
      type: '"file" | "image"',
      default: '"file"',
      description:
        'Режим отображения: `"file"` — стандартный выбор файла с отображением имени, `"image"` — интерактивный контейнер для загрузки и превью изображений',
    },
    {
      name: "accept",
      type: "string",
      default: '"*/*"',
      description: "Разрешённые MIME-типы или расширения файлов для выбора",
    },
    {
      name: "imageSize",
      type: "{ height?: string; width?: string; fitMode?: 'cover' | 'contain'; form?: 'square' | 'circle' }",
      default: '{ height: "10rem", width: "10rem", fitMode: "cover", form: "square" }',
      description: "Настройки отображения изображения: `height`/`width` — размеры контейнера, `fitMode` — режим масштабирования, `form` — форма контейнера",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Отключает выбор файла: блокирует взаимодействие с элементом и визуально затемняет компонент",
    },
    {
      name: "currentImage",
      type: "string",
      default: '""',
      description: "Текущее изображение в формате URL или Base64-строки; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "onChange",
      type: "(event: Event, file: File | null) => void",
      default: "() => {}",
      description: "Callback-функция, вызываемая при изменении выбранного файла; передаёт событие и объект файла (или `null` при очистке)",
    },
  ]
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
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
