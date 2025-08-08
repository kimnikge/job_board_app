// ✨ API ПРОФИЛЯ - ЭТАП 4.1.4
import { supabase, isDemoMode } from './supabase.js'

// 👤 Все операции с профилем и резюме
export const profileService = {
  // Получить профиль пользователя
  async getProfile(userId) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: 1,
            user_id: userId,
            full_name: 'Demo User',
            phone: '+7 777 123 45 67',
            avatar_url: null,
            specialization_id: 1,
            district_id: 1,
            experience_years: 3,
            about: 'Опытный специалист общепита',
            created_at: new Date().toISOString(),
            specializations: { name: 'Повар', icon: '👨‍🍳' },
            city_districts: { name: 'Есильский район' }
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .eq('user_id', userId)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
  },

  // Создать или обновить профиль
  async upsertProfile(profileData) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: 1,
            ...profileData,
            updated_at: new Date().toISOString()
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([profileData])
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Upsert profile error:', error)
      return { data: null, error }
    }
  },

  // Загрузить аватар
  async uploadAvatar(file, userId) {
    try {
      if (isDemoMode) {
        return {
          data: {
            path: `avatars/demo-${userId}.jpg`,
            publicUrl: '/images/default-avatar.png'
          },
          error: null
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Загружаем файл
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        return { data: null, error: uploadError }
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { data: { path: filePath, publicUrl }, error: null }
    } catch (error) {
      console.error('Upload avatar error:', error)
      return { data: null, error }
    }
  },

  // Получить резюме пользователя
  async getResume(userId) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: 1,
            user_id: userId,
            title: 'Повар-универсал',
            description: 'Опытный повар с 5-летним стажем',
            experience_years: 5,
            skills: ['Итальянская кухня', 'Приготовление пасты', 'Десерты'],
            work_experience: [
              {
                company: 'Ресторан Bella Vista',
                position: 'Повар',
                period: '2020-2023',
                description: 'Приготовление блюд итальянской кухни'
              }
            ],
            education: ['Кулинарный колледж'],
            languages: ['Русский', 'Казахский'],
            created_at: new Date().toISOString()
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', userId)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Get resume error:', error)
      return { data: null, error }
    }
  },

  // Создать или обновить резюме
  async upsertResume(resumeData) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: 1,
            ...resumeData,
            updated_at: new Date().toISOString()
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('user_resumes')
        .upsert([resumeData])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Upsert resume error:', error)
      return { data: null, error }
    }
  },

  // Получить заявки пользователя на вакансии
  async getUserApplications(userId) {
    try {
      if (isDemoMode) {
        return {
          data: [
            {
              id: 1,
              user_id: userId,
              job_id: 1,
              status: 'pending',
              created_at: new Date().toISOString(),
              job_postings: {
                title: 'Повар итальянской кухни',
                companies: { name: 'Grand Restaurant' }
              }
            }
          ],
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings(
            title,
            companies(name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Get user applications error:', error)
      return { data: null, error }
    }
  }
}

console.log('✅ Profile service initialized')
