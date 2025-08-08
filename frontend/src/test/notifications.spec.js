import { describe, it, expect, vi } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notificationService } from '@/services/notificationService.ts'

vi.mock('@/services/notificationService.ts', () => ({
  notificationService: {
    getNotifications: vi.fn(() => ({ value: [{ id: 1, message: 'Уведомление', read: false }] })),
    markAsRead: vi.fn(() => {}),
    clearAll: vi.fn(() => {})
  }
}))

describe('Уведомления (store)', () => {
  it('добавляет уведомление через store и помечает как прочитанное', async () => {
    const store = useNotificationsStore()
    const id = store.addNotification({ type: 'info', message: 'Уведомление' })
    expect(store.notifications.length).toBeGreaterThan(0)
    store.markAsRead(id)
    expect(store.unreadCount).toBe(0)
  })

  it('показывает специализированное уведомление о срочной вакансии', () => {
    const store = useNotificationsStore()
    const id = store.showUrgentJob('Официант на замену', 15000)
    const n = store.notifications.find(n => n.id === id)
    expect(n).toBeTruthy()
    expect(n.type).toBe('urgent_job')
    expect(n.message).toContain('Официант на замену')
  })
})
