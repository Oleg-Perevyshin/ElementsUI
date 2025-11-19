<script lang="ts">
  import { ProgressBar, type IProgressBarProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import ProgressBarProps from '$lib/ProgressBar/ProgressBarProps.svelte'
  import { formatObjectToString } from '../../common'

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ProgressBar',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      value: 80,
      number: { minNum: 0, maxNum: 100, units: '%' },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.ProgressBar
${formatObjectToString(progressBarComponent.properties as IProgressBarProps)} 
/>`)

  const updateComponent = (
    updates: Partial<{
      name: string
      access: 'full' | 'viewOnly' | 'hidden'
      properties: Partial<UIComponent['properties']>
    }>,
  ) => {
    progressBarComponent = {
      ...progressBarComponent,
      access: updates.access ?? progressBarComponent.access,
      name: updates.name ?? progressBarComponent.name,
      properties: updates.properties ? { ...progressBarComponent.properties, ...updates.properties } : progressBarComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <ProgressBar {...progressBarComponent.properties as IProgressBarProps} />
  {/snippet}
  {#snippet componentProps()}
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={true}
    />
    <hr />
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
