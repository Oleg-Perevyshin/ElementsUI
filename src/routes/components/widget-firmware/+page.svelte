<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetFirmwareProps, type WidgetFirmwareSource, type WidgetFirmwareStage } from "#lib/types.ts"
  import WidgetFirmware from "#lib/WidgetFirmware/WidgetFirmware.svelte"
  import WidgetFirmwareProps from "#lib/WidgetFirmware/WidgetFirmwareProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetFirmware/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const versions = [
    { value: 105, name: "1.05" },
    { value: 106, name: "1.06" },
    { value: 110, name: "1.10" },
  ]
  let current = $state(105)

  /* Имитация обновления: этапы прямого обновления, версия 106 падает на записи */
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const simulate = async (source: WidgetFirmwareSource, onProgress: (stage: WidgetFirmwareStage, percent: number) => void) => {
    onProgress("bootloader", 0)
    await wait(800)
    onProgress("erase", 0)
    await wait(600)
    for (let p = 0; p <= 100; p += 10) {
      if ("VerFW" in source && source.VerFW === 106 && p === 60) throw new Error("Загрузчик ответил ошибкой (FirmwareUpgradeChunk): ER!")
      onProgress("write", p)
      await wait(150)
    }
    onProgress("verify", 100)
    await wait(500)
    if ("VerFW" in source) current = source.VerFW
  }

  let firmwareComponent: UIComponent<"WidgetFirmware"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetFirmware",
    access: "full",
    properties: { label: { name: "" }, accept: ".bin" },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetFirmware
${formatObjectToString(firmwareComponent.properties as IWidgetFirmwareProps)}
value={{ DevFW }}
versions={versions}
sources={{ version: true, file: true }}
onUpdate={handleUpdate}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetFirmware
        {...localizeDeep(firmwareComponent.properties, $Language) as IWidgetFirmwareProps}
        value={{ DevFW: current }}
        {versions}
        sources={{ version: true, file: true }}
        onUpdate={simulate}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetFirmwareProps component={firmwareComponent} onPropertyChange={(updates) => (firmwareComponent = applyPropertyChange(firmwareComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetFirmware accent="blue" label={{ name: "Без приложения (конструктор)" }} value={{ DevFW: 105 }} {versions} />
    </div>
  {/snippet}
</ComponentExample>
