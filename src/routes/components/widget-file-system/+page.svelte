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

  /* Имитация устройства: CFG.FSInfo как его отдаёт прошивка, закачка — рост UlProg шагом 5% */
  let fsInfo: IWidgetFileSystemInfo = $state({
    FSTotal: 1441792,
    FSUsed: 1105920,
    FSFree: 335872,
    FileCount: 4,
    FSList: [
      { Name: "/littlefs/cert.pem", Size: 1834 },
      { Name: "/littlefs/20.00.000-01_14.bin", Size: 917504 },
      { Name: "/littlefs/notes.md", Size: 12288 },
      { Name: "/littlefs/very/long/path/to/some/deeply/nested/config.txt", Size: 512 },
    ],
  })
  let progress = $state(0)

  const recalc = () => {
    fsInfo.FSUsed = fsInfo.FSList.reduce((sum, f) => sum + f.Size, 0)
    fsInfo.FSFree = fsInfo.FSTotal - fsInfo.FSUsed
    fsInfo.FileCount = fsInfo.FSList.length
  }
  const mockDelete = (name: string) => {
    fsInfo.FSList = fsInfo.FSList.filter((f) => f.Name !== name)
    recalc()
  }
  const mockUpload = async (file: File) => {
    for (progress = 0; progress < 100; progress += 5) await new Promise((r) => setTimeout(r, 80))
    progress = 100
    fsInfo.FSList = [...fsInfo.FSList.filter((f) => f.Name !== `/littlefs/${file.name}`), { Name: `/littlefs/${file.name}`, Size: file.size }]
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
    eventHandler: { Header: "GET", Argument: "FSInfo", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetFileSystem
${formatObjectToString(fsComponent.properties as IWidgetFileSystemProps)}
value={fsInfo}
uploadProgress={progress}
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
        uploadProgress={progress}
        onRefresh={() => console.log("GET FSInfo (mock)")}
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
      <WidgetFileSystem value={{ FSTotal: 1441792, FSUsed: 8192, FSFree: 1433600, FileCount: 0, FSList: [] }} componentClass="bg-green" />
    </div>
  {/snippet}
</ComponentExample>
