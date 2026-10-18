<!-- $lib/PropsListHeader.svelte — подписи колонок над однострочными элементами списка в окнах свойств (вместо подписи у каждого поля);
     gridClass — тот же шаблон колонок, что у строк списка, пустая подпись — колонка без заголовка (ручка, удаление) -->
<script lang="ts">
  let { gridClass, captions }: { gridClass: string; captions: string[] } = $props()
</script>

<div class="grid {gridClass} items-center gap-3 px-2 text-[12px] font-semibold text-(--muted-color)">
  {#each captions as caption, index (index)}
    <span class="truncate">{caption}</span>
  {/each}
</div>
