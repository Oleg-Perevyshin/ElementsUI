<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { Button } from "#lib"
  import { type IButtonProps, type UIComponent } from "#lib/types.ts"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import ButtonProps from "#lib/Button/ButtonProps.svelte"
  import IconGripVerticalDual from "#lib/libIcons/IconGripVerticalDual.svelte"
  import IconGripHorizontalUp from "../../../appIcons/IconGripHorizontalUp.svelte"
  import IconGripHorizontalDown from "../../../appIcons/IconGripHorizontalDown.svelte"
  import readmeRaw from "#lib/Button/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let buttonComponent: UIComponent<"Button"> = $state({
    id: crypto.randomUUID(),
    type: "Button",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      variant: "primary",
      accent: "red",
      componentClass: "px-1 py-1",
      content: {
        name: "Button",
        info: { text: "", side: "top" },
      },
      keyBind: { showInfo: true, ctrlKey: true, key: "Enter" },
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Button
${formatObjectToString(buttonComponent.properties as IButtonProps)} 
  onClick={() => {}}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="relative mx-40 my-20">
      <Button {...localizeDeep(buttonComponent.properties, $Language) as IButtonProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <ButtonProps component={buttonComponent} onPropertyChange={(updates) => (buttonComponent = applyPropertyChange(buttonComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-2 w-1/2 mx-auto">
      <Button content={{ name: "Button 1" }} variant="primary" accent="red" />
      <Button content={{ name: "Button 2", info: { text: "Info for Button 2", side: "top" } }} variant="primary" accent="yellow" />
      <Button content={{ name: "Button 3" }} variant="primary" disabled />
      <Button content={{ name: "Button 4", icon: IconGripVerticalDual }} variant="primary" accent="green" componentClass="h-12 rounded-3xl" />
      <div class="flex h-10 items-center justify-around">
        <Button content={{ icon: IconGripHorizontalUp }} wrapperClass="w-10 h-10" variant="primary" accent="purple" componentClass="rounded-full" />
        <Button content={{ icon: IconGripHorizontalDown, info: { text: "Info for Icon Button", side: "right" } }} wrapperClass="w-10" />
      </div>
    </div>
  {/snippet}
</ComponentExample>
