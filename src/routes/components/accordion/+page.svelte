<script lang="ts">
  import { Accordion, FileAttach } from '$lib'
  import AccordionProps from '$lib/Accordion/AccordionProps.svelte'
  import type { IAccordionProps, Position, UIComponent } from '$lib/types'
  import GitHub from '../../../appIcons/GitHub.svelte'

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Accordion',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      isOpen: true,
      outline: true,
      size: {
        height: 1,
        width: 1,
      },
      label: {
        name: 'Accordion',
        class: 'text-center',
        icon: null,
      },
      image: '',
      children: undefined,
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      ;(accordionComponent.properties as IAccordionProps).image = base64String
    }
    reader.readAsDataURL(file)
  }

  const updateComponent = (
    id: string,
    updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>,
  ) => {
    accordionComponent = {
      ...accordionComponent,
      position: updates.position ? { ...accordionComponent.position, ...updates.position } : accordionComponent.position,
      parentId: updates.parentId ?? accordionComponent.parentId,
      properties: updates.properties ? { ...accordionComponent.properties, ...updates.properties } : accordionComponent.properties,
    }
  }
</script>

<!-- Панель для изменения свойств и предпросмотра -->
<!-- <div class="mb-4 flex flex-col gap-2 rounded-2xl border border-[var(--border-color)] p-4">
  <h3 class="text-lg font-bold">Настройка компонента</h3> -->

<!-- Превью -->
<Accordion {...accordionComponent.properties as IAccordionProps}>
  <div class="flex flex-col">
    <h1>Содержимое компонента</h1>
    <h1>Содержимое компонента</h1>
  </div>
</Accordion>

<AccordionProps
  component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
  onPropertyChange={(value) => updateComponent(accordionComponent.id, { properties: value } as object)}
/>

<!-- Редактор свойств -->
<!-- <div class="mt-4 grid grid-cols-3 gap-2">
    <label class="flex flex-col">
      <span>ID Value</span>
      <input type="text" class="rounded-2xl border bg-[var(--back-color)] px-2 py-1" bind:value={accordionComponent.id} />
      <span>Открыт по умолчанию</span>
      <input type="checkbox" bind:checked={accordionComponent.isOpen} />
    </label> -->
<!-- 
    <label class="flex flex-col">
      <span>Label Name</span>
      <input type="text" class="rounded-2xl border bg-[var(--back-color)] px-2 py-1" bind:value={accordionComponent.header!.name} />
      <span>Label Align</span>
      <select class="rounded-2xl border bg-[var(--back-color)] px-2 py-1" bind:value={accordionComponent.header!.align}>
        <option value="left">Слева</option>
        <option value="center">По центру</option>
        <option value="right">Справа</option>
      </select>
    </label>

    <label class="flex flex-col">
      <span>SVG иконка (строка)</span>
      <textarea rows="3" class="rounded-2xl border bg-[var(--back-color)] px-2 py-1" bind:value={accordionComponent.header!.icon!.svg}></textarea>
      <FileAttach type="file" label={{ name: 'Image' }} accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
    </label> -->
<!-- </div>
</div> -->
<Accordion label={{ name: 'Accordion MAIN' }} size={{ width: 5 }} isOpen={false} wrapperClass="w-1/2">
  <Accordion label={{ name: 'Accordion 1 SUB', class: '' }} isOpen={false} outline wrapperClass=" col-span-5">
    <h6 class="col-span-10">Содержимое вложенного Accordion 1</h6>
    <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4>
    <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>
  </Accordion>
</Accordion>

<Accordion label={{ name: 'Accordion MAIN', class: 'text-center' }} isOpen={false}>
  <Accordion label={{ name: 'Accordion 1 SUB', class: '' }} isOpen={false} outline wrapperClass="col-span-5">
    <h6 class="col-span-10">Содержимое вложенного Accordion 1</h6>
    <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4>
    <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>
  </Accordion>
</Accordion>

<Accordion label={{ name: 'Accordion MAIN', class: 'text-right' }} isOpen={false}>
  <Accordion label={{ name: 'Accordion 1 SUB', class: '' }} isOpen={false} outline wrapperClass="col-span-5">
    <h6 class="col-span-10">Содержимое вложенного Accordion 1</h6>
    <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4>
    <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>
  </Accordion>
</Accordion>

<!-- Панель примеров -->
<!-- <div class="flex flex-col rounded-2xl border border-[var(--border-color)] p-2">
  <h3 class="mb-2 text-lg font-bold">Примеры</h3>
  <Accordion
    label={{ name: 'Accordion MAIN', align: 'center' }}
    isOpen={false}
    type="main"
    componentClass="mb-2"
    icon={{
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9.173 14.83a4 4 0 1 1 5.657-5.657" /><pathd="m11.294 12.707l.174.247a7.5 7.5 0 0 0 8.845 2.492A9 9 0 0 1 5.642 18.36M3 12h1m8-9v1M5.6 5.6l.7.7M3 21L21 3"/></g></svg>',
    }}
  >
    <Accordion
      label={{ name: 'Accordion 1 SUB', class: '' }}
      isOpen={false}
      type="sub"
      componentClass="w-1/2"
      icon={{
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9.173 14.83a4 4 0 1 1 5.657-5.657" /><pathd="m11.294 12.707l.174.247a7.5 7.5 0 0 0 8.845 2.492A9 9 0 0 1 5.642 18.36M3 12h1m8-9v1M5.6 5.6l.7.7M3 21L21 3"/></g></svg>',
      }}
    >
      <h6>Содержимое вложенного Accordion 1</h6>
      <h4>Содержимое вложенного Accordion 1</h4>
      <h2>Содержимое вложенного Accordion 1</h2>
    </Accordion>
    <Accordion
      label={{ name: 'Accordion 2 SUB', align: 'right' }}
      isOpen={false}
      type="sub"
      componentClass="w-1/2"
      icon={{
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9.173 14.83a4 4 0 1 1 5.657-5.657" /><pathd="m11.294 12.707l.174.247a7.5 7.5 0 0 0 8.845 2.492A9 9 0 0 1 5.642 18.36M3 12h1m8-9v1M5.6 5.6l.7.7M3 21L21 3"/></g></svg>',
      }}
    >
      <h1>Содержимое вложенного Accordion 2</h1>
      <h3>Содержимое вложенного Accordion 2</h3>
      <h5>Содержимое вложенного Accordion 2</h5>
    </Accordion>
  </Accordion>

  <div class="flex flex-row gap-2">
    <Accordion
      label={{ name: 'Accordion 3 MAIN', align: 'center' }}
      isOpen={false}
      type="main"
      componentClass="w-2/3"
      icon={{ component: GitHub }}
    >
      <h1>Содержимое вложенного Accordion 3</h1>
      <h2>Содержимое вложенного Accordion 3</h2>
      <h3>Содержимое вложенного Accordion 3</h3>
    </Accordion>
    <Accordion
      label={{ name: 'Accordion 4 MAIN', align: 'left' }}
      isOpen={false}
      type="main"
      componentClass="w-1/3"
      icon={{ component: GitHub }}
    >
      <h5>Содержимое вложенного Accordion 4</h5>
      <h6>Содержимое вложенного Accordion 4</h6>
    </Accordion>
  </div>
</div> -->
