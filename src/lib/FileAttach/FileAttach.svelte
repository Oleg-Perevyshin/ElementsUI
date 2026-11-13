<!-- $lib/FileAttach/FileAttach.svelte - выбор файла: строка с пунктиром (file), картинка с превью (image) или кнопка (button, значок и необязательная подпись). multiple - несколько файлов, onUpdate получает массив -->
<script lang="ts" generics="M extends boolean = false">
  import { T } from "../locales/i18n"
  import type { FileAttachValue, IFileAttachProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import Button from "../Button/Button.svelte"
  import FieldLabel from "../FieldLabel.svelte"

  /* Иконка «открыть файл» для type "button" - документ со стрелкой вверх, контур 1.75 как у остальных кнопок */
  const OPEN_FILE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>`

  let {
    wrapperClass = "",
    componentClass = "",
    label,
    type = "file",
    accept = "*/*",
    multiple,
    imageSize = { height: "10rem", width: "10rem", fitMode: "cover", form: "square" },
    disabled = false,
    currentImage = $bindable(""),
    info,
    icon,
    caption = "",
    onUpdate,
  }: IFileAttachProps<M> = $props()

  const uid = $props.id()
  let input: HTMLInputElement | undefined = $state()
  let fileName = $state("")
  /* Blob-URL выбранной картинки для мгновенного превью; отзывается при замене и размонтировании, чтобы не текла память */
  let objectUrl: string | null = $state(null)
  $effect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  })
  const previewUrl = $derived(objectUrl ?? (currentImage ? (currentImage.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`) : null))

  /* Файлы забираются из input, и он сразу сбрасывается: повторный выбор того же файла снова срабатывает, в input не остаётся уже отданного файла. Имя (file) и превью (image) остаются на экране из своего состояния */
  const handleFileChange = (event: Event & { currentTarget: HTMLInputElement }) => {
    const files = [...(event.currentTarget.files ?? [])]
    event.currentTarget.value = ""
    if (!files.length) return
    const file = files[0]
    if (type === "file") fileName = files.map((item) => item.name).join(", ")
    if (file.type.startsWith("image/")) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      objectUrl = URL.createObjectURL(file)
    }
    onUpdate?.((multiple ? files : file) as FileAttachValue<M>, event)
  }
</script>

<!-- По design-handoff (раздел 9): зона сброса - пунктир 1 px с радиусом 12 вместо залитой кнопки, высота как у Input; «Выбрать файл» - акцентный текст, имя файла - обычным цветом, пока не выбрано - бледным. -->
<div class={twMerge(`flex flex-col items-center gap-1`, wrapperClass)}>
  <FieldLabel {label} for={uid} class="w-full" />

  {#if type === "button"}
    <!-- Иконочная кнопка с подсказкой, как UI.Button; выбор файла - скрытый input за ней -->
    <Button {componentClass} {disabled} content={{ icon: icon ?? OPEN_FILE_ICON, name: caption, info }} onClick={() => input?.click()} />
    <input bind:this={input} id={uid} type="file" class="hidden" {accept} {multiple} {disabled} onchange={handleFileChange} />
  {:else if type === "image"}
    <div class="relative">
      <button
        class="flex items-center justify-center overflow-hidden {imageSize.form === 'circle' ? 'rounded-full' : 'rounded-[12px]'}
        border border-dashed border-(--border-color) bg-(--container-color) transition-colors duration-150
        {disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer hover:bg-(--border-color)'}"
        style={`height: ${imageSize.height}; width: ${imageSize.width}`}
        onclick={() => input?.click()}
        {disabled}
        aria-label={label?.name || "Image"}
      >
        {#if previewUrl}
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
      <input
        bind:this={input}
        id={uid}
        type="file"
        class="absolute -z-10 h-0 w-0 overflow-hidden opacity-0"
        {accept}
        {multiple}
        {disabled}
        onchange={handleFileChange}
      />
    </div>
  {:else}
    <label class="relative inline-block w-full">
      <input
        id={uid}
        type="file"
        class="absolute left-0 z-1 h-8 w-full opacity-0 {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        {accept}
        {multiple}
        {disabled}
        onchange={handleFileChange}
      />
      <div
        class={twMerge(
          `flex h-8 w-full items-center gap-3 overflow-hidden rounded-[12px] border border-dashed border-(--border-color) bg-(--field-color) px-3 text-[14px]
           transition-colors duration-150 ${disabled ? "opacity-45" : "hover:border-(--accent-text)"}`,
          componentClass,
        )}
      >
        <span class="shrink-0 font-semibold whitespace-nowrap text-(--accent-text)">
          {$T("constructor.props.file.select")}
        </span>
        <div class="flex min-w-0 flex-1 items-center justify-start truncate {fileName ? 'text-(--font-color)' : 'text-(--faint-color)'}">
          <p class="w-full truncate">{fileName || $T("constructor.props.file.notselected")}</p>
        </div>
      </div>
    </label>
  {/if}
</div>
