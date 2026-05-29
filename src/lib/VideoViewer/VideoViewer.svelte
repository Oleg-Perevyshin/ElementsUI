<script lang="ts">
  import Button from "$lib/Button/Button.svelte"
  import Error from "$lib/libIcons/Error.svelte"
  import { T } from "$lib/locales/i18n"
  import type { IVideoViewerProps } from "$lib/types"
  import { onMount } from "svelte"

  let { id = crypto.randomUUID(), stream = $bindable(), onstream, ondevicechange }: IVideoViewerProps = $props()

  let videoElement = $state<HTMLVideoElement | null>(null)
  // let stream = $state<MediaStream | null>(null)
  let error = $state<string | null>(null)
  let isStreaming = $state(false)
  // let source = $state<MediaDeviceInfo[]>([])
  let loading = $state(false)

  // const getDevices = async (): Promise<(MediaDeviceInfo)[]> => {
  //   try {
  //     const deviceList = await navigator.mediaDevices.enumerateDevices()
  //     source = deviceList.filter((d) => d.kind === "videoinput")
  //     ondevicechange?.(source)
  //     return source
  //   } catch (e) {
  //     console.error("Failed to enumerate source:", e)
  //     return []
  //   }
  // }

  const startStream = async () => {
    loading = true
    error = null

    try {
      if (stream) stopStream()

      if (videoElement) {
        videoElement.srcObject = stream as MediaStream
        await videoElement.play()
        isStreaming = true
        onstream?.(stream as MediaStream)
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : $T("constructor.props.video.viewer.no.access")
      error = errorMessage
      console.error("Camera error:", e)
    } finally {
      loading = false
    }
  }

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
    if (videoElement) {
      videoElement.srcObject = null
    }
    isStreaming = false
  }

  // const captureScreenshot = (): string | null => {
  //   if (!videoElement || !isStreaming) return null

  //   const canvas = document.createElement("canvas")
  //   canvas.width = videoElement.videoWidth
  //   canvas.height = videoElement.videoHeight

  //   const context = canvas.getContext("2d")
  //   if (!context) return null

  //   context.drawImage(videoElement, 0, 0)
  //   return canvas.toDataURL("image/png")
  // }

  // const downloadScreenshot = (filename: string = "screenshot.png") => {
  //   const dataUrl = captureScreenshot()
  //   if (!dataUrl) return

  //   const link = document.createElement("a")
  //   link.href = dataUrl
  //   link.download = filename
  //   link.click()
  // }

  const handlePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" as PermissionName })
      if (permission.state === "granted") {
        // await getDevices()

        await startStream()
      } else if (permission.state === "prompt") {
        // await getDevices()
        await startStream()
      } else {
        error = $T("constructor.props.video.viewer.no.permission")
      }
    } catch {
      // await getDevices()
      await startStream()
    }
  }

  $effect(() => {
    if (typeof window !== "undefined" && "mediaDevices" in navigator) {
      handlePermission()
    }

    return () => {
      stopStream()
    }
  })

  onMount(() => {
    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", () => {
        if (!videoElement!.paused) {
          videoElement!.play().catch(console.error)
        }
      })
    }
  })
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class="relative h-full bg-(--border-color)/50 rounded-xl shadow-sm transition duration-200 hover:shadow-md"
>
  {#if loading}
    <div class="h-full w-full flex items-center justify-center rounded-xl bg-(--border-color)/50 z-10">
      <h2>{$T("constructor.props.video.viewer.loading")}</h2>
    </div>
  {/if}

  {#if error}
    <div class="h-full w-full flex flex-col items-center justify-center rounded-xl bg-(--border-color)/50 gap-4 z-10">
      <div class="flex flex-col items-center justify-center gap-4 text-red-500">
        <Error />
        <h4>{error}</h4>
      </div>
      <Button wrapperClass="w-fit" content={{ name: $T("library.retry") }} componentClass="bg-blue px-5" onClick={handlePermission} />
    </div>
  {/if}

  <video bind:this={videoElement} class="w-full h-full block {!isStreaming || loading ? 'hidden' : 'visible'}"></video>
</div>
