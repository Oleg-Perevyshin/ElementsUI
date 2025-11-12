<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { updateProperty, type ISelectOption, type ITabsProps, type UIComponent } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { ICONS } from '../icons'
  import Modal from '$lib/Modal.svelte'
  import Button from '$lib/Button/Button.svelte'
  import CrossIcon from '$lib/libIcons/CrossIcon.svelte'
  import ButtonAdd from '$lib/libIcons/ButtonAdd.svelte'
  import ButtonDelete from '$lib/libIcons/ButtonDelete.svelte'
  import { twMerge } from 'tailwind-merge'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITabsProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()

  let showIconLib = $state(false)
  let tabIcon = $state({ index: 0, isModalOpen: false })

  const initialType = $derived($optionsStore.ACCORDION_TYPE_OPTIONS.find((t) => t.value === component.properties.outline))

  const initialAlign = $derived(
    $optionsStore.JUSTIFY_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('justify-'))),
    ),
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )

  const initialPosition = $derived(
    $optionsStore.ICON_TEXT_POSITION_OPTIONS.find((c) =>
      (c.value as string).includes(
        component.properties.items
          .find((item: ISelectOption) => item.class?.includes('flex-'))
          .class.split(' ')
          .find((cls: string) => cls.startsWith('flex-')),
      ),
    ),
  )

  const initialWidth = $derived(() => {
    let width = component.properties.items.find((item: ISelectOption) => item.class?.split(' ').find((cls: string) => cls.startsWith('w-')))
    if (!width) {
      return 1
    } else if (width.class.includes('w-auto')) return 1
    else return 2
  })

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      updateProperty('image', base64String, component, onPropertyChange)
    }
    reader.readAsDataURL(file)
  }
</script>

