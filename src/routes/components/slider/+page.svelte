<script lang="ts">
  import { Table, type ISliderProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Slider from "$lib/Slider/Slider.svelte"
  import SliderProps from "$lib/Slider/SliderProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let sliderComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Slider",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Label", class: "text-center" },
      value: 3,
      type: "single",
      number: { minNum: 0, maxNum: 10, step: 1 },
      disabled: false,
    },
    eventHandler: { Header: "SET", Argument: "NoSave", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Slider
${formatObjectToString(sliderComponent.properties as ISliderProps)} 
  onUpdate={() => {}}
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
      name: "type",
      type: '"single" | "range"',
      default: '"single"',
      description:
        "Тип слайдера: `single` — одно значение, `range` — диапазон с двумя ползунками; автоматически определяется по типу `value` если передан массив из двух чисел",
    },
    {
      name: "value",
      type: "number | [number, number]",
      default: "0",
      description:
        "Текущее значение: число для `single`, массив для `range`; при изменении через UI вызывает `onUpdate`; поддерживает внешнее управление через реактивное обновление",
    },
    {
      name: "number",
      type: "{ minNum?: number; maxNum?: number; step?: number }",
      default: "{ minNum: 0, maxNum: 10, step: 1 }",
      description: "Настройки диапазона: `minNum`/`maxNum` — границы значений, `step` — шаг изменения",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Отключает взаимодействие: блокирует перетаскивание ползунков и кнопки `+`/`−`, добавляет визуальные стили неактивности",
    },
    {
      name: "onUpdate",
      type: "(value: number | [number, number]) => void",
      default: "() => {}",
      description: "Callback-функция, вызываемая при изменении значения; передаёт новое число или массив в зависимости от `type`",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <Slider {...sliderComponent.properties as ISliderProps} />
  {/snippet}
  {#snippet componentProps()}
    <SliderProps
      component={sliderComponent as UIComponent & { properties: Partial<ISliderProps> }}
      onPropertyChange={(updates) => (sliderComponent = updateComponent(sliderComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex gap-2">
      <Slider wrapperClass="!w-1/3 bg-red px-2" label={{ name: "Слайдер" }} value={0} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
      <Slider
        wrapperClass="!w-1/3 bg-blue px-2"
        label={{ name: "Слайдер с диапазоном" }}
        value={[-12, 35]}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <Slider
        wrapperClass="!w-1/3 bg-blue px-2"
        label={{ name: "Слайдер с диапазоном (не активный)" }}
        value={[-10, 12]}
        number={{ minNum: -15, maxNum: 15, step: 1 }}
        disabled={true}
      />
    </div>
    <div class="flex gap-2">
      <Slider wrapperClass="!w-1/2 bg-green px-2" label={{ name: "Слайдер" }} value={-10} number={{ minNum: -25, maxNum: 25, step: 1 }} disabled={false} />
      <Slider wrapperClass="!w-1/2 bg-yellow px-2" label={{ name: "Слайдер" }} value={-25} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
    </div>
    <div class="flex gap-2">
      <Slider wrapperClass="!w-1/2 bg-purple px-2" label={{ name: "Слайдер" }} value={0} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
      <Slider wrapperClass="!w-1/2 bg-pink px-2" label={{ name: "Слайдер" }} value={25} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
