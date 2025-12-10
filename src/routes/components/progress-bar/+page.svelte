<script lang="ts">
  import { ProgressBar, type IProgressBarProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import ProgressBarProps from '$lib/ProgressBar/ProgressBarProps.svelte'
  import { updateComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ProgressBar',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      type: 'horizontal',
      label: { name: 'Label', class: 'text-center' },
      value: [80, 60, 20, 100, 4],
      number: { minNum: 0, maxNum: 100, units: '%' },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
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
    <hr />
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(updates) => (progressBarComponent = updateComponent(progressBarComponent, updates as object))}
    />
  {/snippet}
</ComponentExample>
