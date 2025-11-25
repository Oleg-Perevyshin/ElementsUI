<script lang="ts">
  import ColorPicker from '$lib/ColorPicker/ColorPicker.svelte'
  import ColorPickerProps from '$lib/ColorPicker/ColorPickerProps.svelte'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import { updateComponent, type IColorPickerProps, type UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let colorPickerComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ColorPicker',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      label: { name: 'Label', class: 'text-center' },
      value: [0, 0, 0],
    },
    eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.ColorPicker
${formatObjectToString(colorPickerComponent.properties as IColorPickerProps)} 
  onChange={() => {}}
/>`)
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <ColorPicker {...colorPickerComponent.properties as IColorPickerProps} />
  {/snippet}
  {#snippet componentProps()}
    <ColorPickerProps
      component={colorPickerComponent as UIComponent & { properties: Partial<IColorPickerProps> }}
      onPropertyChange={(updates) => (colorPickerComponent = updateComponent(colorPickerComponent, updates as object))}
      forConstructor={true}
    />
    <hr />
    <ColorPickerProps
      component={colorPickerComponent as UIComponent & { properties: Partial<IColorPickerProps> }}
      onPropertyChange={(updates) => (colorPickerComponent = updateComponent(colorPickerComponent, updates as object))}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
