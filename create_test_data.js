// Скрипт для создания тестовых данных через Supabase SDK
import { supabase } from './frontend/src/lib/supabase.js'

async function createTestData() {
  console.log('Создаем тестовые данные...')

  try {
    // 1. Создаем справочники
    console.log('Добавляем специализации...')
    const { error: specError } = await supabase
      .from('specializations')
      .upsert([
        { name: 'Повар-тест', description: 'Приготовление блюд в ресторане' },
        { name: 'Официант-тест', description: 'Обслуживание гостей в зале' },
        { name: 'Бармен-тест', description: 'Приготовление напитков и коктейлей' },
        { name: 'Кондитер-тест', description: 'Приготовление десертов и выпечки' },
        { name: 'Су-шеф-тест', description: 'Помощник главного повара' },
        { name: 'Хостес-тест', description: 'Встреча и размещение гостей' },
        { name: 'Мойщик посуды-тест', description: 'Мытье посуды и кухонной утвари' },
        { name: 'Администратор-тест', description: 'Управление рестораном' }
      ], { onConflict: 'name' })

    if (specError) console.error('Ошибка при добавлении специализаций:', specError)

    console.log('Добавляем районы...')
    const { error: districtError } = await supabase
      .from('city_districts')
      .upsert([
        { name: 'Центр-тест', city: 'Москва' },
        { name: 'Арбат-тест', city: 'Москва' },
        { name: 'Сокольники-тест', city: 'Москва' },
        { name: 'Марьино-тест', city: 'Москва' },
        { name: 'Невский-тест', city: 'Санкт-Петербург' },
        { name: 'Василеостровский-тест', city: 'Санкт-Петербург' },
        { name: 'Кировский-тест', city: 'Санкт-Петербург' },
        { name: 'Ленинский-тест', city: 'Новосибирск' }
      ], { onConflict: 'name' })

    if (districtError) console.error('Ошибка при добавлении районов:', districtError)

    console.log('Добавляем типы заведений...')
    const { error: venueError } = await supabase
      .from('venue_types')
      .upsert([
        { name: 'Ресторан-тест', description: 'Полноценный ресторан с официантами' },
        { name: 'Кафе-тест', description: 'Небольшое заведение быстрого питания' },
        { name: 'Бар-тест', description: 'Питейное заведение с закусками' },
        { name: 'Пиццерия-тест', description: 'Специализация на пицце' },
        { name: 'Суши-бар-тест', description: 'Японская кухня' },
        { name: 'Кондитерская-тест', description: 'Специализация на десертах' },
        { name: 'Фастфуд-тест', description: 'Быстрое питание' },
        { name: 'Банкетный зал-тест', description: 'Проведение мероприятий' }
      ], { onConflict: 'name' })

    if (venueError) console.error('Ошибка при добавлении типов заведений:', venueError)

    // 2. Создаем компании
    console.log('Добавляем компании...')
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .upsert([
        {
          name: 'Ресторан Белуга-тест',
          description: 'Премиальный ресторан с авторской кухней',
          industry: 'Ресторанный бизнес',
          location: 'Москва, Центр',
          website: 'https://beluga-test.ru',
          employees_count: 50,
          status: 'active'
        },
        {
          name: 'Кафе Шоколадница-тест',
          description: 'Сеть кофеен с домашней атмосферой',
          industry: 'Кафе и кофейни',
          location: 'Москва, Арбат',
          website: 'https://shokoladnitsa-test.ru',
          employees_count: 200,
          status: 'active'
        },
        {
          name: 'Суши Мастер-тест',
          description: 'Японская кухня высокого качества',
          industry: 'Азиатская кухня',
          location: 'СПб, Невский',
          website: 'https://sushi-master-test.ru',
          employees_count: 30,
          status: 'active'
        },
        {
          name: 'Пиццерия Мама Рома-тест',
          description: 'Итальянская пиццерия с аутентичными рецептами',
          industry: 'Итальянская кухня',
          location: 'Москва, Сокольники',
          website: 'https://mama-roma-test.ru',
          employees_count: 25,
          status: 'active'
        },
        {
          name: 'Бар Лофт-тест',
          description: 'Стильный бар с крафтовыми коктейлями',
          industry: 'Бары и пабы',
          location: 'СПб, Василеостровский',
          website: 'https://loft-bar-test.ru',
          employees_count: 15,
          status: 'active'
        },
        {
          name: 'Кондитерская Сладкий дом-тест',
          description: 'Домашние торты и десерты',
          industry: 'Кондитерские',
          location: 'Москва, Марьино',
          website: 'https://sweet-home-test.ru',
          employees_count: 8,
          status: 'active'
        }
      ], { onConflict: 'name' })
      .select()

    if (companyError) {
      console.error('Ошибка при добавлении компаний:', companyError)
      return
    }

    // Получаем ID справочников для дальнейшего использования
    const { data: specializations } = await supabase
      .from('specializations')
      .select('id, name')
      .like('name', '%-тест')

    const { data: districts } = await supabase
      .from('city_districts')
      .select('id, name')
      .like('name', '%-тест')

    const { data: venueTypes } = await supabase
      .from('venue_types')
      .select('id, name')
      .like('name', '%-тест')

    // 3. Создаем кандидатов
    console.log('Добавляем кандидатов...')
    const candidatesData = [
      {
        full_name: 'Анна Петрова-тест',
        email: 'anna.petrova.test@example.com',
        phone: '+7 (915) 123-45-67',
        date_of_birth: '1995-03-15',
        location: 'Москва, Центр',
        specialization_id: specializations.find(s => s.name === 'Повар-тест')?.id,
        experience_years: 3,
        skills: ['Приготовление горячих блюд', 'Работа с морепродуктами', 'Французская кухня'],
        work_schedule: 'Полный день',
        desired_salary_min: 60000,
        desired_salary_max: 80000,
        is_available: true,
        bio: 'Опытный повар с любовью к кулинарии. Специализируюсь на французской кухне.',
        avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      {
        full_name: 'Дмитрий Сидоров-тест',
        email: 'dmitry.sidorov.test@example.com',
        phone: '+7 (916) 234-56-78',
        date_of_birth: '1992-07-22',
        location: 'Москва, Арбат',
        specialization_id: specializations.find(s => s.name === 'Официант-тест')?.id,
        experience_years: 5,
        skills: ['Обслуживание VIP-гостей', 'Знание винной карты', 'Английский язык'],
        work_schedule: 'Посменно',
        desired_salary_min: 45000,
        desired_salary_max: 65000,
        is_available: true,
        bio: 'Профессиональный официант с большим опытом работы в премиальных ресторанах.',
        avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg'
      },
      {
        full_name: 'Елена Козлова-тест',
        email: 'elena.kozlova.test@example.com',
        phone: '+7 (917) 345-67-89',
        date_of_birth: '1988-11-08',
        location: 'СПб, Невский',
        specialization_id: specializations.find(s => s.name === 'Бармен-тест')?.id,
        experience_years: 7,
        skills: ['Классические коктейли', 'Авторские миксы', 'Флейринг'],
        work_schedule: 'Вечерние смены',
        desired_salary_min: 50000,
        desired_salary_max: 70000,
        is_available: true,
        bio: 'Креативный бармен с международными сертификатами. Люблю создавать новые коктейли.',
        avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg'
      },
      {
        full_name: 'Александр Морозов-тест',
        email: 'alex.morozov.test@example.com',
        phone: '+7 (918) 456-78-90',
        date_of_birth: '1990-05-17',
        location: 'Москва, Сокольники',
        specialization_id: specializations.find(s => s.name === 'Кондитер-тест')?.id,
        experience_years: 4,
        skills: ['Французские десерты', 'Шоколадная продукция', 'Свадебные торты'],
        work_schedule: 'Дневные смены',
        desired_salary_min: 55000,
        desired_salary_max: 75000,
        is_available: true,
        bio: 'Талантливый кондитер, специалист по французским десертам и праздничным тортам.',
        avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg'
      },
      {
        full_name: 'Мария Волкова-тест',
        email: 'maria.volkova.test@example.com',
        phone: '+7 (919) 567-89-01',
        date_of_birth: '1993-09-25',
        location: 'СПб, Василеостровский',
        specialization_id: specializations.find(s => s.name === 'Су-шеф-тест')?.id,
        experience_years: 6,
        skills: ['Управление кухней', 'Составление меню', 'Контроль качества'],
        work_schedule: 'Полный день',
        desired_salary_min: 80000,
        desired_salary_max: 120000,
        is_available: true,
        bio: 'Опытный су-шеф с навыками управления. Отвечаю за качество всех блюд.',
        avatar_url: 'https://randomuser.me/api/portraits/women/5.jpg'
      }
    ]

    const { error: candidatesError } = await supabase
      .from('candidate_profiles')
      .upsert(candidatesData, { onConflict: 'email' })

    if (candidatesError) {
      console.error('Ошибка при добавлении кандидатов:', candidatesError)
      return
    }

    // 4. Создаем срочные вакансии
    console.log('Добавляем срочные вакансии...')
    const urgentJobsData = [
      {
        title: 'Повар на завтрак-тест',
        description: 'Срочно нужен повар для приготовления завтраков. Работа в утреннюю смену.',
        venue_name: 'Ресторан Белуга-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Ресторан-тест')?.id,
        address: 'ул. Тверская, 15',
        city_district_id: districts.find(d => d.name === 'Центр-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Повар-тест')?.id,
        needed_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // завтра
        needed_time: '07:00',
        duration_hours: 8,
        pay_per_shift: 3500,
        requirements: ['Опыт работы поваром', 'Знание европейской кухни', 'Медицинская книжка'],
        contact_person: 'Иван Ресторанов-тест',
        contact_phone: '+7 (925) 111-22-33',
        contact_email: 'ivan.restoranov.test@example.com',
        status: 'active'
      },
      {
        title: 'Официант на банкет-тест',
        description: 'Требуется опытный официант для обслуживания банкета на 100 человек.',
        venue_name: 'Банкетный зал Усадьба-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Банкетный зал-тест')?.id,
        address: 'ул. Красный проспект, 50',
        city_district_id: districts.find(d => d.name === 'Ленинский-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Официант-тест')?.id,
        needed_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // послезавтра
        needed_time: '16:00',
        duration_hours: 6,
        pay_per_shift: 2800,
        requirements: ['Опыт банкетного обслуживания', 'Презентабельный внешний вид', 'Стрессоустойчивость'],
        contact_person: 'Игорь Белов-тест',
        contact_phone: '+7 (921) 789-01-23',
        contact_email: 'igor.belov.test@example.com',
        status: 'active'
      },
      {
        title: 'Бармен в выходные-тест',
        description: 'Нужен бармен на выходные дни в популярный бар.',
        venue_name: 'Бар Лофт-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Бар-тест')?.id,
        address: 'Васильевский остров, 25',
        city_district_id: districts.find(d => d.name === 'Василеостровский-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Бармен-тест')?.id,
        needed_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        needed_time: '20:00',
        duration_hours: 10,
        pay_per_shift: 4200,
        requirements: ['Знание классических коктейлей', 'Быстрая работа', 'Коммуникабельность'],
        contact_person: 'Светлана Кафеева-тест',
        contact_phone: '+7 (925) 222-33-44',
        contact_email: 'svetlana.kafeeva.test@example.com',
        status: 'active'
      },
      {
        title: 'Кондитер на праздник-тест',
        description: 'Требуется кондитер для изготовления праздничных тортов.',
        venue_name: 'Кондитерская Сладкий дом-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Кондитерская-тест')?.id,
        address: 'ул. Братиславская, 10',
        city_district_id: districts.find(d => d.name === 'Марьино-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Кондитер-тест')?.id,
        needed_date: new Date().toISOString().split('T')[0], // сегодня
        needed_time: '09:00',
        duration_hours: 12,
        pay_per_shift: 5000,
        requirements: ['Опыт изготовления тортов', 'Художественные навыки', 'Креативность'],
        contact_person: 'Марко Пиццаро-тест',
        contact_phone: '+7 (925) 444-55-66',
        contact_email: 'marko.pizzaro.test@example.com',
        status: 'active'
      },
      {
        title: 'Мойщик посуды срочно-тест',
        description: 'Экстренно нужен мойщик посуды, предыдущий сотрудник заболел.',
        venue_name: 'Пиццерия Мама Рома-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Пиццерия-тест')?.id,
        address: 'Сокольническая площадь, 3',
        city_district_id: districts.find(d => d.name === 'Сокольники-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Мойщик посуды-тест')?.id,
        needed_date: new Date().toISOString().split('T')[0], // сегодня
        needed_time: '14:00',
        duration_hours: 8,
        pay_per_shift: 2000,
        requirements: ['Ответственность', 'Физическая выносливость', 'Медицинская книжка'],
        contact_person: 'Такеши Сушилов-тест',
        contact_phone: '+7 (925) 333-44-55',
        contact_email: 'takeshi.sushilov.test@example.com',
        status: 'active'
      },
      {
        title: 'Хостес на вечер-тест',
        description: 'Требуется хостес для встречи гостей в пятницу вечером.',
        venue_name: 'Суши Мастер-тест',
        venue_type_id: venueTypes.find(v => v.name === 'Суши-бар-тест')?.id,
        address: 'Невский проспект, 80',
        city_district_id: districts.find(d => d.name === 'Невский-тест')?.id,
        specialization_id: specializations.find(s => s.name === 'Хостес-тест')?.id,
        needed_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        needed_time: '18:00',
        duration_hours: 5,
        pay_per_shift: 1800,
        requirements: ['Знание английского языка', 'Приятная внешность', 'Коммуникабельность'],
        contact_person: 'Иван Ресторанов-тест',
        contact_phone: '+7 (925) 111-22-33',
        contact_email: 'ivan.restoranov.test@example.com',
        status: 'active'
      }
    ]

    const { error: urgentJobsError } = await supabase
      .from('urgent_jobs')
      .upsert(urgentJobsData, { onConflict: 'title' })

    if (urgentJobsError) {
      console.error('Ошибка при добавлении срочных вакансий:', urgentJobsError)
      return
    }

    console.log('✅ Все тестовые данные успешно созданы!')
    console.log('- Справочники: специализации, районы, типы заведений')
    console.log('- Компании: 6 тестовых компаний')
    console.log('- Кандидаты: 5 тестовых профилей')
    console.log('- Срочные вакансии: 6 активных вакансий')

  } catch (error) {
    console.error('Общая ошибка при создании данных:', error)
  }
}

// Запускаем создание данных
createTestData()
