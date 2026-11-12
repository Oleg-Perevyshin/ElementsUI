<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import type { IInputProps, UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import Input from "#lib/Input/Input.svelte"
  import InputProps from "#lib/Input/InputProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/Input/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let inputComponent: UIComponent<"Input"> = $state({
    id: crypto.randomUUID(),
    type: "Input",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Label", class: "text-center" },
      componentClass: "resize-none",
      type: "text",
      value: "2",
      range: { start: 0, end: 1 },
      maxlength: 32,
      number: { minNum: 1, maxNum: 10, step: 0.001 },
      textareaRows: 5,
      help: { copyButton: false, info: "", autocomplete: "off", regExp: "^[0-9a-zA-Z_-]{0,32}$" },
    },
    eventHandler: { Header: "SET", Argument: "NoSend", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
  <UI.Input
  ${formatObjectToString(inputComponent.properties as IInputProps)}
    onUpdate={() => {}}
  />`)
  let inputString: string = $state("String Data")
  let inputNumber: number = $state(7)

  /* Поле для вызова focus() извне */
  let focusTarget: ReturnType<typeof Input> | undefined = $state()
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div>
      <Input
        {...localizeDeep(inputComponent.properties, $Language) as IInputProps}
        onUpdate={(value) => (inputComponent = applyPropertyChange(inputComponent, { properties: { value } }))}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <InputProps component={inputComponent} onPropertyChange={(updates) => (inputComponent = applyPropertyChange(inputComponent, updates))} />
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
        accent="green"
        wrapperClass="!w-30"
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
      <h5>Ошибка от приложения, фокус извне, text-area на всю высоту</h5>
      <Input wrapperClass="!w-60" label={{ name: "Логин" }} value="admin" error="Пользователь уже существует" />
      <div class="flex w-60 items-end gap-2">
        <Input bind:this={focusTarget} label={{ name: "Фокус по кнопке" }} />
        <button class="h-8 shrink-0 rounded-[10px] border border-(--border-color) px-3 text-[13px]" onclick={() => focusTarget?.focus()}>focus()</button>
      </div>
      <div class="flex h-48 w-150 flex-col rounded-xl border border-dashed border-(--border-color) p-2">
        <Input label={{ name: "Заметки (fill)" }} type="text-area" fill bind:value={inputString} help={{ info: "Подсказка внутри поля" }} />
      </div>
      <p>string: {inputString}</p>
      <p>number: {inputNumber}</p>
    </div>
  {/snippet}
</ComponentExample>
