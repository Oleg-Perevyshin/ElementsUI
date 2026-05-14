import { writable } from "svelte/store"

const ModalStore = writable<string[]>([])

export const ModalStack = {
  subscribe: ModalStore.subscribe,
  open: (id: string) => {
    ModalStore.update((state) => [...state, id])
  },
  close: (id: string) => {
    ModalStore.update((state) => state.filter((item) => item !== id))
  },
}
