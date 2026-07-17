<script lang="ts">
  import { Carousel } from "$lib"
  import type { ICarouselProps } from "$lib/types"
  import { RenderMarkdown } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import readmeRaw from "$lib/Carousel/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* У Carousel нет CarouselProps.svelte и он не входит в тип UIComponent/реестр конструктора,
     поэтому здесь используется простое локальное состояние вместо схемы component/updateComponent */
  let carouselProps: ICarouselProps = $state({
    id: crypto.randomUUID(),
    label: { name: "Карусель" },
    scrollValue: 200,
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Carousel label={{ name: "${carouselProps.label?.name ?? ""}" }} scrollValue={${carouselProps.scrollValue}}>
  <div class="w-40 min-w-40 h-24">Слайд 1</div>
  <div class="w-40 min-w-40 h-24">Слайд 2</div>
  <div class="w-40 min-w-40 h-24">Слайд 3</div>
  ...
</UI.Carousel>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="relative mx-40 my-20">
      <Carousel id={carouselProps.id} label={carouselProps.label} scrollValue={carouselProps.scrollValue}>
        <div class="w-40 min-w-40 h-24 flex items-center justify-center rounded-lg bg-blue p-2">Слайд 1</div>
        <div class="w-40 min-w-40 h-24 flex items-center justify-center rounded-lg bg-green p-2">Слайд 2</div>
        <div class="w-40 min-w-40 h-24 flex items-center justify-center rounded-lg bg-yellow p-2">Слайд 3</div>
        <div class="w-40 min-w-40 h-24 flex items-center justify-center rounded-lg bg-purple p-2">Слайд 4</div>
        <div class="w-40 min-w-40 h-24 flex items-center justify-center rounded-lg bg-red p-2">Слайд 5</div>
      </Carousel>
    </div>
  {/snippet}
  {#snippet componentProps()}
    <div class="flex items-center justify-center py-4 text-center opacity-70">Конструктор для этого компонента не реализован</div>
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 w-2/3 mx-auto">
      <Carousel label={{ name: "Карусель с заголовком" }} scrollValue={300}>
        <div class="w-80 min-w-80 h-24 bg-blue-100 p-3 rounded-lg">
          <p>Элемент 1</p>
        </div>
        <div class="w-80 min-w-80 h-24 bg-green-100 p-3 rounded-lg">
          <p>Элемент 2</p>
        </div>
        <div class="w-80 min-w-80 h-24 bg-yellow-100 p-3 rounded-lg">
          <p>Элемент 3</p>
        </div>
        <div class="w-80 min-w-80 h-24 bg-red-100 p-3 rounded-lg">
          <p>Элемент 4</p>
        </div>
      </Carousel>
      <Carousel wrapperClass="max-w-2xl mx-auto" scrollValue={150}>
        <div class="w-72 min-w-72 h-16 bg-purple-100 p-2 rounded-md">
          <p>Контент 1</p>
        </div>
        <div class="w-72 min-w-72 h-16 bg-pink-100 p-2 rounded-md">
          <p>Контент 2</p>
        </div>
        <div class="w-72 min-w-72 h-16 bg-indigo-100 p-2 rounded-md">
          <p>Контент 3</p>
        </div>
      </Carousel>
    </div>
  {/snippet}
</ComponentExample>
