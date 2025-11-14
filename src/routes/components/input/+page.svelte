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

    properties: {
      id: crypto.randomUUID(),
      label: { name: 'Label', class: 'text-center' },
      componentClass: 'bg-max resize-none',
      type: 'text',
      maxlength: 32,
      number: { minNum: 0, maxNum: 10, step: 1 },
      textareaRows: 5,
      help: { copyButton: false, info: '', autocomplete: 'off', regExp: /^(?!^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$)[^<>:"/\\|?*]*$|^(?!.)$/i },
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

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    inputComponent = {
      ...inputComponent,
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
      <span>{valid}</span>
    </div>
  {/snippet}
  {#snippet componentProps()}
    <InputProps
      component={inputComponent as UIComponent & { properties: Partial<IInputProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
