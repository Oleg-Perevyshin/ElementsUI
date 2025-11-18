<script lang="ts">
  import { Accordion, Button } from '$lib'
  import type { IButtonProps, Position, UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import ButtonProps from '$lib/Button/ButtonProps.svelte'

  let buttonComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Button',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),

      componentClass: 'bg-red py-1',
      content: {
        name: 'Button',
        info: { text: '', side: 'top' },
      },

      eventHandler: { Header: 'SET', Argument: 'Save', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Button
${formatObjectToString(buttonComponent.properties as IButtonProps)} 
  onClick={() => {}}
/>`)

  const updateComponent = (updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>) => {
    buttonComponent = {
      ...buttonComponent,
      properties: updates.properties ? { ...buttonComponent.properties, ...updates.properties } : buttonComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="relative mx-40 my-20">
      <Button {...buttonComponent.properties as IButtonProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
    <hr />
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={true}
    />
  {/snippet}
</ComponentExample>
