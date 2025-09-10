// Service Worker для ShiftworkKZ с поддержкой push-уведомлений

const CACHE_NAME = 'jb-static-v1'

// Установка
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      '/',
      '/index.html',
      '/favicon.ico',
      '/manifest.webmanifest'
    ]))
  )
  self.skipWaiting()
})

// Активация
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![CACHE_NAME].includes(k)).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image,
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const action = event.action

  if (action === 'view') {
    // Открыть страницу с деталями
    event.waitUntil(
      clients.openWindow(data.url || '/')
    )
  } else if (action === 'dismiss') {
    // Просто закрыть уведомление
  } else {
    // Открыть приложение
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        const url = data.url || '/'
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
    )
  }
})

// Кэширование
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(resp => {
        const copy = resp.clone()
        caches.open(CACHE_NAME).then(c => c.put(request, copy))
        return resp
      }).catch(() => cached)
    })
  )
})
