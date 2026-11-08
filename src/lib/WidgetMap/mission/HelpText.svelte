<!-- $lib/WidgetMap/mission/HelpText.svelte - справка из простого текста: строки "## " - заголовки, "- " - пункты списка, остальное - абзацы, **жирный** внутри строки -->
<script lang="ts">
  let { text }: { text: string } = $props()

  type Block = { kind: "h"; text: string } | { kind: "p"; text: string } | { kind: "ul"; items: string[] }

  let blocks = $derived.by(() => {
    const out: Block[] = []
    for (const raw of text.split("\n")) {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith("## ")) out.push({ kind: "h", text: line.slice(3) })
      else if (line.startsWith("- ")) {
        const last = out[out.length - 1]
        if (last?.kind === "ul") last.items.push(line.slice(2))
        else out.push({ kind: "ul", items: [line.slice(2)] })
      } else out.push({ kind: "p", text: line })
    }
    return out
  })
</script>

{#snippet inline(line: string)}
  {#each line.split("**") as part, i}{#if i % 2}<strong class="font-semibold">{part}</strong>{:else}{part}{/if}{/each}
{/snippet}

<div class="flex flex-col gap-1.5 text-[14px] leading-snug text-(--font-color)">
  {#each blocks as block}
    {#if block.kind === "h"}
      <h3 class="m-0 mt-2.5 text-[15px] font-semibold">{@render inline(block.text)}</h3>
    {:else if block.kind === "ul"}
      <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
        {#each block.items as item}
          <li class="relative m-0 pl-4 before:absolute before:left-0 before:text-(--accent-text) before:content-['•']">{@render inline(item)}</li>
        {/each}
      </ul>
    {:else}
      <p class="m-0">{@render inline(block.text)}</p>
    {/if}
  {/each}
</div>
