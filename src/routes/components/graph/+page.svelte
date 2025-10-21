<script lang="ts">
  import type { IGraphProps, UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Graph from '$lib/Graph/Graph.svelte'
  import GraphProps from '$lib/Graph/GraphProps.svelte'
  import { formatObjectToString } from '../../common'

  const dataForGraph = [
    { name: 'Roll', value: 10 },
    { name: 'Pitch', value: 20 },
    { name: '1', value: 100 },
    { name: '2', value: -75 },
  ]

  let graphComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Graph',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: '',
      label: { name: 'Label', class: 'text-center' },
      streamingData: { data: dataForGraph },
      isTest: true,
      eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Graph
${formatObjectToString(graphComponent.properties as IGraphProps)} 
  onChange={() => {}}
/>`)

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    graphComponent = {
      ...graphComponent,
      properties: updates.properties ? { ...graphComponent.properties, ...updates.properties } : graphComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Graph {...graphComponent.properties as IGraphProps} />
  {/snippet}
  {#snippet componentProps()}
    <GraphProps
      component={graphComponent as UIComponent & { properties: Partial<IGraphProps> }}
      onPropertyChange={(value) => updateComponent(graphComponent.id, { properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
