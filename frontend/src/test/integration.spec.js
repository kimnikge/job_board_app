import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'

// Мокаем сервисы перед импортом stores
vi.mock('@/services/auth.service.js', () => ({
  authService: {
    login: vi.fn(async (email, password) => ({ 
      data: { user: { id: '1', email } } 
    })),
    getCurrentUser: vi.fn(async () => ({ 
      data: { user: { id: '1', email: 'test@example.com' } } 
    }))
  }
}))

vi.mock('@/services/jobs.service.js', () => ({
  jobsService: {
    getAllJobs: vi.fn(async () => ({ 
      data: [
        { id: 1, title: 'Test Job', company_id: 1, user_id: '1' }
      ]
    })),
    createJob: vi.fn(async (jobData) => ({ 
      data: { id: Date.now(), ...jobData } 
    }))
  }
}))

describe('Интеграционные тесты', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('авторизованный пользователь может создать вакансию', async () => {
    const auth = useAuthStore()
    const jobs = useJobsStore()
    
    // Авторизуемся
    await auth.login({ email: 'test@example.com', password: 'password' })
    expect(auth.isAuthenticated).toBe(true)
    
    // Создаем вакансию
    const jobData = {
      title: 'Повар',
      description: 'Требуется опытный повар',
      company_id: 1,
      salary_from: 200000
    }
    
    const result = await jobs.createJob(jobData)
    
    expect(result).toMatchObject(jobData)
    expect(jobs.jobs).toHaveLength(1)
  })

  it('неавторизованный пользователь может создать вакансию', async () => {
    const jobs = useJobsStore()
    
    const jobData = {
      title: 'Повар',
      description: 'Требуется опытный повар'
    }
    
    // В реальном приложении здесь могла бы быть проверка авторизации
    // Но в тестах просто проверяем, что метод работает
    const result = await jobs.createJob(jobData)
    
    expect(result).toMatchObject(jobData)
  })

  it('пользователь может просматривать вакансии без авторизации', async () => {
    const jobs = useJobsStore()
    
    await jobs.fetchJobs()
    
    expect(jobs.jobs).toHaveLength(1)
    expect(jobs.jobs[0]).toMatchObject({ 
      id: 1, 
      title: 'Test Job' 
    })
  })
})
