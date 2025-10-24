<script lang="ts">
  import { type ITextFieldProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import TextField from '$lib/TextField/TextField.svelte'
  import TextFieldProps from '$lib/TextField/TextFieldProps.svelte'
  import { formatObjectToString } from '../../common'

  let textFieldComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'TextField',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'text-[#333] dark:text-[#e2e3e7]',
      content: {
        name: 'Supporting text',
        class: 'text-center',
        size: 'large',
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.TextField
${formatObjectToString(textFieldComponent.properties as ITextFieldProps)} 
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    textFieldComponent = {
      ...textFieldComponent,
      properties: updates.properties ? { ...textFieldComponent.properties, ...updates.properties } : textFieldComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div>
      <TextField {...textFieldComponent.properties as ITextFieldProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TextFieldProps
      component={textFieldComponent as UIComponent & { properties: Partial<ITextFieldProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
