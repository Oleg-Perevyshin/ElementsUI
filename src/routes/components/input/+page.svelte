<script lang="ts">
  import type { IInputProps, UIComponent } from '$lib'
  import Input from '$lib/Input/Input.svelte'
  import InputProps from '$lib/Input/InputProps.svelte'

  let inputComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Input',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: '',
      label: { name: 'Label', class: 'text-center' },
      type: 'text',
      componentClass: 'bg-max !resize-none',
      disabled: false,
      readonly: false,
      maxlength: 32,
      number: { minNum: 0, maxNum: 10, step: 1 },
      textareaRows: 3,
      placeholder: '',
      help: { copyButton: false, info: '', autocomplete: 'off' },
      eventHandler: { Header: 'SET', Argument: 'NoSend', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    inputComponent = {
      ...inputComponent,
      properties: updates.properties ? { ...inputComponent.properties, ...updates.properties } : inputComponent.properties,
    }
  }
</script>

<div>
  <Input {...inputComponent.properties as IInputProps} />

  <InputProps
    component={inputComponent as UIComponent & { properties: Partial<IInputProps> }}
    onPropertyChange={(value) => updateComponent(inputComponent.id, { properties: value } as object)}
  />
</div>
