// Скрипт для создания тестовых данных через Supabase SDK
import { createClient } from '@supabase/supabase-js'

// Читаем переменные окружения из .env.local
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), 'frontend', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)[1]
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1]

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      ])

    if (specError) console.error('Ошибка при добавлении специализаций:', specError)

    console.log('Добавляем районы...')
    const { error: districtError } = await supabase
      .from('city_districts')
      .upsert([
        { name: 'Центр-тест', metro_stations: ['Охотный ряд', 'Театральная'] },
        { name: 'Арбат-тест', metro_stations: ['Арбатская', 'Смоленская'] },
        { name: 'Сокольники-тест', metro_stations: ['Сокольники', 'Красносельская'] },
        { name: 'Марьино-тест', metro_stations: ['Марьино', 'Братиславская'] },
        { name: 'Невский-тест', metro_stations: ['Невский проспект', 'Маяковская'] },
        { name: 'Василеостровский-тест', metro_stations: ['Василеостровская', 'Спортивная'] },
        { name: 'Кировский-тест', metro_stations: ['Кировский завод', 'Автово'] },
        { name: 'Ленинский-тест', metro_stations: ['Площадь Ленина', 'Сибирская'] }
      ])

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
      ])

    if (venueError) console.error('Ошибка при добавлении типов заведений:', venueError)

    // 2. Создаем компании
    console.log('Добавляем компании...')
    
    // Получаем ID справочников для компаний
    const { data: venueTypesForCompanies } = await supabase
      .from('venue_types')
      .select('id, name')
      .like('name', '%-тест')

    const { data: districtsForCompanies } = await supabase
      .from('city_districts')
      .select('id, name')
      .like('name', '%-тест')

    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .upsert([
        {
          name: 'Ресторан Белуга-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Ресторан-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Центр-тест')?.id,
          address: 'ул. Тверская, 15',
          metro_station: 'Охотный ряд',
          description: 'Премиальный ресторан с авторской кухней',
          website: 'https://beluga-test.ru',
          phone: '+7 (495) 123-45-67',
          email: 'info@beluga-test.ru',
          verified: true
        },
        {
          name: 'Кафе Шоколадница-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Кафе-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Арбат-тест')?.id,
          address: 'ул. Арбат, 25',
          metro_station: 'Арбатская',
          description: 'Сеть кофеен с домашней атмосферой',
          website: 'https://shokoladnitsa-test.ru',
          phone: '+7 (495) 234-56-78',
          email: 'info@shokoladnitsa-test.ru',
          verified: true
        },
        {
          name: 'Суши Мастер-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Суши-бар-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Невский-тест')?.id,
          address: 'Невский проспект, 80',
          metro_station: 'Невский проспект',
          description: 'Японская кухня высокого качества',
          website: 'https://sushi-master-test.ru',
          phone: '+7 (812) 345-67-89',
          email: 'info@sushi-master-test.ru',
          verified: true
        },
        {
          name: 'Пиццерия Мама Рома-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Пиццерия-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Сокольники-тест')?.id,
          address: 'Сокольническая площадь, 3',
          metro_station: 'Сокольники',
          description: 'Итальянская пиццерия с аутентичными рецептами',
          website: 'https://mama-roma-test.ru',
          phone: '+7 (495) 456-78-90',
          email: 'info@mama-roma-test.ru',
          verified: true
        },
        {
          name: 'Бар Лофт-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Бар-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Василеостровский-тест')?.id,
          address: 'Васильевский остров, 25',
          metro_station: 'Василеостровская',
          description: 'Стильный бар с крафтовыми коктейлями',
          website: 'https://loft-bar-test.ru',
          phone: '+7 (812) 567-89-01',
          email: 'info@loft-bar-test.ru',
          verified: true
        },
        {
          name: 'Кондитерская Сладкий дом-тест',
          venue_type_id: venueTypesForCompanies?.find(v => v.name === 'Кондитерская-тест')?.id,
          district_id: districtsForCompanies?.find(d => d.name === 'Марьино-тест')?.id,
          address: 'ул. Братиславская, 10',
          metro_station: 'Марьино',
          description: 'Домашние торты и десерты',
          website: 'https://sweet-home-test.ru',
          phone: '+7 (495) 678-90-12',
          email: 'info@sweet-home-test.ru',
          verified: true
        }
      ])
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

    console.log('Найдено специализаций:', specializations?.length)
    console.log('Найдено районов:', districts?.length)
    console.log('Найдено типов заведений:', venueTypes?.length)

    // 3. Создаем кандидатов
    console.log('Добавляем кандидатов...')
    const candidatesData = [
      {
        first_name: 'Анна',
        last_name: 'Петрова-тест',
        phone: '+7 (915) 123-45-67',
        telegram_username: '@anna_petrova_test',
        avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
        primary_specialization_id: specializations?.find(s => s.name === 'Повар-тест')?.id,
        experience_years: 3,
        experience_description: 'Опытный повар с любовью к кулинарии. Специализируюсь на французской кухне.',
        expected_salary_monthly_min: 60000,
        expected_salary_monthly_max: 80000,
        expected_salary_shift_min: 2500,
        ready_for_urgent: true,
        ready_tomorrow: true
      },
      {
        first_name: 'Дмитрий',
        last_name: 'Сидоров-тест',
        phone: '+7 (916) 234-56-78',
        telegram_username: '@dmitry_sidorov_test',
        avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg',
        primary_specialization_id: specializations?.find(s => s.name === 'Официант-тест')?.id,
        experience_years: 5,
        experience_description: 'Профессиональный официант с большим опытом работы в премиальных ресторанах.',
        expected_salary_monthly_min: 45000,
        expected_salary_monthly_max: 65000,
        expected_salary_shift_min: 2000,
        ready_for_urgent: true,
        ready_tomorrow: false
      },
      {
        first_name: 'Елена',
        last_name: 'Козлова-тест',
        phone: '+7 (917) 345-67-89',
        telegram_username: '@elena_kozlova_test',
        avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg',
        primary_specialization_id: specializations?.find(s => s.name === 'Бармен-тест')?.id,
        experience_years: 7,
        experience_description: 'Креативный бармен с международными сертификатами. Люблю создавать новые коктейли.',
        expected_salary_monthly_min: 50000,
        expected_salary_monthly_max: 70000,
        expected_salary_shift_min: 2200,
        ready_for_urgent: true,
        ready_tomorrow: true
      },
      {
        first_name: 'Александр',
        last_name: 'Морозов-тест',
        phone: '+7 (918) 456-78-90',
        telegram_username: '@alex_morozov_test',
        avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg',
        primary_specialization_id: specializations?.find(s => s.name === 'Кондитер-тест')?.id,
        experience_years: 4,
        experience_description: 'Талантливый кондитер, специалист по французским десертам и праздничным тортам.',
        expected_salary_monthly_min: 55000,
        expected_salary_monthly_max: 75000,
        expected_salary_shift_min: 2400,
        ready_for_urgent: false,
        ready_tomorrow: true
      },
      {
        first_name: 'Мария',
        last_name: 'Волкова-тест',
        phone: '+7 (919) 567-89-01',
        telegram_username: '@maria_volkova_test',
        avatar_url: 'https://randomuser.me/api/portraits/women/5.jpg',
        primary_specialization_id: specializations?.find(s => s.name === 'Су-шеф-тест')?.id,
        experience_years: 6,
        experience_description: 'Опытный су-шеф с навыками управления. Отвечаю за качество всех блюд.',
        expected_salary_monthly_min: 80000,
        expected_salary_monthly_max: 120000,
        expected_salary_shift_min: 3500,
        ready_for_urgent: true,
        ready_tomorrow: true
      }
    ]

    // 3. Пропускаем кандидатов (требуется user_id из auth)
    console.log('Пропускаем кандидатов (требуется аутентификация)...')
    
    /*
    const { error: candidatesError } = await supabase
      .from('candidate_profiles')
      .upsert(candidatesData)

    if (candidatesError) {
      console.error('Ошибка при добавлении кандидатов:', candidatesError)
      return
    }
    */

    // 4. Создаем срочные вакансии
    console.log('Добавляем срочные вакансии...')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const urgentJobsData = [
      {
        title: 'Повар на завтрак-тест',
        description: 'Срочно нужен повар для приготовления завтраков. Работа в утреннюю смену.',
        venue_name: 'Ресторан Белуга-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Ресторан-тест')?.id,
        address: 'ул. Тверская, 15',
        district_id: districts?.find(d => d.name === 'Центр-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Повар-тест')?.id,
        needed_date: tomorrow.toISOString().split('T')[0],
        needed_time: '07:00',
        shift_duration: '8 hours',
        pay_per_shift: 3500,
        requirements: 'Опыт работы поваром, знание европейской кухни, медицинская книжка',
        contact_name: 'Иван Ресторанов-тест',
        contact_phone: '+7 (925) 111-22-33',
        contact_telegram: '@ivan_restoranov_test',
        status: 'active'
      },
      {
        title: 'Официант на банкет-тест',
        description: 'Требуется опытный официант для обслуживания банкета на 100 человек.',
        venue_name: 'Банкетный зал Усадьба-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Банкетный зал-тест')?.id,
        address: 'ул. Красный проспект, 50',
        district_id: districts?.find(d => d.name === 'Ленинский-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Официант-тест')?.id,
        needed_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        needed_time: '16:00',
        shift_duration: '6 hours',
        pay_per_shift: 2800,
        requirements: 'Опыт банкетного обслуживания, презентабельный внешний вид, стрессоустойчивость',
        contact_name: 'Игорь Белов-тест',
        contact_phone: '+7 (921) 789-01-23',
        contact_telegram: '@igor_belov_test',
        status: 'active'
      },
      {
        title: 'Бармен в выходные-тест',
        description: 'Нужен бармен на выходные дни в популярный бар.',
        venue_name: 'Бар Лофт-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Бар-тест')?.id,
        address: 'Васильевский остров, 25',
        district_id: districts?.find(d => d.name === 'Василеостровский-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Бармен-тест')?.id,
        needed_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        needed_time: '20:00',
        shift_duration: '10 hours',
        pay_per_shift: 4200,
        requirements: 'Знание классических коктейлей, быстрая работа, коммуникабельность',
        contact_name: 'Светлана Кафеева-тест',
        contact_phone: '+7 (925) 222-33-44',
        contact_telegram: '@svetlana_kafeeva_test',
        status: 'active'
      },
      {
        title: 'Кондитер на праздник-тест',
        description: 'Требуется кондитер для изготовления праздничных тортов.',
        venue_name: 'Кондитерская Сладкий дом-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Кондитерская-тест')?.id,
        address: 'ул. Братиславская, 10',
        district_id: districts?.find(d => d.name === 'Марьино-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Кондитер-тест')?.id,
        needed_date: today.toISOString().split('T')[0],
        needed_time: '09:00',
        shift_duration: '12 hours',
        pay_per_shift: 5000,
        requirements: 'Опыт изготовления тортов, художественные навыки, креативность',
        contact_name: 'Марко Пиццаро-тест',
        contact_phone: '+7 (925) 444-55-66',
        contact_telegram: '@marko_pizzaro_test',
        status: 'active'
      },
      {
        title: 'Мойщик посуды срочно-тест',
        description: 'Экстренно нужен мойщик посуды, предыдущий сотрудник заболел.',
        venue_name: 'Пиццерия Мама Рома-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Пиццерия-тест')?.id,
        address: 'Сокольническая площадь, 3',
        district_id: districts?.find(d => d.name === 'Сокольники-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Мойщик посуды-тест')?.id,
        needed_date: today.toISOString().split('T')[0],
        needed_time: '14:00',
        shift_duration: '8 hours',
        pay_per_shift: 2000,
        requirements: 'Ответственность, физическая выносливость, медицинская книжка',
        contact_name: 'Такеши Сушилов-тест',
        contact_phone: '+7 (925) 333-44-55',
        contact_telegram: '@takeshi_sushilov_test',
        status: 'active'
      },
      {
        title: 'Хостес на вечер-тест',
        description: 'Требуется хостес для встречи гостей в пятницу вечером.',
        venue_name: 'Суши Мастер-тест',
        venue_type_id: venueTypes?.find(v => v.name === 'Суши-бар-тест')?.id,
        address: 'Невский проспект, 80',
        district_id: districts?.find(d => d.name === 'Невский-тест')?.id,
        specialization_id: specializations?.find(s => s.name === 'Хостес-тест')?.id,
        needed_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        needed_time: '18:00',
        shift_duration: '5 hours',
        pay_per_shift: 1800,
        requirements: 'Знание английского языка, приятная внешность, коммуникабельность',
        contact_name: 'Иван Ресторанов-тест',
        contact_phone: '+7 (925) 111-22-33',
        contact_telegram: '@ivan_restoranov_test',
        status: 'active'
      }
    ]

    const { error: urgentJobsError } = await supabase
      .from('urgent_jobs')
      .upsert(urgentJobsData)

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
