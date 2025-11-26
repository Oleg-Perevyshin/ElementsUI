<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import type { IFileAttachProps } from '$lib/types'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    type = 'file',
    accept = '*/*',
    imageSize = { height: '10rem', width: '10rem', fitMode: 'cover', form: 'square' },
    disabled = false,
    currentImage = $bindable(''),
    onChange = () => {},
  }: IFileAttachProps = $props()

  let ID = `${id}-${crypto.randomUUID().slice(0, 6)}`
  let selectedFile = $state<File | null>(null)
  let previewUrl = $derived(currentImage ? (currentImage.startsWith('data:') ? currentImage : `data:image/png;base64,${currentImage}`) : null)

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) {
      onChange(event, null)
      return
    }

    const file = input.files[0]
    selectedFile = file
    fileName = file.name

    if (file.type.startsWith('image/')) previewUrl = URL.createObjectURL(file)

    onChange(event, file)
  }

  const triggerFileInput = () => {
    const input = document.getElementById(ID)
    input?.click()
  }

  let fileName = $state('')
  $effect(() => console.log(fileName))
</script>

<div class={twMerge(`flex flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={`${label.class}`}>{label.name}</h5>
  {/if}

  {#if type === 'image'}
    <div class="relative">
      <button
        class="flex items-center justify-center overflow-hidden {imageSize.form === 'circle' ? 'rounded-full' : 'rounded-2xl'} 
        bg-(--back-color) shadow-sm transition duration-250 hover:shadow-md
        {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
        style={`height: ${imageSize.height}; width: ${imageSize.width}`}
        onclick={triggerFileInput}
        {disabled}
      >
        {#if previewUrl || currentImage}
          <img
            src={previewUrl ?? (currentImage?.startsWith('data:') ? currentImage : `data:image/png;base64,${currentImage}`)}
            alt="Preview"
            class={`
              h-full w-full
              ${imageSize.fitMode === 'cover' ? 'object-cover' : 'object-contain'}
            `}
          />
        {:else}
          <span class="text-sm text-gray-500">Image</span>
        {/if}
      </button>
      <input id={ID} type="file" class="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" {accept} {disabled} onchange={handleFileChange} />
    </div>
  {:else}
    <label class="relative inline-block w-full">
      <input id={ID} type="file" class="absolute left-0 z-1 h-8.5 w-full opacity-0" {accept} {disabled} onchange={handleFileChange} />
      <div
        class="flex h-8.5 w-full overflow-hidden rounded-2xl font-semibold shadow-sm transition duration-250 hover:shadow-md
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
      >
        <div class="flex w-1/3 items-center justify-center bg-(--blue-color)">{$t('constructor.props.file.select')}</div>
        <div class="flex w-2/3 items-center justify-start bg-(--back-color) px-2">{fileName || $t('constructor.props.file.notselected')}</div>
      </div>
    </label>
  {/if}
</div>
