<script lang="ts">
  import { Dropdown, Input, IconAdd, IconCopy, IconDelete, LANGUAGES, Language, setLanguage, type IDropdownItem } from "#lib"
  import { RenderMarkdown } from "../../common"
  import ComponentExample from "../../ComponentExample.svelte"
  import readmeRaw from "#lib/Dropdown/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* У Dropdown нет панели свойств - простое локальное состояние */
  let lastAction = $state("-")
  const items: IDropdownItem[] = [
    { name: "Добавить", icon: IconAdd, onClick: () => (lastAction = "Добавить") },
    { name: "Копировать", icon: IconCopy, onClick: () => (lastAction = "Копировать") },
    { name: "Недоступно", disabled: true },
    { divider: true },
    { name: "Удалить", icon: IconDelete, accent: "red", onClick: () => (lastAction = "Удалить") },
  ]
  const languageItems: IDropdownItem[] = $derived(LANGUAGES.map((language) => ({ id: language.value, name: language.name, icon: language.flag })))
  const currentFlag = $derived(LANGUAGES.find((language) => language.value === $Language)?.flag ?? "")

  let codeText = $derived(`
<UI.Dropdown
  button={{ variant: "secondary", content: { name: "Действия" } }}
  items={[
    { name: "Добавить", icon: UI.IconAdd, onClick: add },
    { divider: true },
    { name: "Удалить", icon: UI.IconDelete, accent: "red", onClick: remove },
  ]}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="relative mx-40 my-20 flex flex-col items-start gap-3">
      <Dropdown button={{ variant: "secondary", content: { name: "Действия" } }} {items} />
      <span>Последний выбор: {lastAction}</span>
    </div>
  {/snippet}
  {#snippet componentProps()}
    <div class="flex items-center justify-center py-4 text-center opacity-70">Конструктор для этого компонента не реализован</div>
  {/snippet}
  {#snippet examples()}
    <div class="mx-auto flex w-2/3 flex-wrap items-start gap-6">
      <!-- Свой триггер: значок языка, пункты - языки с флагами -->
      <Dropdown items={languageItems} onSelect={(item) => item.id && setLanguage(item.id)}>
        {#snippet trigger(props)}
          <button
            {...props}
            class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-(--border-color) [&_svg]:size-(--icon-size)"
            aria-label="Язык"
          >
            {@html currentFlag}
          </button>
        {/snippet}
      </Dropdown>

      <!-- Произвольное содержимое: форма в поповере, close() закрывает панель -->
      <Dropdown button={{ variant: "primary", content: { name: "Поповер" } }} align="end" componentClass="w-64 p-3">
        {#snippet children(close)}
          <div class="flex flex-col gap-2">
            <Input label={{ name: "Имя" }} autofocus />
            <button class="h-8 rounded-[10px] bg-(--accent-color) text-(--on-accent)" onclick={close}>Готово</button>
          </div>
        {/snippet}
      </Dropdown>

      <Dropdown button={{ content: { name: "Неактивно" } }} disabled {items} />
    </div>
  {/snippet}
</ComponentExample>
