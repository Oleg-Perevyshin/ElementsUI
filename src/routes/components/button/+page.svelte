<script lang="ts">
  import { Button, Table } from "$lib"
  import { updateComponent, type IButtonProps, type UIComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import ButtonProps from "$lib/Button/ButtonProps.svelte"
  import IconGripVerticalDual from "$lib/libIcons/IconGripVerticalDual.svelte"
  import IconGripHorizontalUp from "../../../appIcons/IconGripHorizontalUp.svelte"
  import IconGripHorizontalDown from "../../../appIcons/IconGripHorizontalDown.svelte"

  let buttonComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Button",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      componentClass: "bg-red px-1 py-1",
      content: {
        name: "Button",
        info: { text: "", side: "top" },
      },
      keyBind: { showInfo: true, ctrlKey: true, key: "Enter" },
    },
    eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Button
${formatObjectToString(buttonComponent.properties as IButtonProps)} 
  onClick={() => {}}
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
      name: "componentClass",
      type: "string",
      default: '""',
      description: "Дополнительные CSS-классы для самого элемента кнопки",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Отключает кнопку: блокирует клики, добавляет визуальные стили неактивности",
    },
    {
      name: "content",
      type: "{ name?: string; info?: { text: string; side: 'top' | 'bottom' | 'left' | 'right' }; icon?: ConstructorOfATypedSvelteComponent | string | null }",
      default: '{ name: "", info: { text: "", side: "top" }, icon: null }',
      description:
        "Настройки содержимого кнопки: `name` — текст кнопки, `info` — объект с текстом подсказки и её позицией (top/bottom/left/right), `icon` — иконка в виде SVG-строки или Svelte-компонента; при пустом `name` и наличии `icon` кнопка рендерится как круглая без фона",
    },
    {
      name: "keyBind",
      type: "{ showHint?: boolean; key?: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean }",
      default: "{ showHint: true }",
      description:
        "Настройки горячих клавиш: `key` — клавиша для активации, модификаторы `ctrlKey`/`shiftKey`/`altKey`/`metaKey` — необязательные условия сочетания, `showHint` — отображать ли подсказку с комбинацией в интерфейсе; обработчик регистрируется глобально на window",
    },
    {
      name: "onClick",
      type: "() => void",
      default: "undefined",
      description: "Callback-функция, вызываемая при клике на кнопку или срабатывании горячей клавиши",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="relative mx-40 my-20">
      <Button {...buttonComponent.properties as IButtonProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(updates) => (buttonComponent = updateComponent(buttonComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-2 w-1/2 mx-auto">
      <Button content={{ name: "Button 1" }} componentClass="bg-red" />
      <Button content={{ name: "Button 2", info: { text: "Info for Button 2", side: "top" } }} componentClass="bg-yellow" />
      <Button content={{ name: "Button 3" }} componentClass="bg-blue" disabled />
      <Button content={{ name: "Button 4", icon: IconGripVerticalDual }} componentClass="bg-green h-12 rounded-3xl" />
      <div class="flex h-10 items-center justify-around">
        <Button content={{ icon: IconGripHorizontalUp }} wrapperClass="w-10 h-10" componentClass="bg-purple rounded-full" />
        <Button content={{ icon: IconGripHorizontalDown, info: { text: "Info for Icon Button", side: "right" } }} wrapperClass="w-10" />
      </div>
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}
</ComponentExample>
