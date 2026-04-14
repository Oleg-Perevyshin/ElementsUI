<script lang="ts">
  import { Table } from "$lib"
  import ColorPicker from "$lib/ColorPicker/ColorPicker.svelte"
  import ColorPickerProps from "$lib/ColorPicker/ColorPickerProps.svelte"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IColorPickerProps, type UIComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let colorPickerComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "ColorPicker",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Label", class: "text-center" },
      value: [0, 0, 0],
    },
    eventHandler: { Header: "SET", Argument: "NoSave", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.ColorPicker
${formatObjectToString(colorPickerComponent.properties as IColorPickerProps)} 
  onChange={() => {}}
/>`)

  const rows = [
    {
      name: "id",
      type: "string",
      default: "crypto.randomUUID()",
      description: "Уникальный идентификатор компонента",
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Режим только для чтения: скрывает слайдеры, оставляет только превью цвета и HEX-значение",
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
      name: "value",
      type: "[number, number, number]",
      default: "[0, 0, 0]",
      description:
        "Текущий цвет в формате RGB-массива [0–255, 0–255, 0–255]; при изменении автоматически переключает режим между полноцветным (HSV) и оттенками серого",
    },
    {
      name: "onChange",
      type: "(value: [number, number, number]) => void",
      default: "() => {}",
      description: "Callback-функция, вызываемая при изменении цвета; передаёт новый RGB-массив",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <ColorPicker {...colorPickerComponent.properties as IColorPickerProps} />
  {/snippet}
  {#snippet componentProps()}
    <ColorPickerProps
      component={colorPickerComponent as UIComponent & { properties: Partial<IColorPickerProps> }}
      onPropertyChange={(updates) => (colorPickerComponent = updateComponent(colorPickerComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <ColorPicker label={{ name: "Выбор цвета из палитры" }} value={[186, 25, 255]} />
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
