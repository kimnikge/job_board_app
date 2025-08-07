/**
 * 🚨 API СЕРВИС ДЛЯ СРОЧНЫХ ВАКАНСИЙ
 * 
 * Сервис для работы с urgent_jobs таблицей в Supabase
 */

import { supabase, executeQuery, subscribeToTable } from '../../../core/api/supabaseClient.js'
import { moduleEvents, SYSTEM_EVENTS } from '../../../core/events/moduleEvents.js'

/**
 * 🏢 УПРАВЛЕНИЕ СРОЧНЫМИ ВАКАНСИЯМИ
 */
export class UrgentJobsAPI {
  constructor() {
    this.tableName = 'urgent_jobs'
    this.subscriptions = new Map()
  }

  /**
   * 📝 СОЗДАНИЕ СРОЧНОЙ ВАКАНСИИ
   */
  async createUrgentJob(jobData) {
    return executeQuery(async () => {
      // Подготавливаем данные с автозакрытием
      const now = new Date()
      const expiresAt = new Date(now.getTime() + (jobData.hoursUntilExpiry || 24) * 60 * 60 * 1000)
      
      const urgentJobData = {
        title: jobData.title,
        description: jobData.description,
        company_id: jobData.company_id,
        specialization_id: jobData.specialization_id,
        venue_type_id: jobData.venue_type_id,
        city_district_id: jobData.city_district_id,
        
        // Зарплата
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_currency: 'KZT', // Всегда тенге для Астаны
        
        // Срочность
        urgency_level: jobData.urgency_level || 'high', // high, critical
        needed_date: jobData.needed_date || new Date().toISOString().split('T')[0], // сегодня
        hours_until_expiry: jobData.hoursUntilExpiry || 24,
        expires_at: expiresAt.toISOString(),
        
        // Контакты
        contact_phone: jobData.contact_phone,
        contact_telegram: jobData.contact_telegram,
        instant_contact: jobData.instant_contact || false,
        
        // Требования
        experience_required: jobData.experience_required || 'no_experience',
        additional_requirements: jobData.additional_requirements,
        
        // Условия
        work_schedule: jobData.work_schedule,
        benefits: jobData.benefits,
        
        // Местоположение
        venue_name: jobData.venue_name,
        venue_address: jobData.venue_address,
        
        // Статус
        status: 'active',
        views_count: 0,
        applications_count: 0,
        
        // Метаданные
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([urgentJobData])
        .select(`
          *,
          companies:company_id (
            name,
            logo_url,
            rating,
            verified
          ),
          specializations:specialization_id (
            name,
            icon,
            category
          ),
          venue_types:venue_type_id (
            name,
            icon
          ),
          city_districts:city_district_id (
            name,
            transport_info
          )
        `)
        .single()
      
      if (error) throw error
      
      // Отправляем событие о создании срочной вакансии
      moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_CREATED, data)
      
      return data
    }, 'Create urgent job')
  }

  /**
   * 📋 ПОЛУЧЕНИЕ АКТИВНЫХ СРОЧНЫХ ВАКАНСИЙ
   */
  async getActiveUrgentJobs(filters = {}) {
    return executeQuery(async () => {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          companies:company_id (
            name,
            logo_url,
            rating,
            verified
          ),
          specializations:specialization_id (
            name,
            icon,
            category
          ),
          venue_types:venue_type_id (
            name,
            icon
          ),
          city_districts:city_district_id (
            name,
            transport_info
          )
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString()) // Не истекшие
        .order('created_at', { ascending: false })
      
      // Фильтры
      if (filters.specialization_id) {
        query = query.eq('specialization_id', filters.specialization_id)
      }
      
      if (filters.city_district_id) {
        query = query.eq('city_district_id', filters.city_district_id)
      }
      
      if (filters.venue_type_id) {
        query = query.eq('venue_type_id', filters.venue_type_id)
      }
      
      if (filters.urgency_level) {
        query = query.eq('urgency_level', filters.urgency_level)
      }
      
      if (filters.salary_min) {
        query = query.gte('salary_min', filters.salary_min)
      }
      
      if (filters.needed_today) {
        const today = new Date().toISOString().split('T')[0]
        query = query.eq('needed_date', today)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data || []
    }, 'Get active urgent jobs')
  }

