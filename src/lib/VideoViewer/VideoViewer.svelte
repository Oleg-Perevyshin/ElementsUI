<script lang="ts">
  import FieldLabel from "../FieldLabel.svelte"
  import Button from "../Button/Button.svelte"
  import { T } from "../locales/i18n"
  import Select from "../Select/Select.svelte"
  import type { IOption, IVideoViewerProps } from "../types"
  import { onMount } from "svelte"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"

  let { accent, wrapperClass, label = { name: "", class: "" }, help, showSelect = true, source = "camera", frame = null, status }: IVideoViewerProps = $props()

  const isRemote = $derived(source === "remote")

  /* Цвет accent рисуется кольцом ring вокруг кадра: ring не меняет размеры контейнера, в отличие от border */
  const roleBorderClass = $derived(accent ? "ring-2 ring-inset ring-(--accent-text)" : "")

  let videoElement = $state<HTMLVideoElement | null>(null)
  let stream = $state<MediaStream | null>(null)
  let error = $state<string | null>(null)
  let isStreaming = $state(false)
  let sources = $state<MediaDeviceInfo[]>([])
  let loading = $state(false)
  let devId: string = $state("")
  /* Компонент убран или запрошен другой поток: камера, полученная после этого, сразу выключается */
  let destroyed = false
  let request = 0

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
      const current = ++request

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

      const acquired = await navigator.mediaDevices.getUserMedia(constraints)
      if (destroyed || current !== request) {
        acquired.getTracks().forEach((track) => track.stop())
        return
      }
      stream = acquired

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
    request++
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

  /* Список камер обновляется по событию devicechange (камеру подключили или отключили), без опроса */
  $effect(() => {
    if (isRemote || typeof navigator === "undefined" || !navigator.mediaDevices) return
    const media = navigator.mediaDevices
    const onChange = () => void getDevices()
    media.addEventListener("devicechange", onChange)
    return () => media.removeEventListener("devicechange", onChange)
  })

  onMount(() => {
    if (isRemote) return
    getDevices()
    if (typeof window !== "undefined" && "mediaDevices" in navigator) {
      handlePermission()
    }
    return () => {
      destroyed = true
      stopStream()
    }
  })

  /* Remote-режим: кадр приходит через проп frame, object URL создаётся заново на каждый кадр и отзывается перед следующим */
  let remoteImgSrc = $state<string | null>(null)
  $effect(() => {
    if (!isRemote || !frame) {
      remoteImgSrc = null
      return
    }
    const blob = frame instanceof Blob ? frame : new Blob([new Uint8Array(frame)], { type: "image/jpeg" })
    const url = URL.createObjectURL(blob)
    remoteImgSrc = url
    return () => URL.revokeObjectURL(url)
  })
</script>

<div class={twMerge("flex flex-col w-full h-full items-center", wrapperClass)} style={accentStyle(accent)}>
  <FieldLabel {label} info={help?.info} class="w-full justify-center px-4 text-center" />
  <!-- design-handoff, раздел 9: фон --container-color, радиус 14, оверлей загрузки без фиксированных отступов -->
  <div class={twMerge("relative flex w-full flex-1 items-center justify-center rounded-[14px]", roleBorderClass)}>
    {#if isRemote}
      {#if status !== "live" || !remoteImgSrc}
        <div class="absolute z-10 flex h-full w-full flex-col items-center justify-center gap-4 rounded-[14px] bg-(--container-color) p-4 text-center">
          {#if status === "error"}
            <svg class="w-12 h-12 text-(--red-text)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h5 class="text-(--red-text)">{$T("constructor.props.video.viewer.error")}</h5>
          {:else if status === "offline"}
            <h2>{$T("constructor.props.video.viewer.offline")}</h2>
          {:else}
            <h2>{$T("constructor.props.video.viewer.connecting")}</h2>
          {/if}
        </div>
      {/if}
      <div class="absolute h-full w-full overflow-hidden rounded-[14px] bg-(--container-color)">
        {#if remoteImgSrc}
          <img src={remoteImgSrc} alt={label.name || ""} class="block h-full w-full rounded-[14px] object-contain" />
        {/if}
      </div>
    {:else}
      {#if loading || error}
        <div class="absolute z-10 flex h-full w-full flex-col items-center justify-center gap-4 rounded-[14px] bg-(--container-color) p-4 text-center">
          {#if loading}
            <h2>{$T("constructor.props.camera.loading")}</h2>
          {:else if error}
            <svg class="w-12 h-12 text-(--red-text)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h5 class="text-(--red-text)">{error}</h5>
            <Button wrapperClass="w-fit" content={{ name: $T("library.retry") }} variant="primary" componentClass="px-5" onClick={handlePermission} />
          {/if}
        </div>
      {/if}
      <div class="absolute h-full w-full overflow-hidden rounded-[14px] bg-(--container-color)">
        <video bind:this={videoElement} class="block h-full w-full rounded-[14px] object-contain {!isStreaming || loading ? 'invisible' : 'visible'}"></video>
      </div>
    {/if}
  </div>

  {#if !isRemote && sources.length > 1 && showSelect}
    {@const deviceOptions = sources.map((dev) => {
      return { id: dev.deviceId, name: dev.label, value: dev.deviceId }
    })}
    <Select
      wrapperClass="w-[50%]"
      disabled={deviceOptions.length == 0}
      type="buttons"
      label={{ name: $T("constructor.props.source") }}
      value={devId || deviceOptions[0]?.value}
      options={deviceOptions}
      onUpdate={async (value) => {
        stopStream()
        devId = value
        await startStream(devId)
      }}
    />
  {/if}
</div>
