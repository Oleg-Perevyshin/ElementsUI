<script lang="ts">
  import { Button } from '$lib'

  import ButtonProps from '$lib/Button/ButtonProps.svelte'
  import type { IButtonProps, Position, UIComponent } from '$lib/types'

  let buttonComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Button',
    component: null,
    properties: {
      id: { name: '', value: crypto.randomUUID() },
      wrapperClass: '',
      label: { name: 'Label', class: 'text-center' },
      name: 'Button',
      componentClass: 'py-1 bg-blue',
      disabled: false,
      eventHandler: { Header: 'SET', Argument: 'Save', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })
</script>

<div>
  <Button {...buttonComponent.properties as IButtonProps} />
  <Button name="" />
</div>

<div class="code-block">
  <pre>{`
  <Button 
  name={${(buttonComponent.properties as IButtonProps).name ?? ''}} 
  />
  `}</pre>
</div>
