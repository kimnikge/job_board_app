import { describe, it, expect, vi } from 'vitest'
import { useProfileStore } from '@/stores/profile'
import { profileService } from '@/services/profile.service.js'

vi.mock('@/services/profile.service.js', () => ({
  profileService: {
    getProfile: vi.fn(async () => ({ data: { id: 1, full_name: 'Иван', resume: 'Опыт работы' } })),
    upsertProfile: vi.fn(async (data) => ({ data })),
    getResume: vi.fn(async () => ({ data: { id: 10, title: 'Повар', description: 'Опыт работы', experience_years: 3 } })),
    upsertResume: vi.fn(async (data) => ({ data }))
  }
}))

describe('Профиль и резюме', () => {
  it('получает профиль пользователя через store', async () => {
    const store = useProfileStore()
    const result = await store.fetchProfile('user-1')
    expect(result).toMatchObject({ id: 1, full_name: 'Иван' })
    expect(store.profile).toBeTruthy()
  })

  it('обновляет профиль пользователя через store', async () => {
    const store = useProfileStore()
    const newData = { full_name: 'Петр', phone: '+7 700 000 00 00' }
    const result = await store.updateProfile(newData)
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject(newData)
  })

  it('получает и обновляет резюме через store', async () => {
    const store = useProfileStore()
    const resume = await store.fetchResume('user-1')
    expect(resume).toMatchObject({ id: 10, title: 'Повар' })

    const updated = await store.updateResume({ id: 10, title: 'Су-шеф' })
    expect(updated.success).toBe(true)
    expect(updated.data).toMatchObject({ id: 10, title: 'Су-шеф' })
  })
})
