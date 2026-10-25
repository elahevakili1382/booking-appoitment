export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3500)
  }
  return { toasts, show }
}