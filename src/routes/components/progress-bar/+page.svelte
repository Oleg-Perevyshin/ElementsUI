<script lang="ts">
  import { ProgressBar, type IProgressBarProps, type UIComponent } from '$lib'
  import ProgressBarProps from '$lib/ProgressBar/ProgressBarProps.svelte'

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ProgressBar',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      value: 40,
      number: { minNum: 0, maxNum: 100, units: '%' },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    progressBarComponent = {
      ...progressBarComponent,
      properties: updates.properties ? { ...progressBarComponent.properties, ...updates.properties } : progressBarComponent.properties,
    }
  }
</script>

<ProgressBar {...progressBarComponent.properties as IProgressBarProps} />

<ProgressBarProps
  component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
  onPropertyChange={(value) => updateComponent(progressBarComponent.id, { properties: value } as object)}
/>
