<!-- $lib/WidgetFileSystem/WidgetFileSystemProps.svelte — панель пропсов конструктора для
     WidgetFileSystem: заголовок/мастер-цвет/префикс группы, имена полей устройства (keys),
     фильтр закачки и команды обновления/удаления — все с дефолтами, равными прошивочной
     конвенции (см. DEFAULT_PROPS.WidgetFileSystem в DevCloud). -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetFileSystemProps, type IOption } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import { optionsStore } from "../options"

  const FS_KEYS = ["FSInfo", "UlProg"] as const

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetFileSystemProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()
</script>

{#snippet Command(key: "infoCommand" | "deleteCommand", header: string, argument: string)}
  <UI.Select
    label={{ name: "Заголовок пакета" }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={$optionsStore.HEADER_OPTIONS.find((o) => o.value === (component.properties[key]?.header || header))}
    onUpdate={(option) => updateProperty(`${key}.header`, (option as IOption<string>).value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: "Аргумент" }}
    value={component.properties[key]?.argument ?? argument}
    onUpdate={(value) => updateProperty(`${key}.argument`, value as string, component, onPropertyChange)}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <UI.Input
      label={{ name: "Заголовок" }}
      value={component.properties.label?.name}
      onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Префикс группы (ID)" }}
      value={component.properties.id}
      onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
    />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Закачка файлов">
    <UI.Input
      label={{ name: "Допустимые файлы (accept)" }}
      value={component.properties.accept ?? "*/*"}
      placeholder=".bin, .txt, .pem"
      onUpdate={(value) => updateProperty("accept", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Максимальная длина имени" }}
      type="number"
      number={{ minNum: 1, maxNum: 255, step: 1 }}
      value={component.properties.maxNameLength ?? 31}
      onUpdate={(value) => updateProperty("maxNameLength", Number(value), component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Ключи устройства">
    {#each FS_KEYS as key (key)}
      <UI.Input
        label={{ name: key }}
        value={component.properties.keys?.[key] ?? key}
        onUpdate={(value) => updateProperty(`keys.${key}`, value as string, component, onPropertyChange)}
      />
    {/each}
  </PropsGroup>
  <PropsGroup label="Команда обновления">
    {@render Command("infoCommand", "GET", "FSInfo")}
  </PropsGroup>
  <PropsGroup label="Команда удаления">
    {@render Command("deleteCommand", "SET", "DelFile")}
  </PropsGroup>
</div>
