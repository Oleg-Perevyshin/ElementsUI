<script lang="ts">
  import * as UI from '$lib'
  import type { Snippet } from 'svelte'
  import CopyButton from './libIcons/CopyButton.svelte'

  let { component, componentProps, codeText }: { component: Snippet; componentProps: Snippet; codeText: string } = $props()

  let isCopied = $state(false)
</script>

<div class="flex h-[calc(100vh-9rem)] flex-col">
  <div class="flex-1 overflow-y-auto">
    {@render component()}
  </div>
  <div class=" border-t border-gray-500"></div>
  <div class="h-fit">
    {@render componentProps()}
    <div class="relative mt-3">
      <UI.Button
        wrapperClass="absolute top-3 right-5 w-6"
        content={{ icon: isCopied ? '<div class="rounded-md bg-[var(--green-color)] shadow-lg px-1">✓</div>' : CopyButton }}
        onClick={() => {
          isCopied = true
          setTimeout(() => (isCopied = false), 1000)
          navigator.clipboard.writeText(codeText)
        }}
      />
      <pre class="overflow-x-auto">{codeText}
  </pre>
    </div>
  </div>
</div>
