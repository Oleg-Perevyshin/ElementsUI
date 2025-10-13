<script lang="ts">
  import FileAttach, { type IFileInputProps } from '$lib/FileAttach.svelte'

  let colorPickerComponent = $state({
    id: crypto.randomUUID(),
    type: 'FileAttach',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: '',
      label: { name: '', class: '' },
      type: 'file',
      accept: '*/*',
      imageSize: { height: '10rem', width: '10rem', fitMode: 'cover', form: 'square' },
      disabled: false,
      currentImage: null,
      onChange: () => {},
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })
</script>

<div>
  <FileAttach {...colorPickerComponent.properties as IFileInputProps} />
</div>
