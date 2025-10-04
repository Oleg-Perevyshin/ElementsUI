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

<div id={id.value} class="relative flex w-full flex-col items-center {wrapperClass}">
  <p class="w-full text-center {label.class} {textSize[type]} {bold ? 'font-bold' : ''} {italic ? 'italic' : ''}">{label.name}</p>
</div>
