<script lang="ts">
  import { type IJoystickProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Joystick from '$lib/Joystick/Joystick.svelte'
  import { formatObjectToString } from '../../common'

  let joystickComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Joystick',

    properties: {
      id: crypto.randomUUID(),

      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let value: number[] = $state([0, 0, 0])

  let codeText = $derived(`
<UI.Joystick
${formatObjectToString(joystickComponent.properties as IJoystickProps)} 
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    joystickComponent = {
      ...joystickComponent,
      properties: updates.properties ? { ...joystickComponent.properties, ...updates.properties } : joystickComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Joystick label={{ name: 'Joystick' }} bind:value />
  {/snippet}
  {#snippet componentProps()}
    <p>{value}</p>
    <!-- <ProgressBarProps
      component={joystickComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    /> -->
  {/snippet}
</ComponentExample>
