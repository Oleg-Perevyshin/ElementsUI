<script lang="ts">
  import type { ITextFieldProps } from '../types'

  let { id = crypto.randomUUID(), wrapperClass = '', label = { name: '', bold: false, italic: false, color: '' }, type = 'small' }: ITextFieldProps = $props()

  const textSize = {
    xsmall: 'text-sm',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
    xxlarge: 'text-3xl',
    huge: 'text-4xl',
    massive: 'text-5xl',
  } as const
</script>

<div {id} class="relative flex w-full flex-col items-center {wrapperClass}">
  <p class="w-full text-center {label.color} {textSize[type]} {label.bold ? 'font-bold' : ''} {label.italic ? 'italic' : ''}">{label.name}</p>
</div>
