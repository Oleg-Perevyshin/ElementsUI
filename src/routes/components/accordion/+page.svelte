<script lang="ts">
  import { Accordion } from "$lib"
  import AccordionProps from "$lib/Accordion/AccordionProps.svelte"
  import { updateComponent, type IAccordionProps, type Position, type UIComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Accordion",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      isOpen: true,
      outline: false,
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

<ComponentExample {codeText} bind:forConstructor>
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

    <Accordion label={{ name: "Accordion 3", class: "" }} isOpen={false} wrapperClass="col-span-3">
      <h4>Содержимое вложенного Accordion 3</h4>
      <h3>Содержимое вложенного Accordion 3</h3>
      <h2>Содержимое вложенного Accordion 3</h2>
      <h1>Содержимое вложенного Accordion 3</h1>
    </Accordion>
  {/snippet}
</ComponentExample>
