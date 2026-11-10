<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type ITextFieldProps, type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import TextField from "#lib/TextField/TextField.svelte"
  import TextFieldProps from "#lib/TextField/TextFieldProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/TextField/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let textFieldComponent: UIComponent<"TextField"> = $state({
    id: crypto.randomUUID(),
    type: "TextField",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "text-(color:--font-color)",
      content: {
        name: "Text Field",
        class: "text-center",
        size: "large",
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.TextField
${formatObjectToString(textFieldComponent.properties as ITextFieldProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div>
      <TextField {...localizeDeep(textFieldComponent.properties, $Language) as ITextFieldProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TextFieldProps component={textFieldComponent} onPropertyChange={(updates) => (textFieldComponent = applyPropertyChange(textFieldComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <TextField content={{ name: "Random text", size: "small" }} wrapperClass="text-gray-400" />
    <TextField content={{ name: "Random text", size: "base", class: "font-bold" }} wrapperClass="text-red-400" />
    <TextField content={{ name: "Random text", size: "large" }} wrapperClass="text-lime-400" />
    <TextField content={{ name: "Random text", size: "huge", class: "italic" }} wrapperClass="text-sky-400" />
    <TextField content={{ name: "Random text", size: "massive", class: "italic font-bold" }} wrapperClass="text-blue-400" />
    <TextField content={{ name: "Random text", size: "massive", class: "font-bold" }} wrapperClass="text-purple-400" />
    <TextField content={{ name: "Random text", size: "massive" }} wrapperClass="text-(--red-text)" background />
  {/snippet}
</ComponentExample>
