<!-- $lib/ElementsUI/FileAttach.svelte -->
<script lang="ts">
  interface FileInputProps {
    id?: string
    wrapperClass?: string
    label?: { name?: string; class?: string }
    type?: 'file' | 'image'
    accept?: string
    imageSize?: { height?: string; width?: string; fitMode?: 'cover' | 'contain'; form?: 'square' | 'circle' }
    disabled?: boolean
    currentImage?: string | null
    onChange?: (event: Event, file: File | null) => void
  }

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    type = 'file',
    accept = '*/*',
    imageSize = { height: '10rem', width: '10rem', fitMode: 'cover', form: 'square' },
    disabled = false,
    currentImage = null,
    onChange = () => {},
  }: FileInputProps = $props()

  let selectedFile = $state<File | null>(null)
  let previewUrl = $state<string | null>(null)

  $effect(() => {
    if (currentImage && !selectedFile) {
      previewUrl = currentImage.startsWith('data:') ? currentImage : `data:image/png;base64,${currentImage}`
    }
  })

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) {
      onChange(event, null)
      return
    }

    const file = input.files[0]
    selectedFile = file

    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file)
    }

    onChange(event, file)
  }

  const triggerFileInput = () => {
    const input = document.getElementById(id)
    input?.click()
  }
</script>

<div class={`flex flex-col items-center ${wrapperClass}`}>
  {#if label.name}
    <h5 class={`${label.class}`}>{label.name}</h5>
  {/if}

  {#if type === 'image'}
    <div class="relative">
      <button
        class="flex items-center justify-center overflow-hidden {imageSize.form === 'circle' ? 'rounded-full' : 'rounded-2xl'} 
        border border-[var(--border-color)] bg-[var(--back-color)] transition duration-250 hover:shadow-lg
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
      <input {id} type="file" class="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" {accept} {disabled} onchange={handleFileChange} />
    </div>
  {:else}
    <label class="relative inline-block w-full font-normal">
      <input
        {id}
        type="file"
        class={`h-9 w-full rounded-2xl border border-[var(--border-color)] bg-[var(--back-color)] transition duration-250 hover:shadow-lg
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} file:h-full file:w-1/3 file:cursor-pointer 
          file:border-none file:bg-[var(--blue-color)] invalid:border-red-400 invalid:shadow-[0_0_6px_var(--red-color)]`}
        {accept}
        {disabled}
        onchange={handleFileChange}
      />
    </label>
  {/if}
</div>
