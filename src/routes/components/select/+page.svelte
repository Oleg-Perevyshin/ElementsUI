<script lang="ts">
  import { type ISelectOption, type ISelectProps, type UIComponent } from "$lib"
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
      type: "select",
      valueType: "text",
      bitMode: false,
      range: { start: 0, end: 1 },
      options: [
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
        // { id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" },
      ],
    },
    eventHandler: { Header: "SET", Argument: "", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let valueNum: ISelectOption | null = $state(null)

  let codeText = $derived(`
<UI.Select
${formatObjectToString(selectComponent.properties as ISelectProps)} 
  onUpdate={() => {}}
/>`)
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Select
      {...selectComponent.properties as ISelectProps}
      onUpdate={(value) => {
        updateComponent(selectComponent, {
          properties: { value: value },
        })
      }}
      bind:value={valueNum}
    />

    <p>{valueNum?.value}</p>
    <p>{typeof valueNum?.value}</p>
  {/snippet}
  {#snippet componentProps()}
    <SelectProps
      component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
      onPropertyChange={(updates) => (selectComponent = updateComponent(selectComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <SelectProps
      component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
      onPropertyChange={(updates) => (selectComponent = updateComponent(selectComponent, updates as object))}
      
    /> -->
  {/snippet}
</ComponentExample>
