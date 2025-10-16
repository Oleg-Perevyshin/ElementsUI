<script lang="ts">
  import { Accordion, Button } from '$lib'
  import ButtonProps from '$lib/Button/ButtonProps.svelte'
  import type { IButtonProps, Position, UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'
  import CopyButton from '$lib/libIcons/CopyButton.svelte'

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

  let codeText = $derived(`
<UI.Button
${formatObjectToString(buttonComponent.properties as IButtonProps)} 
/>`)

  const updateComponent = (updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>) => {
    buttonComponent = {
      ...buttonComponent,
      properties: updates.properties ? { ...buttonComponent.properties, ...updates.properties } : buttonComponent.properties,
    }
  }
</script>

<div class="relative h-full">
  <div class="py-6">
    <Button {...buttonComponent.properties as IButtonProps} />
  </div>

  <div class="absolute inset-x-0 bottom-0 w-full">
    <ButtonProps
      component={buttonComponent as UIComponent & { properties: Partial<IButtonProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />

    <div class="relative my-4">
      <Button wrapperClass="absolute top-3 right-5 w-6" content={{ icon: CopyButton }} onClick={() => navigator.clipboard.writeText(codeText)} />
      <pre class="overflow-x-auto">{codeText}
  </pre>
    </div>
  </div>
</div>
