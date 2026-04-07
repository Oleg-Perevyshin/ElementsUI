<script lang="ts">
  import { type IInputProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Input from "$lib/Input/Input.svelte"
  import InputProps from "$lib/Input/InputProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"

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
    </div>{/snippet}
</ComponentExample>
