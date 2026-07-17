<script lang="ts">
  import { type ISwitchProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Switch from "$lib/Switch/Switch.svelte"
  import SwitchProps from "$lib/Switch/SwitchProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/Switch/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let switchComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Switch",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      disabled: false,
      height: "2rem",
      type: "horizontal",
      bitMode: false,
      label: { name: "Label", captionLeft: "Off", captionRight: "On" },
      value: 1,
      options: [
        { id: crypto.randomUUID(), value: 0, name: "0", class: "bg-red", disabled: false },
        { id: crypto.randomUUID(), value: 5, name: "5", class: "bg-green", disabled: false },
      ],
    },
    eventHandler: { Header: "SET", Argument: "NoSend", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Switch
${formatObjectToString(switchComponent.properties as ISwitchProps)} 
  onChange={() => {}}
/>`)
  let switchValue = $state(0)
  let fullSwitchValue = $state(10)
  let highBitValue = $state(0)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="my-10 flex w-full justify-center">
      <Switch wrapperClass={(switchComponent.properties as ISwitchProps).bitMode ? "w-fit" : ""} {...switchComponent.properties as ISwitchProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <SwitchProps
      component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
      onPropertyChange={(updates) => (switchComponent = updateComponent(switchComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex items-center justify-between">
      <Switch
        wrapperClass="w-1/3"
        label={{ name: "Переключатель 1", captionLeft: "Off", captionRight: "On" }}
        bind:value={switchValue}
        options={[{ id: crypto.randomUUID(), value: 0, class: "bg-blue" }]}
      />
      <Switch
        wrapperClass="w-1/3"
        label={{ name: "Переключатель 2" }}
        type="vertical"
        bind:value={switchValue}
        options={[{ id: crypto.randomUUID(), value: 0, class: "bg-red" }]}
      />
      <Switch
        wrapperClass="bg-yellow w-1/3"
        label={{ name: "Галочка" }}
        type="checkbox"
        bind:value={switchValue}
        options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
      />
    </div>
    <span>Выбранное значение: {switchValue}</span>
    <div class="mt-4 flex justify-center">
      <Switch
        wrapperClass="bg-yellow w-1/3"
        label={{ name: "Битовый режим" }}
        type="vertical"
        bitMode
        bind:value={fullSwitchValue}
        options={[
          { id: crypto.randomUUID(), value: 3, class: "bg-green" },
          { id: crypto.randomUUID(), value: 2, class: "bg-green" },
          { id: crypto.randomUUID(), value: 1, class: "bg-purple" },
          { id: crypto.randomUUID(), value: 0, class: "bg-purple" },
        ]}
      />
    </div>
    <span> Выбранное значение в битовом режиме: {fullSwitchValue} </span>

    <!-- Регрессионный пример: биты 29/30/31 (старший, знаковый бит int32) — проверка, что переключение
         одного флага не задевает соседние (баг из-за Math.abs на 32-битных знаковых операциях) -->
    <div class="mt-4 flex justify-center">
      <Switch
        wrapperClass="bg-yellow w-1/2"
        label={{ name: "Управление датчиками (биты 29/30/31)" }}
        bitMode
        bind:value={highBitValue}
        options={[
          { id: crypto.randomUUID(), value: 29, name: "A", class: "bg-blue" },
          { id: crypto.randomUUID(), value: 31, name: "T", class: "bg-red" },
          { id: crypto.randomUUID(), value: 30, name: "G", class: "bg-blue" },
        ]}
      />
    </div>
    <span> Выбранное значение (биты 29-31): {highBitValue} </span>
  {/snippet}
</ComponentExample>