{#if forConstructor}
  <div class="flex items-center justify-center gap-8">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.JUSTIFY_ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />

      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS.slice(1)}
        value={initialColor}
        onUpdate={(option) => {
          updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)
          component.properties.items.forEach((_item: any, index: number) => {
            const items = [...(component.properties?.items || [])]
            items[index]['class'] = twMerge(items[index].class, `text-${option.value?.slice(3)}-500`)
            updateProperty('items', items, component, onPropertyChange)
          })
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.icon.text.position') }}
        type="buttons"
        options={$optionsStore.ICON_TEXT_POSITION_OPTIONS}
        value={initialPosition}
        onUpdate={(option) => {
          component.properties.items.forEach((_item: any, index: number) => {
            const items = [...(component.properties?.items || [])]
            items[index]['class'] = twMerge(items[index].class, option.value)
            updateProperty('items', items, component, onPropertyChange)
          })
        }}
      />
      <UI.Switch
        label={{
          name: $t('constructor.props.widthMode'),
          captionLeft: $t('constructor.props.height.small'),
          captionRight: $t('constructor.props.equal'),
        }}
        value={initialWidth()}
        onChange={(value) => {
          if (value === 2) {
            component.properties.items.forEach((_item: any, index: number) => {
              const items = [...(component.properties?.items || [])]
              items[index]['class'] = twMerge(items[index].class, `w-[${(1 / items.length) * 100}%]`)
              updateProperty('items', items, component, onPropertyChange)
            })
          } else {
            component.properties.items.forEach((_item: any, index: number) => {
              const items = [...(component.properties?.items || [])]
              items[index]['class'] = twMerge(items[index].class, 'w-auto')
              updateProperty('items', items, component, onPropertyChange)
            })
          }
        }}
      />
    </div>
  </div>

  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.tabs.title')}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          let tabWidth = Math.max(...Array.from(document.body.querySelectorAll('.tab')).map((item) => (item as HTMLElement).offsetWidth))
          const newItem: { name: string; icon: string; class: string } = {
            name: `Tab ${component.properties?.items.length + 1}`,
            class: `w-${initialWidth() === 2 ? `[${tabWidth}px]` : 'auto'} text-${initialColor?.value.slice(3)}-500 ${initialPosition?.value}`,
            icon: '',
          }
          const items = [...(component.properties?.items || []), newItem]
          updateProperty('items', items, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.items || [] as tab, index}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('constructor.props.optionname') }}
          wrapperClass="w-5/10"
          value={tab.name}
          onUpdate={(value) => {
            const items = [...(component.properties?.items || [])]
            items[index]['name'] = value
            updateProperty('items', items, component, onPropertyChange)
          }}
        />
        <div class="relative mt-5 flex w-3/10 gap-2">
          <UI.Button content={{ name: $t('constructor.props.labelicon') }} onClick={() => (tabIcon = { index: index, isModalOpen: true })} />

          {#if tab.icon}
            <Button
              wrapperClass="w-8.5 "
              componentClass="p-0.5 bg-red"
              content={{ icon: CrossIcon }}
              onClick={() => {
                const items = [...(component.properties?.items || [])]
                items[index]['icon'] = ''
                updateProperty('items', items, component, onPropertyChange)
              }}
            />
          {/if}
        </div>

        {#if component.properties.items.length > 1}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonDelete }}
            onClick={() => {
              const items = [...(component.properties?.items || [])]
              items.splice(index, 1)
              updateProperty('items', items, component, onPropertyChange)
            }}
          />
        {/if}
      </div>
    {/each}
    {#if tabIcon.isModalOpen}
      <Modal bind:isOpen={tabIcon.isModalOpen} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-3">
            {#each ICONS as category}
              <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid grid-cols-3 place-items-center gap-2">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => {
                        const items = [...(component.properties?.items || [])]
                        items[tabIcon.index]['icon'] = icon as string
                        updateProperty('items', items, component, onPropertyChange)
                      }}
                    >
                      {@html icon}
                    </button>{/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </Modal>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center gap-8">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
        label={{ name: $t('constructor.props.id') }}
        value={component.properties.id}
        onUpdate={(value) => updateProperty('id', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.wrapperclass') }}
        value={component.properties.wrapperClass}
        onUpdate={(value) => updateProperty('wrapperClass', value as string, component, onPropertyChange)}
      />
      <div class="flex w-full gap-4">
        <UI.Input
          label={{ name: $t('constructor.props.size.height') }}
          value={component.properties.size.height}
          onUpdate={(value) => updateProperty('size.height', value as number, component, onPropertyChange)}
          number={{ minNum: 1, maxNum: 1000, step: 1 }}
          type="number"
        />
        <UI.Input
          label={{ name: $t('constructor.props.size.width') }}
          value={component.properties.size.width}
          onUpdate={(value) => updateProperty('size.width', value as number, component, onPropertyChange)}
          number={{ minNum: 1, maxNum: 1000, step: 1 }}
          type="number"
        />
      </div>
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.JUSTIFY_ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />

      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS.slice(1)}
        value={initialColor}
        onUpdate={(option) => {
          updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)
          component.properties.items.forEach((_item: any, index: number) => {
            const items = [...(component.properties?.items || [])]
            items[index]['class'] = twMerge(items[index].class, `text-${option.value?.slice(3)}-500`)
            updateProperty('items', items, component, onPropertyChange)
          })
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.icon.text.position') }}
        type="buttons"
        options={$optionsStore.ICON_TEXT_POSITION_OPTIONS}
        value={initialPosition}
        onUpdate={(option) => {
          component.properties.items.forEach((_item: any, index: number) => {
            const items = [...(component.properties?.items || [])]
            items[index]['class'] = twMerge(items[index].class, option.value)
            updateProperty('items', items, component, onPropertyChange)
          })
        }}
      />
      <UI.Switch
        label={{
          name: $t('constructor.props.widthMode'),
          captionLeft: $t('constructor.props.height.small'),
          captionRight: $t('constructor.props.equal'),
        }}
        value={initialWidth()}
        onChange={(value) => {
          if (value === 2) {
            component.properties.items.forEach((_item: any, index: number) => {
              let tabWidth = Math.max(...Array.from(document.body.querySelectorAll('.tab')).map((item) => (item as HTMLElement).offsetWidth))
              const items = [...(component.properties?.items || [])]
              items[index]['class'] = twMerge(items[index].class, `w-[${tabWidth}px]`)
              updateProperty('items', items, component, onPropertyChange)
            })
          } else {
            component.properties.items.forEach((_item: any, index: number) => {
              const items = [...(component.properties?.items || [])]
              items[index]['class'] = twMerge(items[index].class, 'w-auto')
              updateProperty('items', items, component, onPropertyChange)
            })
          }
        }}
      />
    </div>
  </div>

  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.tabs.title')}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          let tabWidth = Math.max(...Array.from(document.body.querySelectorAll('.tab')).map((item) => (item as HTMLElement).offsetWidth))
          const newItem: { name: string; icon: string; class: string } = {
            name: `Tab ${component.properties?.items.length + 1}`,
            class: `w-${initialWidth() === 2 ? `[${tabWidth}px]` : 'auto'} text-${initialColor?.value.slice(3)}-500 ${initialPosition?.value}`,
            icon: '',
          }
          const items = [...(component.properties?.items || []), newItem]
          updateProperty('items', items, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.items || [] as tab, index}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('constructor.props.optionname') }}
          wrapperClass="w-5/10"
          value={tab.name}
          onUpdate={(value) => {
            const items = [...(component.properties?.items || [])]
            items[index]['name'] = value
            updateProperty('items', items, component, onPropertyChange)
          }}
        />
        <div class="relative mt-5 flex w-3/10 gap-2">
          <UI.Button content={{ name: $t('constructor.props.labelicon') }} onClick={() => (tabIcon = { index: index, isModalOpen: true })} />

          {#if tab.icon}
            <Button
              wrapperClass="w-8.5 "
              componentClass="p-0.5 bg-red"
              content={{ icon: CrossIcon }}
              onClick={() => {
                const items = [...(component.properties?.items || [])]
                items[index]['icon'] = ''
                updateProperty('items', items, component, onPropertyChange)
              }}
            />
          {/if}
        </div>

        {#if component.properties.items.length > 1}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonDelete }}
            onClick={() => {
              const items = [...(component.properties?.items || [])]
              items.splice(index, 1)
              updateProperty('items', items, component, onPropertyChange)
            }}
          />
        {/if}
      </div>
    {/each}
    {#if tabIcon.isModalOpen}
      <Modal bind:isOpen={tabIcon.isModalOpen} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-3">
            {#each ICONS as category}
              <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid grid-cols-3 place-items-center gap-2">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => {
                        const items = [...(component.properties?.items || [])]
                        items[tabIcon.index]['icon'] = icon as string
                        updateProperty('items', items, component, onPropertyChange)
                      }}
                    >
                      {@html icon}
                    </button>{/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </Modal>
    {/if}
  </div>
{/if}
