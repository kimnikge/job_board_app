self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('jb-static-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
      '/favicon.ico'
    ]))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !['jb-static-v1'].includes(k)).map(k => caches.delete(k))
    ))
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(resp => {
        const copy = resp.clone()
        caches.open('jb-static-v1').then(c => c.put(request, copy))
        return resp
      }).catch(() => cached)
    })
  )
})
