<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte - панель пропсов конструктора для WidgetDeviceInfo: заголовок/мастер-цвет/префикс группы, поля списком: галочка - показывать (show), рядом у включённых - ключ поля в прошивке (keys) и команды перезагрузки и сброса - все с дефолтами, равными текущей прошивочной конвенции (COMPONENT_DEFAULTS). -->
<script lang="ts">
  import { DEVICE_INFO_DEFAULT_FIELDS, WIDGET_FIELDS } from "../gui"
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetDeviceInfoProps, IWidgetDeviceInfoConfig } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { ARGUMENT_MAX_LENGTH, ARGUMENT_REGEXP, optionsStore } from "../options"

  const DEVICE_INFO_KEYS = Object.keys(WIDGET_FIELDS.WidgetDeviceInfo) as (keyof IWidgetDeviceInfoConfig)[]

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetDeviceInfo">
    onPropertyChange: (change: PropertyChange<IWidgetDeviceInfoProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const shown = $derived(new Set<string>(component.properties.show ?? DEVICE_INFO_DEFAULT_FIELDS))

  /* Порядок show - как в списке полей, а не как щёлкали */
  const toggleField = (key: keyof IWidgetDeviceInfoConfig, on: boolean) =>
    edit.set(
      "show",
      DEVICE_INFO_KEYS.filter((field) => (field === key ? on : shown.has(field))),
    )
</script>

<!-- Поле - строка: галочка с именем, у включённого рядом ключ в прошивке; выключенные - одной строкой без ключа -->
{#snippet WidgetFields()}
  {#each DEVICE_INFO_KEYS as key (key)}
    <div class="flex h-8 items-center gap-2">
      <UI.Switch
        type="checkbox"
        wrapperClass="w-28 shrink-0 justify-start"
        label={{ name: key }}
        value={shown.has(key) ? 1 : 0}
        onUpdate={(value) => toggleField(key, value === 1)}
      />
      {#if shown.has(key)}
        <UI.Input
          wrapperClass="min-w-0 flex-1"
          value={component.properties.keys?.[key] ?? key}
          onUpdate={(value) => edit.patch("keys", { [key]: String(value) })}
        />
      {/if}
    </div>
  {/each}
{/snippet}

{#snippet WidgetCommand(path: "restartCommand" | "resetCommand", defaultArgument: string)}
  <UI.Select
    label={{ name: $T("widget.common.packet_header") }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={component.properties[path]?.header || "SET"}
    onUpdate={(header) => edit.patch(path, { header })}
  />
  <UI.Input
    label={{ name: $T("widget.common.argument") }}
    value={component.properties[path]?.argument ?? defaultArgument}
    maxlength={ARGUMENT_MAX_LENGTH}
    help={{ info: $T("constructor.props.argument.info"), regExp: ARGUMENT_REGEXP }}
    onUpdate={(value) => edit.patch(path, { argument: String(value) })}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input label={{ name: $T("widget.common.group_prefix") }} value={component.properties.id} onUpdate={(value) => edit.set("id", value as string)} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.info.fields")}>
    <UI.FieldLabel label={{ name: $T("widget.info.fields.list") }} info={$T("widget.info.fields.info")} />
    {@render WidgetFields()}
  </PropsGroup>
  <PropsGroup label={$T("widget.info.restart_command")}>
    {@render WidgetCommand("restartCommand", "Restart")}
  </PropsGroup>
  <PropsGroup label={$T("widget.info.reset_command")}>
    {@render WidgetCommand("resetCommand", "RstNVS")}
  </PropsGroup>
</div>
