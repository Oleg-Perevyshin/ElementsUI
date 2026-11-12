<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { Accordion } from "#lib"
  import AccordionProps from "#lib/Accordion/AccordionProps.svelte"
  import { type IAccordionProps, type UIComponent } from "#lib/types.ts"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { ICONS } from "#lib/icons.ts"
  import readmeRaw from "#lib/Accordion/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let accordionComponent: UIComponent<"Accordion"> = $state({
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

  let codeText = $derived(`
<UI.Accordion
${formatObjectToString(accordionComponent.properties as IAccordionProps)}
>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
</UI.Accordion>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <!-- isOpen - только через привязку: из развёрнутых свойств он перекрыл бы её -->
    {@const { isOpen: _isOpen, ...accordionProps } = localizeDeep(accordionComponent.properties, $Language) as IAccordionProps}
    <Accordion
      {...accordionProps}
      bind:isOpen={
        () => (accordionComponent.properties as IAccordionProps).isOpen ?? false,
        (isOpen) => (accordionComponent = applyPropertyChange(accordionComponent, { properties: { isOpen } }))
      }
    >
      <div class="flex flex-col">
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
      </div>
    </Accordion>
  {/snippet}
  {#snippet componentProps()}
    <AccordionProps component={accordionComponent} onPropertyChange={(updates) => (accordionComponent = applyPropertyChange(accordionComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <Accordion label={{ name: "Accordion 1" }} isOpen={false} wrapperClass="col-span-3">
      <div class="flex">
        <Accordion label={{ name: "Accordion 1" }} isOpen={true} wrapperClass="col-span-3">
          <h6>Содержимое вложенного Accordion 1</h6>
          <h5>Содержимое вложенного Accordion 1</h5>
          <h4>Содержимое вложенного Accordion 1</h4>
          <h3>Содержимое вложенного Accordion 1</h3>
          <h2>Содержимое вложенного Accordion 1</h2>
          <h1>Содержимое вложенного Accordion 1</h1>
        </Accordion>

        <Accordion label={{ name: "Accordion 2" }} isOpen={false} wrapperClass="col-span-3">
          <h1>Содержимое вложенного Accordion 2</h1>
          <h2>Содержимое вложенного Accordion 2</h2>
          <h3>Содержимое вложенного Accordion 2</h3>
          <h4>Содержимое вложенного Accordion 2</h4>
          <h5>Содержимое вложенного Accordion 2</h5>
        </Accordion>
      </div>
    </Accordion>

    <Accordion label={{ name: "Accordion 2", icon: ICONS[4][1][2] }} isOpen={false} wrapperClass="col-span-3">
      <h4>Содержимое вложенного Accordion 3</h4>
      <h3>Содержимое вложенного Accordion 3</h3>
      <h2>Содержимое вложенного Accordion 3</h2>
      <h1>Содержимое вложенного Accordion 3</h1>
    </Accordion>

    <!-- Полоса слева (stripe), без рамки (outline=false), на всю высоту родителя (fill) -->
    <Accordion label={{ name: "Полоса слева (stripe)" }} accent="purple" stripe isOpen={true} componentClass="shadow-(--elevation-1)">
      <p>Цветная полоса цветом метки accent, рамка с радиусом 15</p>
    </Accordion>
    <div class="rounded-[14px] border border-dashed border-(--border-color)">
      <Accordion label={{ name: "Без рамки (outline=false)" }} accent="green" outline={false} isOpen={true}>
        <p>Блок внутри своей карточки</p>
      </Accordion>
    </div>
    <div class="flex h-64 flex-col gap-2 rounded-xl border border-dashed border-(--border-color) p-2">
      <Accordion label={{ name: "fill - на всю высоту" }} accent="cyan" stripe fill isOpen={true}>
        <div class="h-full overflow-y-auto rounded-lg bg-(--container-color) p-2">Содержимое растягивается до низа родителя</div>
      </Accordion>
    </div>

    <!-- Режим с фоновой картинкой (image) - сетка становится полупрозрачной поверх неё -->
    <Accordion
      label={{ name: "Accordion с фоном (image)" }}
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
