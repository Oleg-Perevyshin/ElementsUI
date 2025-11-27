<script lang="ts">
  import * as UI from '$lib'
  import type { Snippet } from 'svelte'
  import CopyButton from './libIcons/CopyButton.svelte'
  import { fade, fly, slide } from 'svelte/transition'

  let { component, componentProps, codeText }: { component: Snippet; componentProps: Snippet; codeText: string } = $props()

  let isCopied = $state(false)
</script>

<div class="flex h-[calc(100vh-9rem)] flex-col">
  <div class="flex-1 overflow-y-auto">
    {@render component()}
  </div>
  <div class="border-t border-gray-500"></div>
  <div class="max-h-[70%]" transition:fade={{ duration: 200 }}>
    {@render componentProps()}
    <div class="relative mt-3">
      <button
        class="absolute top-2 right-3 flex cursor-pointer border-none bg-transparent"
        onclick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(codeText)
          isCopied = true
          setTimeout(() => (isCopied = false), 1000)
        }}
        aria-label="Копировать текст"
      >
        <div class=" size-6 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
          {#if isCopied}
            <div
              class="right-1..5 absolute top-1/2 -translate-y-1/2 transform rounded-md bg-(--green-color) px-1.5 py-1 shadow-lg"
              transition:fade={{ duration: 200 }}
            >
              ✓
            </div>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
                />
                <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
              </g>
            </svg>
          {/if}
        </div>
      </button>
      <pre class="overflow-x-auto">{codeText}
  </pre>
    </div>
  </div>
</div>
