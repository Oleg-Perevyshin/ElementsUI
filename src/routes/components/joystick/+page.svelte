<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import type { IJoystickProps, UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import Joystick from "#lib/Joystick/Joystick.svelte"
  import JoystickProps from "#lib/Joystick/JoystickProps.svelte"
  import IconGripVerticalDual from "#lib/libIcons/IconGripVerticalDual.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/Joystick/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let joystickComponent: UIComponent<"Joystick"> = $state({
    id: crypto.randomUUID(),
    type: "Joystick",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      accent: "blue",
      label: { name: "Label", class: "text-center" },
      axes: [
        { name: "Pitch", minNum: -100, maxNum: 100 },
        { name: "Yaw", minNum: -100, maxNum: 100 },
        { name: "Roll", minNum: -100, maxNum: 100 },
      ],
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Joystick
${formatObjectToString(joystickComponent.properties as IJoystickProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <Joystick
      {...localizeDeep(joystickComponent.properties, $Language) as IJoystickProps}
      onUpdate={(value) => (joystickComponent = applyPropertyChange(joystickComponent, { properties: { value } }))}
    />
  {/snippet}
  {#snippet componentProps()}
    <JoystickProps component={joystickComponent} onPropertyChange={(updates) => (joystickComponent = applyPropertyChange(joystickComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex">
      <Joystick label={{ name: "Управление по 3 осям" }} />
      <Joystick
        label={{ name: "Управление по 2 осям" }}
        axes={[{ name: "Pitch", minNum: -100, maxNum: 100 }, { name: "" }, { name: "Yaw", minNum: -100, maxNum: 100 }]}
        buttonIcon={IconGripVerticalDual}
      />
      <Joystick label={{ name: "Только чтение" }} value={[40, -20, 0]} readonly />
    </div>
  {/snippet}
</ComponentExample>
