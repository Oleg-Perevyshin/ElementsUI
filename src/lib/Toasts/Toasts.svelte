<!-- $lib/Toasts/Toasts.svelte - стопка всплывающих уведомлений в левом нижнем углу (как в облаке DevCloud): заголовок, текст цветом уровня, крестик, полоса времени жизни -->
<script lang="ts">
  import { fly } from "svelte/transition"
  import { removeToast, toasts, TOAST_LIFETIME_MS, type IToast } from "./toasts"
  import Button from "../Button/Button.svelte"
  import IconCross from "../libIcons/CrossIcon.svelte"

  let { wrapperClass = "" }: { wrapperClass?: string } = $props()

  const TEXT_COLORS = { error: "text-(--red-text)", warn: "text-(--yellow-text)", info: "text-(--green-text)" }
  const BAR_COLORS = { error: "bg-(--red-color)", warn: "bg-(--yellow-color)", info: "bg-(--green-color)" }

  /* Полоса времени жизни: доля оставшегося времени, пересчёт раз в 50 мс */
  let now = $state(Date.now())
  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 50)
    return () => clearInterval(timer)
  })
  const left = (toast: IToast) => Math.max(0, 100 - ((now - toast.createdAt) / TOAST_LIFETIME_MS) * 100)
</script>

<div class="pointer-events-none fixed bottom-3 left-4 z-100 flex max-w-[min(28rem,calc(100vw-2rem))] flex-col-reverse {wrapperClass}">
  {#each $toasts as toast (toast.id)}
    <div transition:fly={{ y: 5, duration: 250 }} class="ui-panel pointer-events-auto my-1 flex flex-col rounded-2xl px-4 py-2 shadow-(--elevation-2)">
      <div class="flex items-center justify-between font-semibold">
        <div class="min-w-0 text-left">
          {#if toast.title}<p>{toast.title}</p>{/if}
          <p class="wrap-break-word {toast.level ? TEXT_COLORS[toast.level] : 'text-(--muted-color)'}">{toast.text}</p>
        </div>
        <Button
          wrapperClass="ml-2 w-6 shrink-0"
          componentClass="text-(--faint-color) hover:text-(--font-color)"
          content={{ icon: IconCross }}
          onClick={() => removeToast(toast.id)}
        />
      </div>
      <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-(--container-color)">
        <div class="h-full {BAR_COLORS[toast.level ?? 'info']}" style={`width: ${left(toast)}%`}></div>
      </div>
    </div>
  {/each}
</div>
