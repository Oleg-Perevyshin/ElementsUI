<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { Button, ProgressBar, type IProgressBarProps, type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import ProgressBarProps from "#lib/ProgressBar/ProgressBarProps.svelte"
  import { type IReceivingDataObject } from "#lib/types.ts"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/ProgressBar/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let progressBarComponent: UIComponent<"ProgressBar"> = $state({
    id: crypto.randomUUID(),
    type: "ProgressBar",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      type: "horizontal",
      items: [],
      value: [],
      number: { minNum: 0, maxNum: 100, units: "%" },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.ProgressBar
${formatObjectToString(progressBarComponent.properties as IProgressBarProps)} 
/>`)
  let progressBarValue: IReceivingDataObject[] = $state([{ Name: "progress", Value: 66 }])
  let verticalValue: IReceivingDataObject[] = $state([
    { Name: "CPU", Value: 42 },
    { Name: "RAM", Value: 78 },
    { Name: "Flash", Value: 15 },
  ])
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <ProgressBar {...localizeDeep(progressBarComponent.properties, $Language) as IProgressBarProps} />
  {/snippet}
  {#snippet componentProps()}
    <ProgressBarProps
      component={progressBarComponent}
      onPropertyChange={(updates) => (progressBarComponent = applyPropertyChange(progressBarComponent, updates))}
    />
  {/snippet}
  {#snippet examples()}
    <ProgressBar value={progressBarValue} accent="red" />
    <div class="flex justify-center">
      <Button
        wrapperClass="m-2 !w-10"
        content={{ name: "-" }}
        variant="primary"
        accent="purple"
        componentClass="h-10 rounded-full"
        onClick={() => {
          if (progressBarValue[0] && typeof progressBarValue[0].Value === "number") progressBarValue[0].Value -= 5
        }}
      />
      <Button
        wrapperClass="m-2 !w-10"
        content={{ name: "+" }}
        variant="primary"
        accent="purple"
        componentClass="h-10 rounded-full"
        onClick={() => {
          if (progressBarValue[0] && typeof progressBarValue[0].Value === "number") progressBarValue[0].Value += 5
        }}
      />
    </div>
    <div class="flex h-40 justify-center gap-6">
      <ProgressBar type="vertical" accent="green" items={[{ name: "CPU" }, { name: "RAM" }, { name: "Flash" }]} value={verticalValue} />
    </div>
  {/snippet}
</ComponentExample>
