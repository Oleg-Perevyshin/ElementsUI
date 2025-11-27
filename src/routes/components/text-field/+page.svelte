<script lang="ts">
  import { type ITextFieldProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import TextField from '$lib/TextField/TextField.svelte'
  import TextFieldProps from '$lib/TextField/TextFieldProps.svelte'
  import { updateComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let textFieldComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'TextField',
    access: 'full',
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
      onPropertyChange={(updates) => (textFieldComponent = updateComponent(textFieldComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <TextFieldProps
      component={textFieldComponent as UIComponent & { properties: Partial<ITextFieldProps> }}
      onPropertyChange={(updates) => (textFieldComponent = updateComponent(textFieldComponent, updates as object))}
      
    /> -->
  {/snippet}
</ComponentExample>
