export interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

// Module-scoped timer — the composable is a singleton, state is shared via useState.
let toastTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Global toast notification. State is shared across the app via useState,
 * and rendered once by <UiToast /> in the default layout.
 */
export const useToast = () => {
  const toast = useState<ToastMessage | null>('app-toast', () => null)

  function showToast(type: 'success' | 'error', message: string) {
    toast.value = { type, message }
    if (import.meta.client) {
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => { toast.value = null }, 3500)
    }
  }

  function dismiss() {
    toast.value = null
    if (toastTimer) clearTimeout(toastTimer)
  }

  return { toast, showToast, dismiss }
}
