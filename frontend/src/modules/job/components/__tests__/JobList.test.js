import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import JobList from '../JobList.vue'
import { useJobsStore } from '../../store'

// Mock the store
vi.mock('../../store', () => ({
  useJobsStore: vi.fn()
}))

describe('JobList', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  it('renders job cards and ApplicationForm', async () => {
    const mockJobs = [
      { id: 1, title: 'Повар', district: 'Центр', payment_per_shift: 2000 },
      { id: 2, title: 'Бариста', district: 'Север', payment_per_shift: 1800 }
    ]

    // Setup the mock store
    const mockStore = {
      jobs: mockJobs,
      loading: false,
      error: null,
      fetchJobs: vi.fn()
    }

    useJobsStore.mockReturnValue(mockStore)

    const wrapper = mount(JobList, {
      global: {
        plugins: [createTestingPinia({ 
          createSpy: vi.fn,
          initialState: {
            jobs: {
              jobs: mockJobs,
              loading: false,
              error: null
            }
          }
        })]
      }
    })

    await nextTick()
    
    // Проверяем, что карточки вакансий отображаются
    expect(wrapper.text()).toContain('Повар')
    expect(wrapper.text()).toContain('Бариста')
    expect(wrapper.text()).toContain('Центр')
    expect(wrapper.text()).toContain('Север')
  })

  it('shows loading state', async () => {
    const mockStore = {
      jobs: [],
      loading: true,
      error: null,
      fetchJobs: vi.fn()
    }

    useJobsStore.mockReturnValue(mockStore)

    const wrapper = mount(JobList, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            jobs: {
              jobs: [],
              loading: true,
              error: null
            }
          }
        })]
      }
    })

    expect(wrapper.text()).toContain('Загрузка')
  })

  it('shows error state', async () => {
    const mockStore = {
      jobs: [],
      loading: false,
      error: 'Ошибка загрузки',
      fetchJobs: vi.fn()
    }

    useJobsStore.mockReturnValue(mockStore)

    const wrapper = mount(JobList, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            jobs: {
              jobs: [],
              loading: false,
              error: 'Ошибка загрузки'
            }
          }
        })]
      }
    })

    expect(wrapper.text()).toContain('Ошибка загрузки')
  })
})
