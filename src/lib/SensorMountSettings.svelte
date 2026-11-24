<!-- $lib/SensorMountSettings.svelte - отдельные углы поворота любого датчика в систему координат корпуса -->
<script lang="ts">
  import * as UI from "."
  import { T } from "./locales/i18n"
  import SectionHead from "./SectionHead.svelte"
  import MountAxesIcon from "./MountAxesIcon.svelte"

  type Mount = { MR: number; MP: number; MY: number }
  type MountKey = keyof Mount

  let {
    title,
    mount,
    onSave,
    locked = false,
  }: {
    title: string
    mount: Mount
    onSave?: (mount: Mount) => void
    locked?: boolean
  } = $props()

  const fields: { key: MountKey; label: string }[] = [
    { key: "MR", label: "widget.sensor.mount.roll" },
    { key: "MP", label: "widget.sensor.mount.pitch" },
    { key: "MY", label: "widget.sensor.mount.yaw" },
  ]
  const presets: { label: string; roll: number; pitch: number; yaw: number }[] = [
    { label: "Z ↑ · XY", roll: 0, pitch: 0, yaw: 0 },
    { label: "Z ↑ · YX ↺", roll: 0, pitch: 0, yaw: 90 },
    { label: "Z ↓ · XY", roll: 180, pitch: 0, yaw: 0 },
    { label: "Z ↓ · YX ↺", roll: 180, pitch: 0, yaw: 90 },
    { label: "X ↑ · YZ", roll: 0, pitch: -90, yaw: 0 },
    { label: "X ↑ · ZY ↺", roll: 0, pitch: -90, yaw: 90 },
    { label: "X ↓ · YZ", roll: 0, pitch: 90, yaw: 0 },
    { label: "X ↓ · ZY ↺", roll: 0, pitch: 90, yaw: 90 },
    { label: "Y ↑ · XZ", roll: 90, pitch: 0, yaw: 0 },
    { label: "Y ↑ · ZX ↺", roll: 90, pitch: 0, yaw: 90 },
    { label: "Y ↓ · XZ", roll: -90, pitch: 0, yaw: 0 },
    { label: "Y ↓ · ZX ↺", roll: -90, pitch: 0, yaw: 90 },
  ]
  let open = $state(false)
  let values = $state<Mount>({ MR: 0, MP: 0, MY: 0 })
  let saved = $state<Mount>({ MR: 0, MP: 0, MY: 0 })
  const dirty = $derived(fields.some(({ key }) => values[key] !== saved[key]))
  const summary = $derived(`${values.MR}° · ${values.MP}° · ${values.MY}°`)

  $effect(() => {
    if (dirty) return
    values = { ...mount }
    saved = { ...mount }
  })

  const update = (key: MountKey, value: number) => {
    values = { ...values, [key]: value }
  }
  const applyPreset = (preset: (typeof presets)[number]) => {
    values = { MR: preset.roll, MP: preset.pitch, MY: preset.yaw }
  }
  const reset = () => {
    values = { MR: 0, MP: 0, MY: 0 }
  }
  const save = () => {
    if (locked || !dirty) return
    onSave?.(values)
    saved = { ...values }
  }
</script>

<div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
  <div class="px-3 py-2"><SectionHead {title} {summary} bind:open /></div>
  {#if open}
    <div class="flex flex-col gap-3 border-t border-(--hairline-color) p-3">
      <p class="text-[12px] leading-snug text-(--muted-color)">{$T("widget.sensor.mount.info")}</p>
      <div class="grid grid-cols-2 gap-2 @[30rem]:grid-cols-4">
        {#each presets as preset (preset.label)}
          <button
            type="button"
            class="flex min-h-22 min-w-0 flex-col items-center justify-center gap-1 rounded-[10px] border border-(--border-color) bg-(--container-color) px-2 py-2 text-[13px] font-semibold text-(--font-color) transition-colors hover:border-(--accent-text) hover:bg-(--field-color) disabled:cursor-not-allowed disabled:opacity-50"
            disabled={locked || !onSave}
            aria-label={preset.label}
            onclick={() => applyPreset(preset)}
          >
            <MountAxesIcon roll={preset.roll} pitch={preset.pitch} yaw={preset.yaw} />
            <span>{preset.label}</span>
          </button>
        {/each}
      </div>
      <div class="grid grid-cols-1 gap-3 @[22rem]:grid-cols-3">
        {#each fields as field (field.key)}
          <UI.Input
            type="number"
            number={{ minNum: -180, maxNum: 180, step: 1 }}
            label={{ name: $T(field.label) }}
            value={values[field.key]}
            disabled={locked || !onSave}
            onUpdate={(value) => update(field.key, Number(value))}
          />
        {/each}
      </div>
      {#if onSave}
        <div class="flex flex-col items-center gap-2">
          <span class="text-[12px] text-(--muted-color) {dirty ? '' : 'invisible'}">{$T("widget.common.unsaved")}</span>
          <div class="flex w-full max-w-80 flex-wrap gap-2">
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              content={{ name: $T("widget.sensor.mount.reset") }}
              disabled={locked}
              onClick={reset}
            />
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              variant="primary"
              content={{ name: $T("widget.common.save") }}
              disabled={locked || !dirty}
              onClick={save}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
