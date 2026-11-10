<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type ISliderProps, type UIComponent } from "#lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import Slider from "#lib/Slider/Slider.svelte"
  import SliderProps from "#lib/Slider/SliderProps.svelte"
  import { formatObjectToString, RenderMarkdown, applyChange } from "../../common"
  import readmeRaw from "#lib/Slider/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let sliderComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Slider",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      accent: "blue",
      label: { name: "Label", class: "text-center" },
      value: 3,
      type: "single",
      number: { minNum: 0, maxNum: 10, step: 1.2 },
      disabled: false,
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Slider
${formatObjectToString(sliderComponent.properties as ISliderProps)} 
  onUpdate={() => {}}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <Slider
      {...localizeDeep(sliderComponent.properties, $Language) as ISliderProps}
      onUpdate={(value: number | [number, number]) => (sliderComponent = applyChange(sliderComponent, { properties: { value } }))}
    />
  {/snippet}
  {#snippet componentProps()}
    <SliderProps
      component={sliderComponent as UIComponent & { properties: Partial<ISliderProps> }}
      onPropertyChange={(updates) => (sliderComponent = applyChange(sliderComponent, updates))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex gap-2">
      <Slider accent="red" wrapperClass="!w-1/3 px-2" label={{ name: "Слайдер" }} value={0} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
      <Slider
        accent="blue"
        wrapperClass="!w-1/3 px-2"
        label={{ name: "Слайдер с диапазоном" }}
        value={[-12, 35]}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
      <Slider
        accent="blue"
        wrapperClass="!w-1/3 px-2"
        label={{ name: "Слайдер с диапазоном (не активный)" }}
        value={[-10, 12]}
        number={{ minNum: -15, maxNum: 15, step: 1 }}
        disabled={true}
      />
    </div>
    <div class="flex gap-2">
      <Slider
        accent="green"
        wrapperClass="!w-1/2 px-2"
        label={{ name: "Слайдер" }}
        value={-10}
        number={{ minNum: -25, maxNum: 25, step: 1 }}
        disabled={false}
      />
      <Slider
        accent="yellow"
        wrapperClass="!w-1/2 px-2"
        label={{ name: "Слайдер" }}
        value={-25}
        number={{ minNum: -50, maxNum: 50, step: 1 }}
        disabled={false}
      />
    </div>
    <div class="flex gap-2">
      <Slider accent="purple" wrapperClass="!w-1/2 px-2" label={{ name: "Слайдер" }} value={0} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
      <Slider accent="red" wrapperClass="!w-1/2 px-2" label={{ name: "Слайдер" }} value={25} number={{ minNum: -50, maxNum: 50, step: 1 }} disabled={false} />
    </div>
  {/snippet}
</ComponentExample>
