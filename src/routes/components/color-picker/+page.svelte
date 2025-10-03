<script lang="ts">
  import ColorPicker from '$lib/ColorPicker/ColorPicker.svelte'
  import type { IColorPickerProps, UIComponent } from '$lib/types'

  let colorPickerComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'ColorPicker',
    component: null,
    properties: {
      id: { name: '', value: crypto.randomUUID() },
      wrapperClass: '',
      label: { name: 'Label', class: 'text-center' },
      value: [0, 0, 0],
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
    eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    colorPickerComponent = {
      ...colorPickerComponent,
      properties: updates.properties ? { ...colorPickerComponent.properties, ...updates.properties } : colorPickerComponent.properties,
    }
  }
</script>

<div>
  <ColorPicker {...colorPickerComponent.properties as IColorPickerProps} />

  <!-- <ColorPickerProps
    component={colorPickerComponent as UIComponent & { properties: Partial<IColorPickerProps> }}
    onPropertyChange={(value) => updateComponent(colorPickerComponent.id, { properties: value } as object)}
    forConstructor={false}
  /> -->
</div>
