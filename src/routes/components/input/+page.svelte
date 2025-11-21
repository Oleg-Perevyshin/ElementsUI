<script lang="ts">
  import { Graph, type IInputProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Input from '$lib/Input/Input.svelte'
  import InputProps from '$lib/Input/InputProps.svelte'
  import { formatObjectToString } from '../../common'

  let valid = $state(false)

  let inputComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Input',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      label: { name: 'Label', class: 'text-center' },
      componentClass: 'bg-max resize-none',
      type: 'text',
      maxlength: 32,
      number: { minNum: 0, maxNum: 10, step: 1 },
      textareaRows: 5,
      help: { copyButton: false, info: '', autocomplete: 'off', regExp: '/^[0-9a-zA-Z_-]{0,32}$/' },
      eventHandler: { Header: 'SET', Argument: 'NoSend', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Input
${formatObjectToString(inputComponent.properties as IInputProps)} 
  onUpdate={() => {}}
/>`)

  const updateComponent = (
    updates: Partial<{
      name: string
      access: 'full' | 'viewOnly' | 'hidden'
      properties: Partial<UIComponent['properties']>
    }>,
  ) => {
    inputComponent = {
      ...inputComponent,
      access: updates.access ?? inputComponent.access,
      name: updates.name ?? inputComponent.name,
      properties: updates.properties ? { ...inputComponent.properties, ...updates.properties } : inputComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div>
      <Input
        {...inputComponent.properties as IInputProps}
        onUpdate={(value) => {
          updateComponent({
            properties: { value: value },
          })
        }}
        bind:isValid={valid}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <InputProps
      component={inputComponent as UIComponent & { properties: Partial<IInputProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={true}
    />
    <hr />
    <InputProps
      component={inputComponent as UIComponent & { properties: Partial<IInputProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
