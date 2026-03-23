<script lang="ts">
  import { Button } from "$lib"
  import { updateComponent, type IButtonProps, type UIComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import ButtonProps from "$lib/Button/ButtonProps.svelte"

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
</ComponentExample>
