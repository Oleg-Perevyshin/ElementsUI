<script lang="ts">
  import { Table, type IMapProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Map from "$lib/Map/Map.svelte"
  import { updateComponent, type IDeviceGNSS } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { formatObjectToString, TableColumns } from "../../common"
  import MapProps from "$lib/Map/MapProps.svelte"

  let data: IDeviceGNSS | null = $state(null)
  let intervalId: any | null = null

  // Храним уже созданные устройства для возможного обновления
  let existingDevices: { sn: string; name: string }[] = []

  const randomHex = (length: number): string =>
    Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("")

  // Формат: 10.00.000-00_000068B60000B33B0000A520:D9
  const generateDevSN = (): string => `10.00.000-00_${randomHex(24)}:${randomHex(2)}`

  const generateRandomDevice = (): IDeviceGNSS => {
    // С вероятностью 30% обновляем существующее устройство
    if (existingDevices.length > 0 && Math.random() < 0.3) {
      const device = existingDevices[Math.floor(Math.random() * existingDevices.length)]

      // Генерируем небольшое смещение от предыдущей позиции (чтобы было реалистично)
      const lat = (Math.random() * 180 - 90).toFixed(6)
      const lon = (Math.random() * 360 - 180).toFixed(6)
      const head = Math.floor(Math.random() * 360)

      return {
        NavLat: parseFloat(lat),
        NavLon: parseFloat(lon),
        NavAlt: Math.floor(Math.random() * 5000),
        DevName: device.name,
        DevSN: device.sn, // ← тот же SN!
        NavHeading: head,
        NavSatUse: Math.floor(Math.random() * 20) + 4,
      }
    }

    // Иначе — создаём новое устройство
    const lat = 50 + (Math.random() - 0.5) * 30 // от 35 до 65
    const lon = 30 + (Math.random() - 0.5) * 50 // от 5 до 55
    const head = Math.floor(Math.random() * 360)

    const newDevSN = generateDevSN()
    const newDevName = `Device-${Math.floor(Math.random() * 100)}`
    existingDevices.push({ sn: newDevSN, name: newDevName })

    // Ограничиваем размер списка, чтобы не рос бесконечно
    if (existingDevices.length > 10) {
      existingDevices = existingDevices.slice(-10)
    }

    return {
      NavLat: parseFloat(lat.toFixed(6)),
      NavLon: parseFloat(lon.toFixed(6)),
      NavAlt: Math.floor(Math.random() * 5000),
      DevName: newDevName,
      DevSN: newDevSN,
      NavHeading: head,
      NavSatUse: Math.floor(Math.random() * 20) + 4,
    }
  }

  let mapComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Map",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Label", class: "text-center" },
      wrapperClass: "fdvgfvxd",
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
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

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Map
${formatObjectToString(mapComponent.properties as IMapProps)}
  {data}
/>`)

  const rows = [
    {
      name: "id",
      type: "string",
      default: "crypto.randomUUID()",
      description: "Уникальный идентификатор компонента",
    },
    {
      name: "label",
      type: "{ name?: string; class?: string }",
      default: '{ name: "", class: "" }',
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "data",
      type: "IDeviceGNSS | null",
      default: "undefined",
      description:
        "Данные устройства GNSS для отображения на карте; поддерживает двустороннее связывание (`$bindable`) — после обработки компонента значение сбрасывается в `null`",
    },
    {
      name: "markerIcon",
      type: "ConstructorOfATypedSvelteComponent | string | null",
      default: "undefined",
      description:
        "Кастомная иконка для маркеров устройств: может быть SVG-строкой или Svelte-компонентом; по умолчанию используется встроенная иконка стрелки с поворотом по курсу",
    },
    {
      name: "trackEnabled",
      type: "boolean",
      default: "false",
      description:
        "Включает отрисовку траектории движения устройств на карте; поддерживает двустороннее связывание (`$bindable`) — зритель может переключить прямо на карте",
    },
    {
      name: "trackLength",
      type: "number",
      default: "1000",
      description:
        "Максимальное количество последних точек в траектории каждого устройства (100 / 500 / 1000 / 5000 / 10000 / 50000); поддерживает двустороннее связывание (`$bindable`) — зритель может изменить прямо на карте",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="h-full">
      <Map {...mapComponent.properties as IMapProps} {data} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <MapProps
      component={mapComponent as UIComponent & { properties: Partial<IMapProps> }}
      onPropertyChange={(updates) => (mapComponent = updateComponent(mapComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="h-150">
      <Map label={{ name: "Карта" }} {data} trackEnabled trackLength={1000} />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
