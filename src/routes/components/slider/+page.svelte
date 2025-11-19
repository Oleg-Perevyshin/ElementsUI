<script lang="ts">
  import { type ISliderProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Slider from '$lib/Slider/Slider.svelte'
  import SliderProps from '$lib/Slider/SliderProps.svelte'
  import { formatObjectToString } from '../../common'

  let sliderComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Slider',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      type: 'range',
      value: [2, 5],
      number: { minNum: 0, maxNum: 10, step: 1 },
      disabled: false,
      eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Slider
${formatObjectToString(sliderComponent.properties as ISliderProps)} 
  onUpdate={() => {}}
/>`)

  const updateComponent = (
    updates: Partial<{
      name: string
      access: 'full' | 'viewOnly' | 'hidden'
      properties: Partial<UIComponent['properties']>
    }>,
  ) => {
    sliderComponent = {
      ...sliderComponent,
      access: updates.access ?? sliderComponent.access,
      name: updates.name ?? sliderComponent.name,
      properties: updates.properties ? { ...sliderComponent.properties, ...updates.properties } : sliderComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Slider {...sliderComponent.properties as ISliderProps} />
  {/snippet}
  {#snippet componentProps()}
    <SliderProps
      component={sliderComponent as UIComponent & { properties: Partial<ISliderProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={true}
    />
  {/snippet}
</ComponentExample>
