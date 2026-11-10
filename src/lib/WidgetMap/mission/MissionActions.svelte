<!-- $lib/WidgetMap/mission/MissionActions.svelte - выгрузка миссии режимов «Маршрут» и «Агро»: скачать файл .waypoints, скопировать текст, отправить владельцу карты -->
<script lang="ts">
  import { T } from "../../locales/i18n"
  import { hint } from "../../hints"
  import Button from "../../Button/Button.svelte"
  import { copyText } from "../../clipboard"

  let {
    text,
    name,
    disabled = false,
    hints = false,
    onSend,
  }: {
    text: string /* Текст миссии QGC WPL 110 */
    name: string /* Начало имени файла: name_ГГГГММДДЧЧММ.waypoints */
    disabled?: boolean
    hints?: boolean
    onSend?: (text: string) => void | Promise<void>
  } = $props()

  const download = () => {
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    a.download = `${name}_${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}.waypoints`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  let copied = $state(false)
  const copy = async () => {
    if (!(await copyText(text))) return
    copied = true
    setTimeout(() => (copied = false), 1000)
  }

  let sendState: "idle" | "busy" | "done" | "error" = $state("idle")
  const send = async () => {
    if (!onSend || sendState === "busy") return
    sendState = "busy"
    try {
      await onSend(text)
      sendState = "done"
    } catch {
      sendState = "error"
    }
    setTimeout(() => (sendState = "idle"), 1500)
  }

  let off = $derived(disabled || !text)
</script>

<div class="grid grid-cols-3 gap-3">
  <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.download"), enabled: hints }}>
    <Button variant="primary" content={{ name: $T("widget.mission.download") }} disabled={off} onClick={download} />
  </div>
  <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.copy"), enabled: hints }}>
    <Button variant="primary" content={{ name: $T(copied ? "widget.mission.copied" : "widget.mission.copy") }} disabled={off} onClick={copy} />
  </div>
  <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.send"), enabled: hints }}>
    <Button
      variant="primary"
      accent={sendState === "error" ? "red" : undefined}
      content={{ name: $T(`widget.mission.send.${sendState}`) }}
      disabled={off || !onSend || sendState === "busy"}
      onClick={send}
    />
  </div>
</div>
