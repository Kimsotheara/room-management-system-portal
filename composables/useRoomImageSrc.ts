/**
 * Fetches room images from GET /api/rooms/{id}/images/{imageId}/file
 * with JWT auth and caches resulting blob URLs for the session lifetime.
 *
 * Use clearCache(roomId, imageId) after deleting an image so the next
 * render re-fetches the correct state.
 */

// Module-level cache — persists across component instances & page navigations
const _cache = new Map<string, string>()

export function useRoomImageSrc() {
  const config    = useRuntimeConfig()
  const authStore = useAuthStore()

  async function getImageSrc(roomId: number, imageId: number): Promise<string> {
    const key = `${roomId}:${imageId}`
    if (_cache.has(key)) return _cache.get(key)!

    const blob = await $fetch<Blob>(
      `/api/rooms/${roomId}/images/${imageId}/file`,
      {
        baseURL:      config.public.apiBaseUrl as string,
        headers:      authStore.accessToken
          ? { Authorization: `Bearer ${authStore.accessToken}` }
          : {},
        responseType: 'blob',
      },
    )

    const url = URL.createObjectURL(blob)
    _cache.set(key, url)
    return url
  }

  /**
   * Revoke and remove cached blob URLs.
   * - clearCache()             → clear everything
   * - clearCache(roomId)       → clear all images for a room
   * - clearCache(roomId, imgId)→ clear one specific image
   */
  function clearCache(roomId?: number, imageId?: number) {
    if (roomId === undefined) {
      _cache.forEach(url => URL.revokeObjectURL(url))
      _cache.clear()
      return
    }
    if (imageId === undefined) {
      const prefix = `${roomId}:`
      for (const [key, url] of _cache) {
        if (key.startsWith(prefix)) {
          URL.revokeObjectURL(url)
          _cache.delete(key)
        }
      }
      return
    }
    const key = `${roomId}:${imageId}`
    const url = _cache.get(key)
    if (url) URL.revokeObjectURL(url)
    _cache.delete(key)
  }

  return { getImageSrc, clearCache }
}
