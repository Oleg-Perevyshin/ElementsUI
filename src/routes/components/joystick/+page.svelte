<script lang="ts">
  import { Table, type IJoystickProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Joystick from "$lib/Joystick/Joystick.svelte"
  import JoystickProps from "$lib/Joystick/JoystickProps.svelte"
  import IconGripVerticalDual from "$lib/libIcons/IconGripVerticalDual.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let joystickComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Joystick",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Label", class: "text-center" },
      axes: [
        { name: "Pitch", minNum: -100, maxNum: 100 },
        { name: "Roll", minNum: -100, maxNum: 100 },
        { name: "Yaw", minNum: -100, maxNum: 100 },
      ],
    },
    eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Joystick
${formatObjectToString(joystickComponent.properties as IJoystickProps)} 
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
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "value",
      type: "[number, number, number] | [number, number]",
      default: "[0, 0, 0]",
      description:
        "Текущие значения осей джойстика: при 3 осях — `[pitch, roll, yaw]`, при 2 осях — `[pitch, yaw]`; четвёртый элемент (индекс 3) используется как флаг состояния центральной кнопки; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "isHomeButton",
      type: "boolean",
      default: "false",
      description:
        "Режим центральной кнопки: при `true` — кнопка сбрасывает все оси в ноль (режим «домой»), при `false` — переключает флаг состояния (индекс 3 в `value`)",
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Режим только для чтения: скрывает интерактивные элементы управления, отображает только текущие значения осей",
    },
    {
      name: "axes",
      type: "{ name: string; minNum: number; maxNum: number }[]",
      default: '[{ name: "Pitch", minNum: -360, maxNum: 360 }, { name: "Roll", minNum: -360, maxNum: 360 }, { name: "Yaw", minNum: -360, maxNum: 360 }]',
      description:
        "Конфигурация осей: массив из 2 или 3 объектов; `name` — название оси для отображения (пустая строка скрывает ось), `minNum`/`maxNum` — границы допустимого диапазона; при 3 осях управление осью `roll` выносится на боковые кнопки",
    },
    {
      name: "buttonIcon",
      type: "ConstructorOfATypedSvelteComponent | string | null",
      default: "undefined",
      description: "Кастомная иконка для центральной кнопки: может быть SVG-строкой или Svelte-компонентом",
    },
    {
      name: "onUpdate",
      type: "(value: [number, number, number] | [number, number]) => void",
      default: "() => {}",
      description:
        "Callback-функция, вызываемая при изменении значений осей; передаёт обновлённый массив значений (2 или 3 элемента + опционально флаг кнопки)",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <Joystick {...joystickComponent.properties as IJoystickProps} />
  {/snippet}
  {#snippet componentProps()}
    <JoystickProps
      component={joystickComponent as UIComponent & { properties: Partial<IJoystickProps> }}
      onPropertyChange={(updates) => (joystickComponent = updateComponent(joystickComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex">
      <Joystick label={{ name: "Управление по 3 осям" }} isHomeButton />
      <Joystick
        label={{ name: "Управление по 2 осям" }}
        axes={[{ name: "Pitch", minNum: -100, maxNum: 100 }, { name: "" }, { name: "Yaw", minNum: -100, maxNum: 100 }]}
        buttonIcon={IconGripVerticalDual}
      />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
