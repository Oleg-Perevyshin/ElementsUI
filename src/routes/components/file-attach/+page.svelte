<script lang="ts">
  import ComponentExample from '$lib/ComponentExample.svelte'
  import FileAttach, { type IFileInputProps } from '$lib/FileAttach/FileAttach.svelte'
  import FileAttachProps from '$lib/FileAttach/FileAttachProps.svelte'
  import { updateComponent, type UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let fileAttachComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'FileAttach',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: '',
      label: { name: '', class: '' },
      accept: '*/*',
      type: 'file',
      imageSize: { height: '10rem', width: '10rem', fitMode: 'cover', form: 'square' },
      disabled: false,
      onChange: () => {},
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.FileAttach
${formatObjectToString(fileAttachComponent.properties as IFileInputProps)} 
  onChange={() => {}}
/>`)

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64WithPrefix = reader.result as string
      updateComponent(fileAttachComponent, { properties: { ['currentImage']: base64WithPrefix } })
    }
    reader.readAsDataURL(file)
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <FileAttach {...fileAttachComponent.properties as IFileInputProps} onChange={(event) => handleImageUpload(event)} />
  {/snippet}
  {#snippet componentProps()}
    <FileAttachProps
      component={fileAttachComponent as UIComponent & { properties: Partial<IFileInputProps> }}
      onPropertyChange={(updates) => (fileAttachComponent = updateComponent(fileAttachComponent, updates as object))}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
