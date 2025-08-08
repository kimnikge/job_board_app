#!/usr/bin/env node

/**
 * БЫСТРОЕ ТЕСТИРОВАНИЕ РЕАЛЬНЫХ ДАННЫХ
 * Симулирует наполнение БД без подключения к Supabase
 * Создает JSON файлы с данными для frontend тестирования
 */

const fs = require('fs')
const path = require('path')

// Создаем структуру тестовых данных
const testData = {
  users: [
    // Работодатели
    {
      id: 'employer-1',
      email: 'arman.nazarbayev@astanafood.kz',
      full_name: 'Арман Назарбаев',
      phone: '+77011234567',
      user_type: 'employer',
      city_district_id: 2,
      is_verified: true,
      created_at: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'employer-2',
      email: 'aigul.suleimanova@goldenpalace.kz',
      full_name: 'Айгуль Сулейманова',
      phone: '+77012345678',
      user_type: 'employer',
      city_district_id: 1,
      is_verified: true,
      created_at: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'employer-3',
      email: 'aibek.zhakenov@pizzamaster.kz',
      full_name: 'Айбек Жакенов',
      phone: '+77015678901',
      user_type: 'employer',
      city_district_id: 2,
      is_verified: true,
      created_at: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    
    // Соискатели
    {
      id: 'jobseeker-1',
      email: 'daulet.mukhametov@mail.ru',
      full_name: 'Даулет Мухаметов',
      phone: '+77022345678',
      user_type: 'jobseeker',
      city_district_id: 2,
      experience_years: 8,
      is_verified: true,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'jobseeker-2',
      email: 'aida.nurpeisova@gmail.com',
      full_name: 'Аида Нурпеисова',
      phone: '+77023456789',
      user_type: 'jobseeker',
      city_district_id: 3,
      experience_years: 2,
      is_verified: true,
      created_at: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'jobseeker-3',
      email: 'amina.kozhakhmetova@gmail.com',
      full_name: 'Амина Кожахметова',
      phone: '+77027890123',
      user_type: 'jobseeker',
      city_district_id: 2,
      experience_years: 4,
      is_verified: true,
      created_at: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  companies: [
    {
      id: 'company-1',
      name: 'Ресторан "Астана"',
      description: 'Премиальный ресторан казахской и европейской кухни в центре Астаны. Известен авторскими блюдами шеф-повара и безупречным сервисом.',
      industry: 'Ресторан',
      size: 'medium',
      website: 'https://astanarestaurant.kz',
      email: 'info@astanarestaurant.kz',
      phone: '+77172501234',
      address: 'пр. Республики, 15',
      city_district_id: 2,
      logo_url: '/images/companies/astana-restaurant.jpg',
      is_verified: true,
      owner_id: 'employer-1'
    },
    {
      id: 'company-2',
      name: 'Golden Palace',
      description: 'Роскошный банкетный зал и ресторан для проведения торжеств. Специализируется на казахской национальной кухне и европейских деликатесах.',
      industry: 'Банкетный зал',
      size: 'large',
      website: 'https://goldenpalace.kz',
      email: 'booking@goldenpalace.kz',
      phone: '+77172505678',
      address: 'ул. Кунаева, 12/1',
      city_district_id: 1,
      logo_url: '/images/companies/golden-palace.jpg',
      is_verified: true,
      owner_id: 'employer-2'
    },
    {
      id: 'company-3',
      name: 'Pizza Master',
      description: 'Пиццерия с дровяной печью. Итальянские традиции в сердце Астаны. Доставка по всему городу за 30 минут.',
      industry: 'Пиццерия',
      size: 'medium',
      website: 'https://pizzamaster.kz',
      email: 'order@pizzamaster.kz',
      phone: '+77172515432',
      address: 'ул. Абая, 25',
      city_district_id: 2,
      logo_url: '/images/companies/pizza-master.jpg',
      is_verified: true,
      owner_id: 'employer-3'
    }
  ],

  urgentJobs: [
    {
      id: 'urgent-1',
      title: 'СРОЧНО! Повар в банкетный зал',
      description: 'Требуется опытный повар для работы в банкетном зале на корпоратив. Знание казахской и европейской кухни обязательно. Высокая оплата за срочность!',
      company_id: 'company-2',
      company_name: 'Golden Palace',
      company_logo: '/images/companies/golden-palace.jpg',
      specialization_id: 1,
      employment_type: 'temporary',
      location: 'ул. Кунаева, 12/1',
      city_district_id: 1,
      salary_min: 15000,
      salary_max: 25000,
      pay_per_shift: 20000,
      currency: 'KZT',
      needed_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      needed_time: '18:00',
      shift_duration: '6 часов',
      contact_person: 'Айгуль Сулейманова',
      contact_phone: '+77172505678',
      contact_telegram: 'aigul_chef',
      auto_close_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      notification_priority: 1,
      status: 'open',
      created_by: 'employer-2',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['срочно', 'банкет', 'высокая_оплата', 'опыт_обязателен'],
      is_urgent: true,
      requirements: [
        'Опыт работы поваром от 2 лет',
        'Знание казахской кухни',
        'Знание европейской кухни',
        'Умение работать в стрессовых ситуациях',
        'Санитарная книжка'
      ],
      responsibilities: [
        'Приготовление блюд казахской кухни',
        'Приготовление европейских блюд',
        'Работа на банкете на 100 человек',
        'Соблюдение технологий приготовления',
        'Поддержание чистоты рабочего места'
      ]
    },
    {
      id: 'urgent-2',
      title: 'Официант на вечернюю смену СЕГОДНЯ',
      description: 'Заболел официант, срочно нужна замена на вечернюю смену. Опыт работы в ресторанах обязателен. Знание английского языка приветствуется.',
      company_id: 'company-1',
      company_name: 'Ресторан "Астана"',
      company_logo: '/images/companies/astana-restaurant.jpg',
      specialization_id: 8,
      employment_type: 'temporary',
      location: 'пр. Республики, 15',
      city_district_id: 2,
      salary_min: 8000,
      salary_max: 12000,
      pay_per_shift: 10000,
      currency: 'KZT',
      needed_date: new Date().toISOString(),
      needed_time: '17:00',
      shift_duration: '8 часов',
      contact_person: 'Арман Назарбаев',
      contact_phone: '+77011234567',
      contact_telegram: 'arman_astana',
      auto_close_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      notification_priority: 1,
      status: 'open',
      created_by: 'employer-1',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      tags: ['срочно', 'вечерняя_смена', 'опыт_в_ресторане', 'английский_плюс'],
      is_urgent: true,
      requirements: [
        'Опыт работы официантом от 6 месяцев',
        'Знание ресторанного этикета',
        'Презентабельный внешний вид',
        'Стрессоустойчивость',
        'Желательно знание английского языка'
      ],
      responsibilities: [
        'Обслуживание гостей ресторана',
        'Прием и оформление заказов',
        'Подача блюд и напитков',
        'Консультирование по меню',
        'Работа с кассовой системой'
      ]
    },
    {
      id: 'urgent-3',
      title: 'Кассир-администратор на выходные',
      description: 'Нужен кассир на выходные дни в пиццерию. Работа с кассовым аппаратом, прием заказов, работа с клиентами. Дружный коллектив!',
      company_id: 'company-3',
      company_name: 'Pizza Master',
      company_logo: '/images/companies/pizza-master.jpg',
      specialization_id: 17,
      employment_type: 'temporary',
      location: 'ул. Абая, 25',
      city_district_id: 2,
      salary_min: 6000,
      salary_max: 10000,
      pay_per_shift: 8000,
      currency: 'KZT',
      needed_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      needed_time: '10:00',
      shift_duration: '12 часов',
      contact_person: 'Айбек Жакенов',
      contact_phone: '+77015678901',
      contact_telegram: 'aibek_pizza',
      auto_close_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notification_priority: 2,
      status: 'open',
      created_by: 'employer-3',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      tags: ['выходные', 'касса', 'клиенты', 'дружный_коллектив'],
      is_urgent: true,
      requirements: [
        'Опыт работы кассиром желателен',
        'Навыки работы с компьютером',
        'Дружелюбность и вежливость',
        'Готовность работать в выходные',
        'Честность и ответственность'
      ],
      responsibilities: [
        'Работа на кассе',
        'Прием заказов по телефону',
        'Консультирование клиентов',
        'Ведение документооборота',
        'Поддержание порядка в зале'
      ]
    }
  ],

  regularJobs: [
    {
      id: 'job-1',
      title: 'Шеф-повар казахской кухни',
      description: 'Ищем креативного шеф-повара для развития меню казахской кухни в современном формате. Возможность реализовать свои идеи и создать уникальные блюда.',
      company_id: 'company-1',
      company_name: 'Ресторан "Астана"',
      company_logo: '/images/companies/astana-restaurant.jpg',
      specialization_id: 3,
      employment_type: 'full_time',
      experience_level: 'senior',
      location: 'пр. Республики, 15',
      city_district_id: 2,
      salary_min: 350000,
      salary_max: 500000,
      currency: 'KZT',
      benefits: ['медицинская страховка', 'корпоративное питание', 'обучение за счет компании', 'премии за результат'],
      requirements: ['опыт работы шеф-поваром от 5 лет', 'знание казахской кухни', 'навыки управления командой', 'креативность в создании блюд'],
      responsibilities: ['разработка и обновление меню', 'контроль качества блюд', 'управление кухонной бригадой', 'работа с поставщиками'],
      schedule: 'Пн-Вс, гибкий график',
      status: 'active',
      created_by: 'employer-1',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_urgent: false
    }
  ],

  resumes: [
    {
      id: 'resume-1',
      user_id: 'jobseeker-1',
      title: 'Повар казахской и европейской кухни',
      summary: 'Опытный повар с 8-летним стажем. Специализируюсь на казахской национальной кухне и европейских блюдах. Умею работать в команде и под давлением.',
      specialization_id: 1,
      experience_years: 8,
      education: 'Алматинский технологический университет, факультет пищевых технологий (2014)',
      skills: ['казахская кухня', 'европейская кухня', 'работа с мясом', 'супы и бульоны', 'горячие блюда', 'холодные закуски'],
      languages: ['Казахский (родной)', 'Русский (свободно)', 'Английский (базовый)'],
      work_experience: [
        {
          period: '2020-2024',
          company: 'Ресторан Алматы',
          position: 'Повар',
          description: 'Приготовление блюд казахской и европейской кухни, работа на горячем цехе'
        },
        {
          period: '2018-2020',
          company: 'Кафе Достар',
          position: 'Помощник повара',
          description: 'Подготовка продуктов, приготовление простых блюд'
        }
      ],
      achievements: ['Участник кулинарного конкурса "Вкусы Казахстана" 2023', 'Сертификат "Санитарные нормы в общепите"'],
      desired_salary_min: 180000,
      desired_salary_max: 250000,
      preferred_employment_type: 'full_time',
      preferred_schedule: 'Сменный график, готов к переработкам',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'resume-2',
      user_id: 'jobseeker-2',
      title: 'Официант с опытом работы в кафе',
      summary: 'Молодой и энергичный официант. Быстро обучаюсь, стрессоустойчива, умею находить подход к разным клиентам. Хочу развиваться в ресторанном бизнесе.',
      specialization_id: 8,
      experience_years: 2,
      education: 'АЮУ, факультет туризма и гостеприимства (студентка 3 курса)',
      skills: ['обслуживание клиентов', 'работа с кассой', 'знание меню', 'продажи', 'работа в команде'],
      languages: ['Казахский (родной)', 'Русский (свободно)', 'Английский (разговорный)', 'Турецкий (базовый)'],
      work_experience: [
        {
          period: '2023-2024',
          company: 'Кафе Sunrise',
          position: 'Официант',
          description: 'Обслуживание клиентов, прием заказов, работа с кассой'
        },
        {
          period: '2022-2023',
          company: 'Макдоналдс',
          position: 'Кассир',
          description: 'Работа с клиентами, касса, поддержание чистоты'
        }
      ],
      achievements: ['Диплом "Лучший сотрудник месяца" в кафе Sunrise', 'Сертификат курса "Культура обслуживания"'],
      desired_salary_min: 120000,
      desired_salary_max: 160000,
      preferred_employment_type: 'full_time',
      preferred_schedule: 'Готова к любому графику, включая выходные',
      is_active: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  specializations: [
    { id: 1, name: 'Повар', icon: '👨‍🍳', category: 'kitchen', avg_salary_kzt: 180000 },
    { id: 2, name: 'Су-шеф', icon: '👩‍🍳', category: 'kitchen', avg_salary_kzt: 250000 },
    { id: 3, name: 'Шеф-повар', icon: '🔥', category: 'kitchen', avg_salary_kzt: 400000 },
    { id: 8, name: 'Официант', icon: '🙋‍♂️', category: 'service', avg_salary_kzt: 130000 },
    { id: 11, name: 'Бариста', icon: '☕', category: 'service', avg_salary_kzt: 140000 },
    { id: 17, name: 'Кассир', icon: '💰', category: 'support', avg_salary_kzt: 110000 }
  ],

  districts: [
    { id: 1, name: 'Есиль', description: 'Левобережный административный район' },
    { id: 2, name: 'Алматы', description: 'Правобережный центральный район' },
    { id: 3, name: 'Сарыарка', description: 'Административный центр' },
    { id: 4, name: 'Байконыр', description: 'Северо-западный район' },
    { id: 5, name: 'Центральный', description: 'Исторический центр' }
  ]
}

// Создаем папку для данных
const dataDir = path.join(__dirname, '../frontend/src/data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Сохраняем каждую категорию данных в отдельный файл
Object.entries(testData).forEach(([key, data]) => {
  const filename = path.join(dataDir, `${key}.json`)
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✅ Создан файл: ${filename} (${data.length} записей)`)
})

// Создаем сводный файл со всеми данными
const allDataFile = path.join(dataDir, 'testData.json')
fs.writeFileSync(allDataFile, JSON.stringify(testData, null, 2), 'utf8')
console.log(`✅ Создан сводный файл: ${allDataFile}`)

// Создаем индексный файл для импорта
const indexFile = path.join(dataDir, 'index.js')
const indexContent = `// ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ОБЩЕПИТА АСТАНЫ
// Автоматически сгенерировано ${new Date().toLocaleString('ru-RU')}

${Object.keys(testData).map(key => 
  `import ${key}Data from './${key}.json'`
).join('\n')}

export {
${Object.keys(testData).map(key => `  ${key}Data`).join(',\n')}
}

export default {
${Object.keys(testData).map(key => `  ${key}: ${key}Data`).join(',\n')}
}

// Функции для работы с данными
export const getUrgentJobs = () => urgentJobsData.filter(job => job.status === 'open')
export const getJobById = (id) => [...urgentJobsData, ...regularJobsData].find(job => job.id === id)
export const getCompaniesByDistrict = (districtId) => companiesData.filter(company => company.city_district_id === districtId)
export const getUsersByType = (type) => usersData.filter(user => user.user_type === type)
export const getResumesBySpecialization = (specId) => resumesData.filter(resume => resume.specialization_id === specId)

console.log('📊 Загружены тестовые данные:', {
  users: usersData.length,
  companies: companiesData.length,
  urgentJobs: urgentJobsData.length,
  regularJobs: regularJobsData.length,
  resumes: resumesData.length,
  specializations: specializationsData.length,
  districts: districtsData.length
})
`

fs.writeFileSync(indexFile, indexContent, 'utf8')
console.log(`✅ Создан индексный файл: ${indexFile}`)

console.log('\n🎉 ТЕСТОВЫЕ ДАННЫЕ СОЗДАНЫ!')
console.log('📂 Файлы сохранены в: frontend/src/data/')
console.log('\n📝 Для использования в компонентах:')
console.log(`import { urgentJobsData, companiesData } from '@/data'`)
console.log(`import { getUrgentJobs, getJobById } from '@/data'`)

console.log('\n📊 СТАТИСТИКА:')
Object.entries(testData).forEach(([key, data]) => {
  console.log(`   ${key}: ${data.length} записей`)
})

console.log('\n🚀 Теперь можно запускать приложение с реальными данными!')
console.log('npm run dev && открыть http://localhost:8080/urgent')
