<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { ITextFieldProps } from '../types'

  let { id = crypto.randomUUID(), wrapperClass = '', background = false, content = { name: '', class: '', size: 'base' } }: ITextFieldProps = $props()

  const textSize = {
    small: 'text-sm',
    base: 'text-base',
    large: 'text-2xl',
    huge: 'text-4xl',
    massive: 'text-5xl',
  } as const
</script>

<div
  {id}
  class="{twMerge(`relative flex w-full flex-col items-center ${background ? 'rounded-2xl bg-(--container-color) px-6 py-2' : ''}`, wrapperClass)} "
>
  <p class={twMerge(`w-full text-center ${textSize[content.size ?? 'base']}`, content.class)}>
    {content.name}
  </p>
</div>
