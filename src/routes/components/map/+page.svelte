<script lang="ts">
  import { ProgressBar, type IMapProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Map from '$lib/Map/Map.svelte'
  import { updateComponent, type IDeviceGNSS } from '$lib/types'
  import { onDestroy, onMount } from 'svelte'
  import { formatObjectToString } from '../../common'
  import MapProps from '$lib/Map/MapProps.svelte'

  let data: IDeviceGNSS | null = $state(null)
  let intervalId: any | null = null

  // Храним уже созданные устройства для возможного обновления
  let existingDevices: string[] = []

  const generateRandomDevice = (): IDeviceGNSS => {
    const now = Date.now()

    // С вероятностью 30% обновляем существующее устройство
    if (existingDevices.length > 0 && Math.random() < 0.3) {
      const randomDevSN = existingDevices[Math.floor(Math.random() * existingDevices.length)]

      // Генерируем небольшое смещение от предыдущей позиции (чтобы было реалистично)
      const lat = (Math.random() * 180 - 90).toFixed(6)
      const lon = (Math.random() * 360 - 180).toFixed(6)
      const head = Math.floor(Math.random() * 360)

      console.log('🔄 Обновление устройства:', randomDevSN, head)

      return {
        NavLat: parseFloat(lat),
        NavLon: parseFloat(lon),
        NavAlt: Math.floor(Math.random() * 5000),
        DevName: randomDevSN.replace('SN-', 'Device-'), // опционально: сохранить имя
        DevSN: randomDevSN, // ← тот же SN!
        NavHeading: head,
        NavSatUse: Math.floor(Math.random() * 20) + 4,
      }
    }

    // Иначе — создаём новое устройство
    const lat = 50 + (Math.random() - 0.5) * 30 // от 35 до 65
    const lon = 30 + (Math.random() - 0.5) * 50 // от 5 до 55
    const head = Math.floor(Math.random() * 360)

    const newDevSN = `SN-${now.toString(36).slice(-8).toUpperCase()}`
    existingDevices.push(newDevSN) // сохраняем для будущих обновлений

    // Ограничиваем размер списка, чтобы не рос бесконечно
    if (existingDevices.length > 10) {
      existingDevices = existingDevices.slice(-10) // оставляем последние 20
    }

    console.log('🆕 Новое устройство:', newDevSN, head)

    return {
      NavLat: parseFloat(lat.toFixed(6)),
      NavLon: parseFloat(lon.toFixed(6)),
      NavAlt: Math.floor(Math.random() * 5000),
      DevName: `Device-${Math.floor(Math.random() * 100)}`,
      DevSN: newDevSN,
      NavHeading: head,
      NavSatUse: Math.floor(Math.random() * 20) + 4,
    }
  }

  let mapComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Map',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      label: { name: 'Label', class: 'text-center' },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  // Запуск симуляции
  onMount(() => {
    data = generateRandomDevice()
    intervalId = setInterval(() => {
      data = generateRandomDevice()
    }, 5000)
  })

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId)
  })

  let codeText = $derived(`
<UI.Map
${formatObjectToString(mapComponent.properties as IMapProps)} 
  {data}
/>`)
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="h-full">
      <Map {...mapComponent.properties as IMapProps} {data} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <MapProps
      component={mapComponent as UIComponent & { properties: Partial<IMapProps> }}
      onPropertyChange={(updates) => (mapComponent = updateComponent(mapComponent, updates as object))}
      forConstructor={true}
    />
    <hr />
    <MapProps
      component={mapComponent as UIComponent & { properties: Partial<IMapProps> }}
      onPropertyChange={(updates) => (mapComponent = updateComponent(mapComponent, updates as object))}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
