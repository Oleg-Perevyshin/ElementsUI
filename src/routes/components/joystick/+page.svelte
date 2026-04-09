<script lang="ts">
  import { type IJoystickProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Joystick from "$lib/Joystick/Joystick.svelte"
  import JoystickProps from "$lib/Joystick/JoystickProps.svelte"
  import IconGripVerticalDual from "$lib/libIcons/IconGripVerticalDual.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"

  let joystickComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Joystick",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Label", class: "text-center" },
      axes: [
        { name: "Pitch", minNum: -100, maxNum: 100 },
        { name: "Roll", minNum: -100, maxNum: 100 },
        { name: "Yaw", minNum: -100, maxNum: 100 },
      ],
    },
    eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Joystick
${formatObjectToString(joystickComponent.properties as IJoystickProps)} 
/>`)
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <Joystick {...joystickComponent.properties as IJoystickProps} />
  {/snippet}
  {#snippet componentProps()}
    <JoystickProps
      component={joystickComponent as UIComponent & { properties: Partial<IJoystickProps> }}
      onPropertyChange={(updates) => (joystickComponent = updateComponent(joystickComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex">
      <Joystick label={{ name: "Управление по 3 осям" }} isHomeButton />
      <Joystick
        label={{ name: "Управление по 2 осям" }}
        axes={[{ name: "Pitch", minNum: -100, maxNum: 100 }, { name: "" }, { name: "Yaw", minNum: -100, maxNum: 100 }]}
        buttonIcon={IconGripVerticalDual}
      />
    </div>
  {/snippet}
</ComponentExample>
