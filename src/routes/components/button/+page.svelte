<script lang="ts">
  import { Accordion, Button } from "$lib"
  import { updateComponent, type IButtonProps, type IUIComponentHandler, type Position, type UIComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import ButtonProps from "$lib/Button/ButtonProps.svelte"
  import { onMount } from "svelte"

  let buttonComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Button",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      componentClass: "bg-red py-1",
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

  let codeText = $derived(`
<UI.Button
${formatObjectToString(buttonComponent.properties as IButtonProps)} 
  onClick={() => {}}
/>`)

  onMount(() => document?.addEventListener("scroll", () => console.log("dfjkngoikugnjhvikdjn")))
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="relative mx-40 my-20">
      <Button {...buttonComponent.properties as IButtonProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(updates) => (buttonComponent = updateComponent(buttonComponent, updates as object))}
      forConstructor={true}
    />
    <!-- <hr />
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(updates) => (buttonComponent = updateComponent(buttonComponent, updates as object))}
      
    /> -->
  {/snippet}
</ComponentExample>
