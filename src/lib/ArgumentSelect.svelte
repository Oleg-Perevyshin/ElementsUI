<!-- $lib/ArgumentSelect.svelte - аргумент команды в свойствах конструктора: выбор из словаря команд с поиском по имени, другое значение не сохраняется -->
<script lang="ts">
  import Select from "./Select/Select.svelte"
  import { T } from "./locales/i18n"
  import { ARGUMENT_NAMES } from "./options"

  let { value, label, wrapperClass = "", onUpdate }: { value?: string; label?: string; wrapperClass?: string; onUpdate: (argument: string) => void } = $props()

  const options = ARGUMENT_NAMES.map((name) => ({ id: name, value: name, name }))
</script>

<Select
  {wrapperClass}
  type="input"
  label={{ name: label ?? $T("constructor.props.argument") }}
  help={{ info: $T("constructor.props.argument.info") }}
  {value}
  {options}
  onUpdate={(selected) => {
    const name = String(selected)
    if (ARGUMENT_NAMES.includes(name)) onUpdate(name)
  }}
/>
