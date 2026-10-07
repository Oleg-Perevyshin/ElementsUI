<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IWidgetFileSystemInfo, type IWidgetFileSystemProps } from "$lib/types"
  import WidgetFileSystem from "$lib/WidgetFileSystem/WidgetFileSystem.svelte"
  import WidgetFileSystemProps from "$lib/WidgetFileSystem/WidgetFileSystemProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetFileSystem/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация устройства: CFG.FS как его отдаёт прошивка, закачка — Upload.Progress шагом 5% */
  let fsInfo: IWidgetFileSystemInfo = $state({
    Total: 1441792,
    Used: 1105920,
    Free: 335872,
    List: [
      { Name: "/storage/cert.pem", Size: 1834 },
      { Name: "/storage/20.00.000-01_14.bin", Size: 917504 },
      { Name: "/storage/notes.md", Size: 12288 },
      { Name: "/storage/very/long/path/to/some/deeply/nested/config.txt", Size: 512 },
    ],
  })

  const recalc = () => {
    fsInfo.Used = fsInfo.List.reduce((sum, f) => sum + f.Size, 0)
    fsInfo.Free = fsInfo.Total - fsInfo.Used
  }
  const mockDelete = (name: string) => {
    fsInfo.List = fsInfo.List.filter((f) => f.Name !== name)
    recalc()
  }
  const mockUpload = async (file: File) => {
    for (let p = 0; p < 100; p += 5) {
      fsInfo.Upload = { Name: file.name, Size: file.size, Progress: p }
      await new Promise((r) => setTimeout(r, 80))
    }
    fsInfo.Upload = undefined
    fsInfo.List = [...fsInfo.List.filter((f) => f.Name !== `/storage/${file.name}`), { Name: `/storage/${file.name}`, Size: file.size }]
    recalc()
  }

  let fsComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetFileSystem",
    access: "full",
    properties: {
      label: { name: "Файловая система" },
      componentClass: "",
      accept: ".bin, .txt, .md, .pem",
    },
    eventHandler: { Header: "GET", Argument: "FS", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetFileSystem
${formatObjectToString(fsComponent.properties as IWidgetFileSystemProps)}
value={fsInfo}
onRefresh={handleRefresh}
onDelete={handleDelete}
onUpload={handleUpload}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetFileSystem
        {...fsComponent.properties as IWidgetFileSystemProps}
        value={fsInfo}
        onRefresh={() => console.log("GET FS (mock)")}
        onDelete={mockDelete}
        onUpload={mockUpload}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetFileSystemProps
      component={fsComponent as UIComponent & { properties: Partial<IWidgetFileSystemProps> }}
      onPropertyChange={(updates) => (fsComponent = updateComponent(fsComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetFileSystem value={{ Total: 1441792, Used: 8192, Free: 1433600, List: [] }} componentClass="bg-green" />
    </div>
  {/snippet}
</ComponentExample>
