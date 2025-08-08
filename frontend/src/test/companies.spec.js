import { describe, it, expect, vi } from 'vitest'
import { useCompaniesStore } from '@/stores/companies'
import { companiesService } from '@/services/companies.service.js'

vi.mock('@/services/companies.service.js', () => ({
  companiesService: {
    getAllCompanies: vi.fn(async () => ({
      data: [
        { id: 1, name: 'Grand Restaurant', venue_type_id: 1, district_id: 1, rating: 4.5, active_jobs_count: 3 },
        { id: 2, name: 'Cozy Cafe', venue_type_id: 2, district_id: 2, rating: 4.8, active_jobs_count: 1 }
      ]
    })),
    getCompanyById: vi.fn(async (id) => ({
      data: { id: parseInt(id), name: 'Test Company', description: 'Тестовая компания', rating: 4.5 }
    })),
    updateCompany: vi.fn(async (id, data) => ({ 
      data: { id: parseInt(id), ...data }
    })),
    getCompanyStats: vi.fn(async () => ({
      data: { totalJobs: 5, activeJobs: 3, totalApplications: 12 }
    }))
  }
}))

describe('Работа с компаниями', () => {
  it('получает список всех компаний', async () => {
    const companies = useCompaniesStore()
    
    await companies.fetchCompanies()
    
    expect(companies.companies.length).toBe(2)
    expect(companies.companies[0]).toMatchObject({ id: 1, name: 'Grand Restaurant' })
    expect(companiesService.getAllCompanies).toHaveBeenCalled()
  })

  it('получает компанию по ID', async () => {
    const companies = useCompaniesStore()
    
    const company = await companies.fetchCompanyById(1)
    
    expect(company).toMatchObject({ id: 1, name: 'Test Company' })
    expect(companies.currentCompany).toBeTruthy()
    expect(companiesService.getCompanyById).toHaveBeenCalledWith(1)
  })

  it('обновляет данные компании', async () => {
    const companies = useCompaniesStore()
    const updateData = { 
      id: 1, 
      name: 'Updated Restaurant', 
      description: 'Обновленное описание' 
    }
    
    const result = await companies.updateCompany(updateData)
    
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ id: 1, name: 'Updated Restaurant' })
    expect(companiesService.updateCompany).toHaveBeenCalledWith(1, updateData)
  })

  it('получает статистику компании', async () => {
    const companies = useCompaniesStore()
    
    const stats = await companies.fetchCompanyStats(1)
    
    expect(stats).toMatchObject({
      totalJobs: 5,
      activeJobs: 3,
      totalApplications: 12
    })
    expect(companiesService.getCompanyStats).toHaveBeenCalledWith(1)
  })

  it('фильтрует компании', async () => {
    const companies = useCompaniesStore()
    // Устанавливаем тестовые данные
    companies.companies = [
      { id: 1, district_id: 1, venue_type_id: 1, active_jobs_count: 3 },
      { id: 2, district_id: 2, venue_type_id: 1, active_jobs_count: 0 },
      { id: 3, district_id: 1, venue_type_id: 2, active_jobs_count: 1 }
    ]
    
    companies.updateFilters({ district: 1, hasJobs: true })
    
    expect(companies.filteredCompanies).toHaveLength(2)
    expect(companies.filteredCompanies.every(c => c.district_id === 1 && c.active_jobs_count > 0)).toBe(true)
  })
})
