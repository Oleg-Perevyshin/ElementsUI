<script lang="ts">
  import { Select, Switch, T, type IOption } from "$lib"
  import type { Snippet } from "svelte"
  import { fade } from "svelte/transition"

  let {
    component,
    componentProps,
    examples,
    readmeHtml,
    codeText,
    forConstructor = $bindable(),
  }: { component: Snippet; componentProps: Snippet; examples?: Snippet; readmeHtml: string; codeText: string; forConstructor: boolean } = $props()

  let isCopied = $state(false)
  let snippetOptions = [
    { id: crypto.randomUUID(), value: "overview", name: $T("library.overview") },
    { id: crypto.randomUUID(), value: "examples", name: $T("library.examples") },
    { id: crypto.randomUUID(), value: "info", name: $T("library.info") },
  ]

  let mainSnippet: string | undefined = $state("overview")
</script>

<div class="flex h-full flex-col">
  <Select
    wrapperClass="w-1/2 mx-auto mb-3 shrink-0"
    type="buttons"
    options={snippetOptions}
    value={snippetOptions.find((o) => o.value == mainSnippet)}
    onUpdate={(value) => (mainSnippet = (value as IOption<string>).value)}
  />
  <div class="min-h-0 flex-1">
    {#key mainSnippet}
      {#if mainSnippet === "examples" && examples}
        {@render examples()}
      {:else if mainSnippet === "info"}
        <div class="h-full overflow-y-auto text-left">
          {@html readmeHtml}
        </div>
      {:else}
        <div class="flex h-full w-full flex-col">
          <div class="min-h-40 flex-[1]">
            {@render component()}
          </div>
          <Switch
            wrapperClass="w-60 self-end p-2 shrink-0"
            label={{ name: $T("library.for_constructor") }}
            value={forConstructor ? 1 : 0}
            options={[{ id: crypto.randomUUID(), value: 0 }]}
            onChange={(value) => (forConstructor = value == 0 ? false : true)}
          />
          <div class="border-t border-gray-500 shrink-0"></div>
          <div class="min-h-0 flex-[2] overflow-y-auto" transition:fade={{ duration: 200 }}>
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
                <div class="size-6 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
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
              <pre class="overflow-x-auto">{codeText}</pre>
            </div>
          </div>
        </div>
      {/if}
    {/key}
  </div>
</div>
