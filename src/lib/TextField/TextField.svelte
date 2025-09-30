<script lang="ts">
  import type { ITextFieldProps } from '../types'

  let {
    id = { value: crypto.randomUUID(), name: '' },
    wrapperClass = '',
    label = { name: '', class: '' },
    type = 'small',
    bold = false,
    italic = false,
  }: ITextFieldProps = $props()

  const textSize = {
    small: 'text-base',
    medium: 'text-xl',
    xlarge: 'text-2xl',
  }
</script>

<div id={id.value} class="relative flex w-full flex-col items-center {wrapperClass}">
  <p class="w-full text-center {label.class} {textSize[type]} {bold ? 'font-bold' : ''} {italic ? 'italic' : ''}">{label.name}</p>
</div>
