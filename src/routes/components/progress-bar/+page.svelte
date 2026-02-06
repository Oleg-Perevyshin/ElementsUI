<script lang="ts">
  import { Accordion, ProgressBar, type IProgressBarProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import ProgressBarProps from "$lib/ProgressBar/ProgressBarProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "ProgressBar",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      type: "horizontal",
      label: { name: "Label", class: "text-center" },
      value: [
        { name: "Label 1", value: 30 },
        { name: "Label 2", value: 50 },
        { name: "Label 3", value: 80 },
      ],
      number: { minNum: 0, maxNum: 100, units: "%" },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.ProgressBar
${formatObjectToString(progressBarComponent.properties as IProgressBarProps)} 
/>`)
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <ProgressBar {...progressBarComponent.properties as IProgressBarProps} />
  {/snippet}
  {#snippet componentProps()}
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(updates) => (progressBarComponent = updateComponent(progressBarComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(updates) => (progressBarComponent = updateComponent(progressBarComponent, updates as object))} 
    /> -->
  {/snippet}
</ComponentExample>
