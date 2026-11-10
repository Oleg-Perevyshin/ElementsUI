<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { ICONS_ARRAY } from "#lib/icons.ts"
  import { type IWidgetProps } from "#lib/types.ts"
  import Widget from "#lib/Widget/Widget.svelte"
  import WidgetProps from "#lib/Widget/WidgetProps.svelte"
  import { formatObjectToString, RenderMarkdown, applyChange } from "../../common"
  import readmeRaw from "#lib/Widget/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let widgetComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Widget",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Пропеллер" },
      accent: "blue",
      icons: { array: ICONS_ARRAY[2][1], cycling: true },
      settings: {
        label: "Скорость",
        type: "slider",
        number: {
          minNum: 0,
          maxNum: 100,
          step: 1,
          units: "м/с",
        },
      },
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Widget
${formatObjectToString(widgetComponent.properties as IWidgetProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto size-70">
      <Widget
        {...localizeDeep(widgetComponent.properties, $Language) as IWidgetProps}
        onUpdate={(value) => (widgetComponent = applyChange(widgetComponent, { properties: { value } }))}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetProps
      component={widgetComponent as UIComponent & { properties: Partial<IWidgetProps> }}
      onPropertyChange={(updates) => (widgetComponent = applyChange(widgetComponent, updates))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex">
      <Widget
        wrapperClass="m-auto size-70"
        label={{ name: "Пропеллер" }}
        icons={{ array: ICONS_ARRAY[2][1], cycling: true }}
        settings={{ label: "Скорость", number: { minNum: 0, maxNum: 10, step: 1, units: "м/с" }, type: "input" }}
      />
      <Widget
        wrapperClass="m-auto size-70"
        label={{ name: "Заряд" }}
        icons={{ array: ICONS_ARRAY[0][1], cycling: false }}
        settings={{ number: { minNum: 0, maxNum: 100, step: 1, units: "%" }, type: "slider" }}
      />
      <Widget wrapperClass="m-auto size-70" label={{ name: "Лампочка" }} icons={{ array: ICONS_ARRAY[1][1], cycling: false }} settings={{ type: "switch" }} />
    </div>
  {/snippet}
</ComponentExample>