  /**
   * 🔍 ПОЛУЧЕНИЕ СРОЧНОЙ ВАКАНСИИ ПО ID
   */
  async getUrgentJobById(id) {
    return executeQuery(async () => {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          companies:company_id (
            name,
            logo_url,
            rating,
            verified,
            description,
            website,
            phone,
            address
          ),
          specializations:specialization_id (
            name,
            icon,
            category,
            description
          ),
          venue_types:venue_type_id (
            name,
            icon,
            description
          ),
          city_districts:city_district_id (
            name,
            transport_info,
            metro_stations
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      // Увеличиваем счетчик просмотров
      await this.incrementViews(id)
      
      return data
    }, 'Get urgent job by ID')
  }

  /**
   * 📱 ОТКЛИК НА СРОЧНУЮ ВАКАНСИЮ ("ГОТОВ ВЫЙТИ!")
   */
  async applyToUrgentJob(jobId, applicationData) {
    return executeQuery(async () => {
      // Сохраняем отклик в таблице urgent_job_applications
      const { data: application, error: appError } = await supabase
        .from('urgent_job_applications')
        .insert([{
          urgent_job_id: jobId,
          user_id: applicationData.user_id,
          phone: applicationData.phone,
          telegram: applicationData.telegram,
          message: applicationData.message || 'ГОТОВ ВЫЙТИ!',
          available_immediately: applicationData.available_immediately || true,
          status: 'pending',
          applied_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (appError) throw appError
      
      // Увеличиваем счетчик откликов на вакансии
      await this.incrementApplications(jobId)
      
      // Отправляем уведомление работодателю
      moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_APPLICATION_RECEIVED, {
        jobId,
        application,
        applicant: applicationData
      })
      
      return application
    }, 'Apply to urgent job')
  }

  /**
   * ⏰ АВТОЗАКРЫТИЕ ИСТЕКШИХ ВАКАНСИЙ
   */
  async closeExpiredJobs() {
    return executeQuery(async () => {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'expired',
          updated_at: now 
        })
        .eq('status', 'active')
        .lt('expires_at', now)
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        console.log(`⏰ Closed ${data.length} expired urgent jobs`)
        
        // Отправляем событие о закрытии
        moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOBS_EXPIRED, data)
      }
      
      return data
    }, 'Close expired urgent jobs')
  }

  /**
   * 🔔 ПОЛУЧЕНИЕ ПЕРСОНАЛИЗИРОВАННЫХ УВЕДОМЛЕНИЙ
   */
  async getPersonalizedNotifications(userId) {
    return executeQuery(async () => {
      // Получаем профиль пользователя для персонализации
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('specializations, preferred_districts, ready_for_urgent')
        .eq('user_id', userId)
        .single()
      
      if (!profile || !profile.ready_for_urgent) {
        return []
      }
      
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          companies:company_id (name, rating),
          specializations:specialization_id (name, icon)
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Фильтр по специализациям пользователя
      if (profile.specializations && profile.specializations.length > 0) {
        query = query.in('specialization_id', profile.specializations)
      }
      
      // Фильтр по предпочитаемым районам
      if (profile.preferred_districts && profile.preferred_districts.length > 0) {
        query = query.in('city_district_id', profile.preferred_districts)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data || []
    }, 'Get personalized notifications')
  }

  /**
   * 📊 СТАТИСТИКА СРОЧНЫХ ВАКАНСИЙ
   */
  async getUrgentJobsStats() {
    return executeQuery(async () => {
      const [activeCount, todayCount, totalCount] = await Promise.all([
        // Активные срочные вакансии
        supabase
          .from(this.tableName)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString()),
        
        // Созданные сегодня
        supabase
          .from(this.tableName)
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        
        // Всего за все время
        supabase
          .from(this.tableName)
          .select('id', { count: 'exact', head: true })
      ])
      
      return {
        active: activeCount.count || 0,
        today: todayCount.count || 0,
        total: totalCount.count || 0
      }
    }, 'Get urgent jobs statistics')
  }

  /**
   * 📡 ПОДПИСКА НА REAL-TIME ОБНОВЛЕНИЯ
   */
  subscribeToUrgentJobs(callback) {
    const subscriptionId = `urgent-jobs-${Date.now()}`
    
    const subscription = subscribeToTable(
      this.tableName,
      (payload) => {
        console.log('🚨 Urgent job real-time update:', payload)
        
        // Обрабатываем разные типы событий
        switch (payload.eventType) {
          case 'INSERT':
            moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_CREATED, payload.new)
            break
          case 'UPDATE':
            moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_UPDATED, payload.new)
            break
          case 'DELETE':
            moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_DELETED, payload.old)
            break
        }
        
        callback(payload)
      },
      { event: '*' }
    )
    
    this.subscriptions.set(subscriptionId, subscription)
    
    return () => {
      const unsubscribe = this.subscriptions.get(subscriptionId)
      if (unsubscribe) {
        unsubscribe()
        this.subscriptions.delete(subscriptionId)
      }
    }
  }

  /**
   * 🔧 HELPER МЕТОДЫ
   */
  
  async incrementViews(jobId) {
    await supabase.rpc('increment_urgent_job_views', { job_id: jobId })
  }
  
  async incrementApplications(jobId) {
    await supabase.rpc('increment_urgent_job_applications', { job_id: jobId })
  }
  
  // Отписка от всех подписок
  unsubscribeAll() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions.clear()
  }
}

// Создаем singleton экземпляр
export const urgentJobsAPI = new UrgentJobsAPI()

console.log('🚨 Urgent Jobs API service ready!')
