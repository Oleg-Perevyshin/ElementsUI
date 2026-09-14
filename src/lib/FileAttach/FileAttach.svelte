<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import type { IFileAttachProps } from "$lib/types"
  import { twMerge } from "tailwind-merge"

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
    onChange = () => {},
  }: IFileAttachProps = $props()

  let ID = $derived(`${id}-${crypto.randomUUID().slice(0, 6)}`)
  let selectedFile = $state<File | null>(null)
  let previewUrl = $derived(currentImage ? (currentImage.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`) : null)
  let fileName = $state("")

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) {
      onChange(event, null)
      return
    }

    const file = input.files[0]
    selectedFile = file
    fileName = file.name

    if (file.type.startsWith("image/")) previewUrl = URL.createObjectURL(file)

    onChange(event, file)
  }

  const triggerFileInput = () => {
    const input = document.getElementById(ID)
    input?.click()
  }
</script>

<!-- Не входил в исходный design-handoff (пропущен вместе с остальными точками,
     которые авторы документа не осматривали) — сейчас приведён к общей палитре:
     радиус 10/высота 36 как у Input/Select, сегмент "Выбрать файл" залит акцентом
     с текстом --on-accent (было --font-color по тёмно-синему — нечитаемо). -->
<div class={twMerge(`flex flex-col items-center gap-1`, wrapperClass)}>
  {#if label.name}
    <span class={twMerge(`w-full text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
  {/if}

  {#if type === "image"}
    <div class="relative">
      <button
        class="flex items-center justify-center overflow-hidden {imageSize.form === 'circle' ? 'rounded-full' : 'rounded-2xl'}
        border border-(--hairline-color) bg-(--container-color) transition-colors duration-150
        {disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer hover:bg-(--border-color)'}"
        style={`height: ${imageSize.height}; width: ${imageSize.width}`}
        onclick={triggerFileInput}
        {disabled}
      >
        {#if previewUrl || currentImage}
          <img
            src={previewUrl ?? (currentImage?.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`)}
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
        class="absolute left-0 z-1 h-9 w-full opacity-0 {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        {accept}
        {disabled}
        onchange={handleFileChange}
      />
      <div
        class="flex h-9 w-full overflow-hidden rounded-[10px] border border-(--border-color) text-[14px] transition-colors duration-150
             {disabled ? 'opacity-45' : 'hover:border-(--faint-color)'}"
      >
        <div class="flex shrink-0 items-center justify-center bg-(--accent-color) px-3 font-semibold whitespace-nowrap text-(--on-accent)">
          {$T("constructor.props.file.select")}
        </div>
        <div class={twMerge("flex min-w-0 flex-1 items-center justify-start truncate bg-(--field-color) px-3 text-(--font-color)", componentClass)}>
          <p class="w-full truncate">{fileName || $T("constructor.props.file.notselected")}</p>
        </div>
      </div>
    </label>
  {/if}
</div>
