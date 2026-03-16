// Module-level cache so blob URLs survive across component instances
const _cache = new Map<string, string>()

export function useGuestImageSrc() {
  const config    = useRuntimeConfig()
  const authStore = useAuthStore()

  async function getImageSrc(guestId: number): Promise<string> {
    const key = `${guestId}`
    if (_cache.has(key)) return _cache.get(key)!

    const blob = await $fetch<Blob>(`/api/guests/${guestId}/profile-image`, {
      baseURL: config.public.apiBaseUrl as string,
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : {},
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    _cache.set(key, url)
    return url
  }

  function clearCache(guestId?: number) {
    if (guestId !== undefined) {
      const key = `${guestId}`
      const url = _cache.get(key)
      if (url) URL.revokeObjectURL(url)
      _cache.delete(key)
    } else {
      _cache.forEach(url => URL.revokeObjectURL(url))
      _cache.clear()
    }
  }

  return { getImageSrc, clearCache }
}
