<script lang="ts">
  import type { IGraphProps, UIComponent } from '$lib'
  import Graph from '$lib/Graph/Graph.svelte'
  import GraphProps from '$lib/Graph/GraphProps.svelte'

  const dataForGraph = [
    { name: 'Roll', value: 0 },
    { name: 'Pitch', value: 0 },
    { name: 'Yay', value: 0 },
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

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    graphComponent = {
      ...graphComponent,
      properties: updates.properties ? { ...graphComponent.properties, ...updates.properties } : graphComponent.properties,
    }
  }
</script>

<Graph {...graphComponent.properties as IGraphProps} />

<GraphProps
  component={graphComponent as UIComponent & { properties: Partial<IGraphProps> }}
  onPropertyChange={(value) => updateComponent(graphComponent.id, { properties: value } as object)}
/>
