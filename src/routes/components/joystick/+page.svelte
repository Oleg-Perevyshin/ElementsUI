<script lang="ts">
  import { Joystick, type IProgressBarProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import ProgressBarProps from '$lib/ProgressBar/ProgressBarProps.svelte'
  import { formatObjectToString } from '../../common'

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ProgressBar',
    component: null,
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
<UI.Joystick
${formatObjectToString(progressBarComponent.properties as IProgressBarProps)} 
/>`)

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    progressBarComponent = {
      ...progressBarComponent,
      properties: updates.properties ? { ...progressBarComponent.properties, ...updates.properties } : progressBarComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Joystick label={{ name: 'dscfdjkcf' }} />
  {/snippet}
  {#snippet componentProps()}
    <!-- <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(value) => updateComponent(progressBarComponent.id, { properties: value } as object)}
      forConstructor={false}
    /> -->
  {/snippet}
</ComponentExample>
