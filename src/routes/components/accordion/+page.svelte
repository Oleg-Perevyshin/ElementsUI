<script lang="ts">
  import { Accordion } from "$lib"
  import AccordionProps from "$lib/Accordion/AccordionProps.svelte"
  import { updateComponent, type IAccordionProps, type UIComponent } from "$lib/types"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { ICONS } from "$lib/icons"
  import readmeRaw from "$lib/Accordion/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Accordion",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      isOpen: true,
      size: {
        height: 1,
        width: 1,
      },
      label: {
        name: "Accordion",
        class: "justify-start",
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Accordion
${formatObjectToString(accordionComponent.properties as IAccordionProps)}
>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
</UI.Accordion>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <Accordion {...accordionComponent.properties as IAccordionProps}>
      <div class="flex flex-col">
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
      </div>
    </Accordion>
  {/snippet}
  {#snippet componentProps()}
    <AccordionProps
      component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
      onPropertyChange={(updates) => (accordionComponent = updateComponent(accordionComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <Accordion label={{ name: "Accordion 1", class: "" }} isOpen={false} wrapperClass="col-span-3">
      <div class="flex">
        <Accordion label={{ name: "Accordion 1", class: "" }} isOpen={true} wrapperClass="col-span-3">
          <h6>Содержимое вложенного Accordion 1</h6>
          <h5>Содержимое вложенного Accordion 1</h5>
          <h4>Содержимое вложенного Accordion 1</h4>
          <h3>Содержимое вложенного Accordion 1</h3>
          <h2>Содержимое вложенного Accordion 1</h2>
          <h1>Содержимое вложенного Accordion 1</h1>
        </Accordion>

        <Accordion label={{ name: "Accordion 2", class: "" }} isOpen={false} wrapperClass="col-span-3">
          <h1>Содержимое вложенного Accordion 2</h1>
          <h2>Содержимое вложенного Accordion 2</h2>
          <h3>Содержимое вложенного Accordion 2</h3>
          <h4>Содержимое вложенного Accordion 2</h4>
          <h5>Содержимое вложенного Accordion 2</h5>
        </Accordion>
      </div>
    </Accordion>

    <Accordion label={{ name: "Accordion 2", class: "", icon: ICONS[4][1][2] }} isOpen={false} wrapperClass="col-span-3">
      <h4>Содержимое вложенного Accordion 3</h4>
      <h3>Содержимое вложенного Accordion 3</h3>
      <h2>Содержимое вложенного Accordion 3</h2>
      <h1>Содержимое вложенного Accordion 3</h1>
    </Accordion>

    <!-- Режим с фоновой картинкой (image) — сетка становится полупрозрачной поверх неё -->
    <Accordion
      label={{ name: "Accordion с фоном (image)", class: "" }}
      isOpen={true}
      wrapperClass="col-span-3"
      size={{ width: 2, height: 1 }}
      image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%231b63d8'/%3E%3Cstop offset='1' stop-color='%236b3fc4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='100' fill='url(%23g)'/%3E%3C/svg%3E"
    >
      <p class="font-semibold text-white">Слева</p>
      <p class="font-semibold text-white">Справа</p>
    </Accordion>
  {/snippet}
</ComponentExample>
