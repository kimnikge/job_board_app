// ✨ API ПРОФИЛЯ - ЭТАП 4.1.4
import { supabase } from './supabase.js'

// 👤 Все операции с профилем и резюме
export const profileService = {
  // Получить профиль пользователя
  async getProfile(userId) {
    try {
      // Специальная обработка для тестового пользователя
      if (userId === 'test-user') {
        return {
          data: {
            id: 'test-user',
            user_id: 'test-user',
            full_name: 'Test User',
            phone: '+7 777 123 45 67',
            avatar_url: null,
            telegram_chat_id: '763612632', // Ваш реальный chat_id для тестирования
            specialization_id: 1,
            district_id: 1,
            experience_years: 1,
            about: 'Тестовый пользователь для проверки уведомлений',
            created_at: new Date().toISOString(),
            specializations: { name: 'Тестер', icon: '🧪' },
            city_districts: { name: 'Тестовый район' }
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

  // Создание или обновление профиля из данных Telegram авторизации
  async createOrUpdateProfile(userData) {
    try {
      if (isDemoMode) {
        // В demo режиме просто возвращаем данные из localStorage
        const profileData = {
          id: userData.id,
          telegram_id: userData.user_metadata?.telegram_id || userData.telegram_id,
          telegram_username: userData.user_metadata?.telegram_username || userData.username,
          full_name: userData.user_metadata?.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          role: userData.user_metadata?.user_type || 'candidate',
          phone: userData.user_metadata?.phone || null,
          photo_url: userData.user_metadata?.telegram_photo_url || userData.photo_url,
          is_ready_for_urgent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Demo режим: профиль создан локально', profileData)
        return { data: profileData, error: null }
      }

      // Данные для создания/обновления профиля в user_profiles таблице
      const profileData = {
        telegram_id: parseInt(userData.telegram_id || userData.user_metadata?.telegram_id),
        telegram_username: userData.telegram_username || userData.user_metadata?.telegram_username || userData.username,
        full_name: userData.full_name || userData.user_metadata?.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        role: userData.role || userData.user_metadata?.user_type || 'candidate',
        phone: userData.phone || userData.user_metadata?.phone || null,
        photo_url: userData.photo_url || userData.user_metadata?.telegram_photo_url || null,
        is_ready_for_urgent: false // По умолчанию не готов к срочным вакансиям
      }

      console.log('📝 Создание профиля в Supabase user_profiles:', profileData)

      // Используем upsert для создания или обновления по telegram_id
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'telegram_id', // Если пользователь с таким telegram_id уже есть - обновляем
          returning: 'representation'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка создания профиля в user_profiles:', error)
        return { data: null, error }
      }

      console.log('✅ Профиль успешно создан/обновлен в user_profiles:', data)
      return { data, error: null }

    } catch (error) {
      console.error('❌ Ошибка в profileService.createOrUpdateProfile:', error)
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
