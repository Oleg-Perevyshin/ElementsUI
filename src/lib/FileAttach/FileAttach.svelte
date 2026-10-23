<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import type { IFileAttachProps } from "$lib/types"
  import { twMerge } from "tailwind-merge"
  import Button from "../Button/Button.svelte"

  /* Иконка «открыть файл» для type "button" — документ со стрелкой вверх, контур 1.75 как у остальных кнопок */
  const OPEN_FILE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>`

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    componentClass = "",
    label = { name: "", class: "" },
    type = "file",
    accept = "*/*",
    imageSize = { height: "10rem", width: "10rem", fitMode: "cover", form: "square" },
    disabled = false,
    currentImage = $bindable(""),
    info,
    icon,
    onChange = () => {},
  }: IFileAttachProps = $props()

  let ID = $derived(`${id}-${crypto.randomUUID().slice(0, 6)}`)
  let previewUrl = $derived(currentImage ? (currentImage.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`) : null)
  let fileName = $state("")

  /* Blob-URL для мгновенного превью выбранного файла до того, как onChange/родитель
     подтвердит загрузку и обновит currentImage. Предыдущий blob обязательно отзывается
     перед созданием нового и при размонтировании — иначе течёт память при частой смене файла. */
  let objectUrl: string | null = null
  $effect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  })

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) {
      onChange(event, null)
      return
    }

    const file = input.files[0]
    fileName = file.name

    if (file.type.startsWith("image/")) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      objectUrl = URL.createObjectURL(file)
      previewUrl = objectUrl
    }

    onChange(event, file)
    /* Кнопка «Открыть файл» — повторный выбор того же файла тоже должен срабатывать */
    if (type === "button") input.value = ""
  }

  const triggerFileInput = () => {
    const input = document.getElementById(ID)
    input?.click()
  }
</script>

<!-- По design-handoff (раздел 9): зона сброса — пунктир 1 px с радиусом 12 вместо залитой кнопки,
     высота как у Input; «Выбрать файл» — акцентный текст, имя файла — обычным цветом, пока не выбрано — бледным. -->
<div class={twMerge(`flex flex-col items-center gap-1`, wrapperClass)}>
  {#if label.name}
    <span class={twMerge(`w-full text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
  {/if}

  {#if type === "button"}
    <!-- Иконочная кнопка с подсказкой, как UI.Button; выбор файла — скрытый input за ней -->
    <Button {componentClass} {disabled} content={{ icon: icon ?? OPEN_FILE_ICON, info }} onClick={triggerFileInput} />
    <input id={ID} type="file" class="hidden" {accept} {disabled} onchange={handleFileChange} />
  {:else if type === "image"}
    <div class="relative">
      <button
        class="flex items-center justify-center overflow-hidden {imageSize.form === 'circle' ? 'rounded-full' : 'rounded-[12px]'}
        border border-dashed border-(--border-color) bg-(--container-color) transition-colors duration-150
        {disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer hover:bg-(--border-color)'}"
        style={`height: ${imageSize.height}; width: ${imageSize.width}`}
        onclick={triggerFileInput}
        {disabled}
      >
        {#if previewUrl || currentImage}
          <img
            src={previewUrl}
            alt="Preview"
            class={`
              h-full w-full
              ${imageSize.fitMode === "cover" ? "object-cover" : "object-contain"}
            `}
          />
        {:else}
          <span class="text-[12px] font-medium text-(--faint-color)">Image</span>
        {/if}
      </button>
      <input id={ID} type="file" class="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" {accept} {disabled} onchange={handleFileChange} />
    </div>
  {:else}
    <label class="relative inline-block w-full">
      <input
        id={ID}
        type="file"
        class="absolute left-0 z-1 h-8 w-full opacity-0 {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        {accept}
        {disabled}
        onchange={handleFileChange}
      />
      <div
        class={twMerge(
          `flex h-8 w-full items-center gap-3 overflow-hidden rounded-[12px] border border-dashed border-(--border-color) bg-(--field-color) px-3 text-[14px]
           transition-colors duration-150 ${disabled ? "opacity-45" : "hover:border-(--accent-color)"}`,
          componentClass,
        )}
      >
        <span class="shrink-0 font-semibold whitespace-nowrap text-(--accent-color)">
          {$T("constructor.props.file.select")}
        </span>
        <div class="flex min-w-0 flex-1 items-center justify-start truncate {fileName ? 'text-(--font-color)' : 'text-(--faint-color)'}">
          <p class="w-full truncate">{fileName || $T("constructor.props.file.notselected")}</p>
        </div>
      </div>
    </label>
  {/if}
</div>
