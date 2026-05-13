import { writable, get } from "svelte/store"

const ModalStore = writable<string[]>([])

export const ModalStack = {
  subscribe: ModalStore.subscribe,
  open: (id: string) => {
    ModalStore.update((state) => [...state, id])
  },
  close: (id: string) => {
    ModalStore.update((state) => state.filter((item) => item !== id))
  },
  getTopmost: () => {
    const state = get(ModalStore)
    return state[state.length - 1]
  },
  isInStack: (id: string) => {
    const state = get(ModalStore)
    return state.includes(id)
  },
}
