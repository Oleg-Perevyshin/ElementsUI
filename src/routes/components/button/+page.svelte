<script lang="ts">
  import { Button } from '$lib'
  import ButtonProps from '$lib/Button/ButtonProps.svelte'
  import type { IButtonProps, Position, UIComponent } from '$lib/types'

  let buttonComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Button',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      componentClass: 'bg-red py-1',
      content: {
        name: 'Button',
      },
      eventHandler: { Header: 'SET', Argument: 'Save', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  // let selectedComponentId = $state<string | null>(components[0].id)
  // let selectedComponent = $derived(selectedComponentId ? components.find((c) => c.id === selectedComponentId) : null)

  const updateComponent = (
    id: string,
    updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>,
  ) => {
    buttonComponent = {
      ...buttonComponent,
      position: updates.position ? { ...buttonComponent.position, ...updates.position } : buttonComponent.position,
      parentId: updates.parentId ?? buttonComponent.parentId,
      properties: updates.properties ? { ...buttonComponent.properties, ...updates.properties } : buttonComponent.properties,
    }
  }
</script>

<Button {...buttonComponent.properties as IButtonProps} />

<ButtonProps
  component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
  onPropertyChange={(value) => updateComponent(buttonComponent.id, { properties: value } as object)}
/>

<!-- <div class="code-block">
  <pre>{`
  <Button 
  name={${(buttonComponent.properties as IButtonProps).name ?? ''}} 
  />
  `}</pre>
</div> -->
