<script lang="ts">
  import { type ISelectProps, type UIComponent } from "$lib"
  import Button from "$lib/Button/Button.svelte"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Select from "$lib/Select/Select.svelte"
  import SelectProps from "$lib/Select/SelectProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"

  let selectComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Select",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-max",
      disabled: false,
      label: { name: "Label", class: "text-center" },
      type: "buttons",
      multiSelect: true,
      bitMode: false,
      range: { start: 0, end: 1 },
      options: [
        { id: "select-option-1", value: "1", name: "Option 1", class: "bg-max" },
        { id: "select-option-2", value: "2", name: "Option 2", class: "bg-max" },
        { id: "select-option-3", value: "3", name: "3", class: "bg-max" },
        { id: "select-option-4", value: "4", name: "4", class: "bg-max" },
      ],
      value: [{ id: "select-option-1", value: "1", name: "Option 1", class: "bg-max" }],
    },
    eventHandler: { Header: "SET", Argument: "", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Select
${formatObjectToString(selectComponent.properties as ISelectProps)} 
  onUpdate={() => {}}
/>`)
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <Select
      {...selectComponent.properties as ISelectProps}
      onUpdate={(value) => {
        updateComponent(selectComponent, {
          properties: { value: value },
        })
      }}
    />
  {/snippet}
  {#snippet componentProps()}
    <SelectProps
      component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
      onPropertyChange={(updates) => (selectComponent = updateComponent(selectComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
</ComponentExample>
