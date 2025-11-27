<script lang="ts">
  import type { IGraphProps, UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Graph from '$lib/Graph/Graph.svelte'
  import GraphProps from '$lib/Graph/GraphProps.svelte'
  import { updateComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  const dataForGraph = [
    { name: 'Roll', value: 0 },
    { name: 'Pitch', value: 0 },
    { name: 'Yaw', value: 0 },
  ]

  let graphComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Graph',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: '',
      label: { name: 'Label', class: 'text-center' },
      streamingData: { data: dataForGraph },
      isTest: true,
    },
    eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Graph
${formatObjectToString(graphComponent.properties as IGraphProps)} 
/>`)
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Graph {...graphComponent.properties as IGraphProps} />
  {/snippet}
  {#snippet componentProps()}
    <GraphProps
      component={graphComponent as UIComponent & { properties: Partial<IGraphProps> }}
      onPropertyChange={(updates) => (graphComponent = updateComponent(graphComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <GraphProps
      component={graphComponent as UIComponent & { properties: Partial<IGraphProps> }}
      onPropertyChange={(updates) => (graphComponent = updateComponent(graphComponent, updates as object))}
      
    /> -->
  {/snippet}
</ComponentExample>
