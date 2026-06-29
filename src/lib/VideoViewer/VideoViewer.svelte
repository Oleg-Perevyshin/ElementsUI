<script lang="ts">
  import Button from "$lib/Button/Button.svelte"
  import Error from "$lib/libIcons/Error.svelte"
  import { T } from "$lib/locales/i18n"
  import Select from "$lib/Select/Select.svelte"
  import type { IOption, IVideoViewerProps } from "$lib/types"
  import { onMount } from "svelte"
  import { twMerge } from "tailwind-merge"

  let { id = crypto.randomUUID(), wrapperClass, label = { name: "", class: "" }, showSelect = true }: IVideoViewerProps = $props()

  let videoElement = $state<HTMLVideoElement | null>(null)
  let stream = $state<MediaStream | null>(null)
  let error = $state<string | null>(null)
  let isStreaming = $state(false)
  let sources = $state<MediaDeviceInfo[]>([])
  let loading = $state(false)
  let devId: string = $state("")

  export const getDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      sources = deviceList.filter((d) => d.kind === "videoinput")
      return sources
    } catch (e) {
      return []
    }
  }

  export const startStream = async (devId?: string) => {
    loading = true
    error = null

    try {
      if (stream) stopStream()

      const deviceId = devId ?? sources[0].deviceId

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          ...(deviceId && { deviceId: { exact: deviceId } }),
        },
        audio: false,
      }

      stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoElement) {
        videoElement.srcObject = stream as MediaStream
        await videoElement.play()
        isStreaming = true
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : $T("constructor.props.video.viewer.no.access")
      error = errorMessage
      console.error("Camera error:", e)
    } finally {
      loading = false
    }
  }

  export const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
    if (videoElement) {
      videoElement.srcObject = null
    }
    isStreaming = false
  }

  const handlePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" as PermissionName })
      if (permission.state === "granted") {
        await getDevices()

        await startStream()
      } else if (permission.state === "prompt") {
        await getDevices()
        await startStream()
      } else {
        error = $T("constructor.props.video.viewer.no.permission")
      }
    } catch {
      await getDevices()
      await startStream()
    }
  }

  setInterval(async () => {
    sources = await getDevices()
  }, 1000)

  onMount(() => {
    getDevices()
    if (typeof window !== "undefined" && "mediaDevices" in navigator) {
      handlePermission()
    }
    return () => {
      stopStream()
    }
  })
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge("flex flex-col w-full h-full items-center", wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}
  <div class="relative flex flex-1 w-full items-center justify-center">
    {#if loading || error}
      <div class="absolute h-full w-full rounded-2xl px-40 py-15 flex flex-col items-center justify-center bg-(--border-color)/50 gap-4 z-10">
        {#if loading}
          <h2>{$T("constructor.props.camera.loading")}</h2>
        {:else if error}
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h5 class="text-red-600">{error}</h5>
          <Button wrapperClass="w-fit" content={{ name: $T("library.retry") }} componentClass="bg-blue px-5" onClick={handlePermission} />
        {/if}
      </div>
    {/if}
    <div class="absolute h-full w-full rounded-2xl bg-(--border-color)/50">
      <video bind:this={videoElement} class="h-full w-full rounded-2xl object-contain block {!isStreaming || loading ? 'invisible' : 'visible'}"></video>
    </div>
  </div>

  {#if showSelect}
    {@const deviceOptions = sources.map((dev) => {
      return { id: dev.deviceId, name: dev.label, value: dev.deviceId }
    })}
    <Select
      wrapperClass="w-[50%]"
      disabled={deviceOptions.length == 0}
      type="buttons"
      label={{ name: $T("constructor.props.source") }}
      value={deviceOptions.find((p) => p.value == devId) || deviceOptions[0]}
      options={deviceOptions}
      onUpdate={async (value) => {
        stopStream()
        devId = (value as IOption).value as string
        await startStream(devId)
      }}
    />
  {/if}
</div>
