<script lang="ts">
  import { type ITextFieldProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { ICONS_ARRAY } from "$lib/icons"
  import { updateComponent, type IWidgetProps } from "$lib/types"
  import Widget from "$lib/Widget/Widget.svelte"
  import WidgetProps from "$lib/Widget/WidgetProps.svelte"
  import { formatObjectToString } from "../../common"

  let widgetComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Widget",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Пропеллер" },
      icons: { array: ICONS_ARRAY[2][1], mode: "cycling", class: "text-[#333] dark:text-[#e2e3e7]" },
      settings: {
        label: "Скорость",
        class: "bg-blue",
        type: "slider",
        number: {
          minNum: 0,
          maxNum: 100,
          step: 1,
          units: "м/с",
        },
        switch: {
          // captionLeft: "Off",
          // captionRight: "On",
        },
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.TextField
${formatObjectToString(widgetComponent.properties as ITextFieldProps)} 
/>`)
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto size-70">
      <Widget {...widgetComponent.properties as IWidgetProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetProps
      component={widgetComponent as UIComponent & { properties: Partial<IWidgetProps> }}
      onPropertyChange={(updates) => (widgetComponent = updateComponent(widgetComponent, updates as object))}
      {forConstructor}
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
