<script lang="ts">
  import { type ISliderProps, type UIComponent } from '$lib'
  import Slider from '$lib/Slider/Slider.svelte'
  import SliderProps from '$lib/Slider/SliderProps.svelte'

  let sliderComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Slider',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      value: 5,
      number: { minNum: 0, maxNum: 10, step: 1 },
      disabled: false,
      eventHandler: { Header: 'SET', Argument: 'NoSave', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    sliderComponent = {
      ...sliderComponent,
      properties: updates.properties ? { ...sliderComponent.properties, ...updates.properties } : sliderComponent.properties,
    }
  }
</script>

<Slider {...sliderComponent.properties as ISliderProps} />

<SliderProps
  component={sliderComponent as UIComponent & { properties: Partial<ISliderProps> }}
  onPropertyChange={(value) => updateComponent(sliderComponent.id, { properties: value } as object)}
/>
