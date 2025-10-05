<script lang="ts">
  import { Accordion, FileAttach } from '$lib'
  import type { IAccordionProps, UIComponent } from '$lib/types'
  import GitHub from '../../../appIcons/GitHub.svelte'

  let accordionComponent: IAccordionProps = $state({
    id: { value: crypto.randomUUID(), name: 'AccordionComponent' },
    label: { name: 'Test Accordion Component', class: '', align: 'left' },
    icon: {
      svg: undefined,
      component: GitHub,
    },
    isOpen: true,
    componentClass: '',
    type: 'main',
    components: undefined,
    image: '',
    children: undefined,
  })

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      accordionComponent.image = base64String
    }
    reader.readAsDataURL(file)
  }
</script>

<!-- Панель для изменения свойств и предпросмотра -->
<div class="flex flex-col mb-4 p-4 border border-[var(--border-color)] rounded-2xl gap-2">
  <h3 class="font-bold text-lg">Настройка компонента</h3>

  <!-- Превью -->
  <Accordion {...accordionComponent as IAccordionProps}>
    <div class="flex flex-col">
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
      <h1>Содержимое компонента</h1>
    </div>
  </Accordion>

  <!-- Редактор свойств -->
  <div class="grid grid-cols-3 gap-2 mt-4">
    <label class="flex flex-col">
      <span>Тип</span>
      <select class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.type}>
        <option value="main">Main</option>
        <option value="sub">Sub</option>
      </select>
      <span>ID Value</span>
      <input type="text" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.id.value} />
      <span>ID Name</span>
      <input type="text" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.id.name} />
      <span>Открыт по умолчанию</span>
      <input type="checkbox" bind:checked={accordionComponent.isOpen} />
    </label>

    <label class="flex flex-col">
      <span>Label Name</span>
      <input type="text" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.label.name} />
      <span>Label Class</span>
      <input type="text" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.label.class} />
      <span>Label Align</span>
      <select class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.label.align}>
        <option value="left">Слева</option>
        <option value="center">По центру</option>
        <option value="right">Справа</option>
      </select>
    </label>

    <label class="flex flex-col">
      <span>Доп. классы CSS</span>
      <input type="text" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.componentClass} />
      <span>SVG иконка (строка)</span>
      <textarea rows="3" class="border rounded-2xl px-2 py-1 bg-[var(--back-color)]" bind:value={accordionComponent.icon.svg}></textarea>
      <FileAttach type="file" label={{ name: 'Image' }} accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
    </label>
  </div>
</div>

<!-- Панель примеров -->
<div class="flex flex-col p-2 border border-[var(--border-color)] rounded-2xl">
  <h3 class="font-bold text-lg mb-2">Примеры</h3>
  <Accordion
    id={{ value: crypto.randomUUID() }}
    label={{ name: 'Accordion MAIN', align: 'center' }}
    isOpen={false}
    type="main"
    componentClass="mb-2"
    icon={{
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24" ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9.173 14.83a4 4 0 1 1 5.657-5.657" /><pathd="m11.294 12.707l.174.247a7.5 7.5 0 0 0 8.845 2.492A9 9 0 0 1 5.642 18.36M3 12h1m8-9v1M5.6 5.6l.7.7M3 21L21 3"/></g></svg>',
    }}
  >
    <Accordion
      id={{ value: crypto.randomUUID() }}
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
      id={{ value: crypto.randomUUID() }}
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
      id={{ value: crypto.randomUUID() }}
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
      id={{ value: crypto.randomUUID() }}
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
</div>

<!-- Панель TODO -->
<div class="mt-8 border border-[var(--border-color)] rounded-2xl sticky bottom-0 bg-[var(--back-color)]">
  <h3 class="font-bold text-lg mb-2">Todo List:</h3>
  <div class="flex flex-col ml-8 text-left">
    <h5>1. Разобраться с прикреплением иконки к заголовку как svg поток</h5>
    <h5>2. Сделать автоматическое масштабирование иконки</h5>
    <h5>3. Разобраться со сварачиванием 3 и 4 аккордиона (Инна)</h5>
    <h5>4. Разобраться с прикреплением фона (добавил в isOpen style самого компонента, не уверен в правильности)</h5>
  </div>
</div>
