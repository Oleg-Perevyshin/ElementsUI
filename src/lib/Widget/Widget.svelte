<script lang="ts">
  import { slide } from "svelte/transition"
  import type { IWidgetProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let { id = crypto.randomUUID() }: IWidgetProps = $props()

  // let transformClass = $derived(`transform rotate-${rotation}`)
  let image =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" transform="rotate(0)" ><!-- Icon from Game Icons by GameIcons - https://github.com/game-icons/icons/blob/master/license.txt --><path fill="currentColor" d="M309.15 21.209c-24.995-.374-50.098 14.428-64.076 63.611c-12.743 44.837-4.557 106.917 14.5 158.983c8.733-3.686 18.747-4.452 28.447-1.442c10.094 3.133 18.152 9.826 23.24 18.272c33.762-16.847 70.774-29.358 88.594-51.313c47.257-58.219 4.19-138.461-35.183-166.851c-14.175-10.221-34.811-20.95-55.522-21.26M135.72 207.832c-66.3-1.054-108.738 69.822-113.332 115.096c-3.894 38.368 5.81 105.23 96.476 82.398c44.995-11.33 94.419-49.163 129.946-91.465c-12.314-10.488-17.952-27.733-12.877-44.084a41.3 41.3 0 0 1 3.779-8.568c-32.11-20.996-61.997-47.643-90.418-52.178a96 96 0 0 0-13.574-1.199m139.908 50.63c-10.094-.024-19.338 6.442-22.506 16.65c-3.898 12.562 3 25.665 15.563 29.564c12.562 3.898 25.664-2.998 29.562-15.56c3.899-12.563-2.998-25.667-15.56-29.565a24 24 0 0 0-7.059-1.088zM316.9 287.84a41.4 41.4 0 0 1-1.464 6.61c-5.666 18.255-22.966 29.865-41.248 29.241c-2.283 37.694-9.975 76.046.136 102.479c26.791 70.035 117.817 72.857 162.09 52.955c35.175-15.813 88.228-57.646 23.121-124.75c-32.003-32.984-88.698-56.742-142.635-66.535"/></svg>'
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class="w-full h-full mt-1 rounded-xl bg-(--container-color)
     transition-shadow duration-250
     shadow-[0_0_3px_rgb(0_0_0_/0.25)] hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
>
  <div class=" w-full h-[70%] inset-shadow-[0_-10px_10px_-15px_rgb(0_0_0_/0.5)] p-2">
    <div class="flex gap-2 overflow-hidden">
      <div class="h-12 w-12 p-0.5 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full transform rotate-0">
        {@html image}
      </div>
      <h1>Пропеллер</h1>
    </div>
    <div class="text-5xl flex items-center justify-center">28 м/с</div>
  </div>
  <div class="">
    <p>sdfckxd</p>
  </div>
</div>
