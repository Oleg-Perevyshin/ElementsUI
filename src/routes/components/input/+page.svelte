<script lang="ts">
  import { Table, type IInputProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Input from "$lib/Input/Input.svelte"
  import InputProps from "$lib/Input/InputProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let valid = $state(false)
  let value = $state(undefined)

  let inputComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Input",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Label", class: "text-center" },
      componentClass: "bg-max resize-none",
      type: "text",
      bitMode: false,
      range: { start: 0, end: 1 },
      maxlength: 32,
      number: { minNum: 1, maxNum: 10, step: 1 },
      textareaRows: 5,
      help: { copyButton: false, info: "", autocomplete: "off", regExp: "^[0-9a-zA-Z_-]{0,32}$" },
    },
    eventHandler: { Header: "SET", Argument: "NoSend", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Input
${formatObjectToString(inputComponent.properties as IInputProps)} 
  onUpdate={() => {}}
/>`)
  let inputString: string = $state("String Data")
  let inputNumber: number = $state(7)

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
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Отключает ввод: блокирует взаимодействие с элементом и визуально затемняет компонент",
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Режим только для чтения: позволяет выделять и копировать текст, но запрещает редактирование",
    },
    {
      name: "value",
      type: "string | number",
      default: "undefined",
      description: "Текущее значение поля; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "type",
      type: '"text" | "password" | "number" | "text-area"',
      default: '"text"',
      description:
        "Тип поля ввода: `text` — обычный текст, `password` — скрытый ввод с кнопкой показа, `number` — числовое поле со стрелками, `text-area` — многострочное поле",
    },
    {
      name: "placeholder",
      type: "string",
      default: '""',
      description: "Текст-подсказка, отображаемый в пустом поле ввода",
    },
    {
      name: "componentClass",
      type: "string",
      default: '""',
      description: "Дополнительные CSS-классы для самого элемента ввода (input/textarea)",
    },
    {
      name: "maxlength",
      type: "number",
      default: "100",
      description: "Максимальное количество символов, разрешённых для ввода",
    },
    {
      name: "textareaRows",
      type: "number",
      default: "3",
      description: "Количество видимых строк для типа `text-area`",
    },
    {
      name: "isValid",
      type: "boolean",
      default: "true",
      description: "Состояние валидации: при `false` поле подсвечивается красным; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "number",
      type: "{ minNum?: number; maxNum?: number; step?: number }",
      default: "{ minNum: -1000000, maxNum: 1000000, step: 1 }",
      description: "Настройки для числового ввода: `minNum`/`maxNum` — границы допустимого диапазона, `step` — шаг изменения значения стрелками",
    },
    {
      name: "help",
      type: "{ info?: string; autocomplete?: string; copyButton?: boolean; regExp?: string | RegExp }",
      default: '{ info: "", autocomplete: "off", copyButton: false }',
      description:
        "Дополнительные настройки: `info` — текст всплывающей подсказки, `autocomplete` — атрибут автозаполнения браузера, `copyButton` — показать кнопку копирования, `regExp` — регулярное выражение для валидации ввода",
    },
    {
      name: "onUpdate",
      type: "(value: string | number) => void",
      default: "() => {}",
      description: "Callback-функция, вызываемая при изменении значения поля; передаёт новое значение",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div>
      <Input
        {...inputComponent.properties as IInputProps}
        onUpdate={(value) => {
          updateComponent(inputComponent, {
            properties: { value: value },
          })
        }}
        bind:value
        bind:isValid={valid}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <InputProps
      component={inputComponent as UIComponent & { properties: Partial<IInputProps> }}
      onPropertyChange={(updates) => (inputComponent = updateComponent(inputComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex w-full flex-col items-center gap-2">
      <Input wrapperClass="!w-60" help={{ regExp: /^[\w\s-]{4,16}$/ }} bind:value={inputString} type="text" maxlength={20} />
      <Input wrapperClass="!w-60" help={{ copyButton: true, regExp: /^[\w\s-]{4,16}$/ }} bind:value={inputString} readonly type="text" maxlength={20} />
      <Input wrapperClass="!w-60" help={{ regExp: /^[\w\s-]{4,16}$/ }} placeholder={inputString} type="text" maxlength={20} />
      <Input
        wrapperClass="!w-60"
        help={{ copyButton: true, regExp: /^[\w\s-]{4,16}$/ }}
        bind:value={inputString}
        readonly
        type="text"
        maxlength={20}
        disabled
      />
      <Input
        wrapperClass="!w-30 bg-green"
        value={inputNumber}
        type="number"
        maxlength={3}
        number={{ maxNum: 100, minNum: 0, step: 10 }}
        help={{ info: "Информационная подсказка" }}
        onUpdate={(value) => (inputNumber = value as number)}
      />
      <Input wrapperClass="w-100" bind:value={inputString} type="password" maxlength={20} />
      <Input
        wrapperClass="w-150"
        bind:value={inputString}
        help={{ copyButton: true, info: "Информационная подсказка. Может быть многострочной, если не вмещается!" }}
        type="text-area"
        maxlength={150}
        textareaRows={2}
      />
      <p>string: {inputString}</p>
      <p>number: {inputNumber}</p>
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
