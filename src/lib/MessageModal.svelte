<!-- $lib/ElementsUI/MessageModal.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'

  interface Props {
    message: { id: number; text: string }
    onCLick: (messageId: number) => {}
  }

  let { message, onCLick }: Props = $props()

  const getMessageStyle = (text: string) => {
    if (text.startsWith('ERR: ')) return 'text-red-500'
    if (text.startsWith('OK: ')) return 'text-lime-500'
    if (text.startsWith('WR: ')) return 'text-yellow-500'
    return 'text-gray-400'
  }

  const getMessageText = (text: string) => {
    if (text.startsWith('ERR: ')) return text.replace('ERR: ', '')
    if (text.startsWith('OK: ')) return text.replace('OK: ', '')
    if (text.startsWith('WR: ')) return text.replace('WR: ', '')
    return text
  }

  let progress = $state(100)
  onMount(() => {
    const duration = 5000
    const interval = 50
    const step = (interval / duration) * 100
    const timer = setInterval(() => {
      progress -= step
      if (progress <= 0) {
        clearInterval(timer)
        onCLick(message.id)
      }
    }, interval)
  })
</script>

<div
  transition:fly={{ y: 5, duration: 250 }}
  class="my-1 flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--back-color)] px-4 py-2 shadow-lg"
>
  <div class="flex items-center justify-between">
    <p class={`font-semibold ${getMessageStyle(message.text)}`}>{getMessageText(message.text)}</p>
    <button class="ml-2 cursor-pointer text-2xl" onclick={() => onCLick(message.id)}>&times;</button>
  </div>

  <div class="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
    <div class="h-full bg-[var(--green-color)]" style={`width: ${progress}%`}></div>
  </div>
</div>
