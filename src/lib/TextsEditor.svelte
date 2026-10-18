<!-- $lib/TextsEditor.svelte — пункт панели свойств «Тексты и переводы»: кнопка и модальное окно со всеми текстами компонента
     (надпись, подписи, варианты, вкладки, колонки...) × RU/EN/ZH. Тексты собираются из свойств автоматически (collectTexts),
     поэтому окно одно на все компоненты; окна свойств сами тексты не показывают и не правят. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { collectTexts, packLocalized, setAtPath, type TextPath } from "$lib/locales/localize"
  import { DEFAULT_LANGUAGE, LANGUAGE_CODES, type LanguageCode } from "$lib/locales/languages"
  import Button from "./Button/Button.svelte"
  import Input from "./Input/Input.svelte"
  import Modal from "./Modal.svelte"
  import type { IUIComponentHandler, UIComponent } from "./types"

  let {
    component,
    onPropertyChange,
  }: {
    component: UIComponent
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
  } = $props()

  type Row = { path: TextPath; values: Partial<Record<LanguageCode, string>> }

  /* Поля, которые у конкретного типа не текст для перевода: у Switch варианты — короткие метки битов битового режима */
  const NOT_TEXTS: Partial<Record<string, string[]>> = { Switch: ["options"] }

  let isOpen = $state(false)
  let rows: Row[] = $state([])

  /* Подпись строки из пути: числа — порядковый номер у предыдущего сегмента, конечные name/text у вложенного поля опускаются */
  const rowLabel = (path: TextPath) => {
    const parts: string[] = []
    path.forEach((segment, i) => {
      if (typeof segment === "number") parts[parts.length - 1] = `${parts[parts.length - 1]} ${segment + 1}`
      else if (!((segment === "name" || segment === "text") && i > 0 && i === path.length - 1)) {
        const name = $T(`constructor.texts.${segment}`)
        parts.push(name === `constructor.texts.${segment}` ? segment : name)
      }
    })
    return parts.join(" · ")
  }

  const open = () => {
    const skip = NOT_TEXTS[component.type] ?? []
    rows = collectTexts(component.properties)
      .filter(({ path }) => !skip.includes(String(path[0])))
      .map(({ path, text }) => ({ path, values: typeof text === "string" ? { [DEFAULT_LANGUAGE]: text } : { ...text } }))
    isOpen = true
  }

  const save = () => {
    const properties = rows.reduce((props, row) => setAtPath(props, row.path, packLocalized(row.values)), component.properties as object)
    onPropertyChange({ properties })
    isOpen = false
  }
</script>

<Button wrapperClass="w-full" componentClass="bg-blue" content={{ name: $T("constructor.texts.button") }} onClick={open} />

<Modal title={$T("constructor.texts.button")} bind:isOpen wrapperClass="w-200">
  {#snippet main()}
    {#if rows.length}
      <div class="grid grid-cols-[minmax(8rem,auto)_1fr_1fr_1fr] items-center gap-x-3 gap-y-2">
        <span></span>
        {#each LANGUAGE_CODES as lang (lang)}
          <span class="text-center text-[12px] font-semibold text-(--muted-color) uppercase">{lang}</span>
        {/each}
        {#each rows as row, index (row.path.join("."))}
          <span class="text-[13px] font-semibold">{rowLabel(row.path)}</span>
          {#each LANGUAGE_CODES as lang (lang)}
            <Input
              value={row.values[lang] ?? ""}
              placeholder={lang === DEFAULT_LANGUAGE ? "" : row.values[DEFAULT_LANGUAGE]}
              onUpdate={(value) => (rows[index].values[lang] = String(value))}
            />
          {/each}
        {/each}
      </div>
      <p class="mt-3 text-[12px] text-(--muted-color)">{$T("constructor.texts.hint")}</p>
    {:else}
      <p class="text-[13px] text-(--muted-color)">{$T("constructor.texts.empty")}</p>
    {/if}
  {/snippet}
  {#snippet footer()}
    <Button wrapperClass="w-40" componentClass="bg-green" content={{ name: $T("constructor.texts.save") }} disabled={!rows.length} onClick={save} />
  {/snippet}
</Modal>
