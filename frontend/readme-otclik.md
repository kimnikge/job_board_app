Цель: Реализовать систему откликов на вакансии и уведомлений для всех участников процесса.

1. Модуль откликов

1.1. Сущности и связи

Таблица applications (отклики)

sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_posting_id INTEGER NOT NULL REFERENCES job_postings(id),
  job_seeker_id INTEGER NOT NULL REFERENCES users(id),
  resume_id INTEGER NOT NULL REFERENCES resumes(id),  -- Прикрепленное резюме
  message TEXT,                                      -- Сопроводительное письмо
  status VARCHAR(20) DEFAULT 'pending',              -- "pending"/"approved"/"rejected"
  created_at TIMESTAMP DEFAULT NOW()
);
Таблица application_status_history (история статусов)

sql
CREATE TABLE application_status_history (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id),
  status VARCHAR(20) NOT NULL,  -- "pending", "viewed", "invited", "rejected"
  changed_by INTEGER REFERENCES users(id),  -- Кто изменил статус (работодатель или система)
  created_at TIMESTAMP DEFAULT NOW()
);
1.2. API Endpoints

Метод	Путь	Описание	Доступ
POST	/applications	Создать отклик на вакансию	Соискатель
GET	/applications/me	Мои отклики	Соискатель
GET	/employer/applications	Отклики на мои вакансии	Работодатель
PUT	/employer/applications/:id	Изменить статус отклика	Работодатель
1.3. Бизнес-логика

Создание отклика

Проверка, что пользователь — соискатель (role = job_seeker).
Валидация:
Вакансия существует и активна (is_active = TRUE).
У соискателя есть резюме.
Автоматическое сохранение статуса pending.
Пример запроса:

json
{
  "job_posting_id": 123,
  "resume_id": 456,
  "message": "Заинтересовала вакансия, готов обсудить детали!"
}
Изменение статуса работодателем

Доступные статусы:
viewed — просмотрено.
invited — приглашение на собеседование.
rejected — отказ (с обязательным комментарием).
Пример запроса:

json
{
  "status": "invited",
  "comment": "Приглашаем на собеседование 20 мая в 15:00"
}
2. Система уведомлений

2.1. Сущности и связи

Таблица notifications

sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),  -- Кому
  title VARCHAR(100) NOT NULL,                   -- "Новый отклик"
  message TEXT NOT NULL,                         -- "Иван Петров откликнулся на вакансию..."
  type VARCHAR(50) NOT NULL,                     -- "application", "moderation", "system"
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB                                 -- Доп. данные: {"application_id": 123}
);
2.2. Типы уведомлений

Тип	Триггер	Получатель	Пример сообщения
Новый отклик	Создан отклик на вакансию	Работодатель	"Соискатель [Имя] откликнулся на вакансию [Название]"
Статус отклика	Работодатель изменил статус	Соискатель	"Ваш отклик одобрен! Приглашение на собеседование"
Модерация	Вакансия одобрена/отклонена	Работодатель	"Вакансия 'Повар' одобрена"
Системное	Важные обновления	Все	"Завтра технические работы с 3:00 до 5:00"
2.3. API Endpoints

Метод	Путь	Описание
GET	/notifications	Список уведомлений пользователя
PUT	/notifications/:id/read	Пометить как прочитанное
POST	/notifications/test	Тестовое уведомление (для админа)
2.4. Реализация уведомлений

Способы доставки:

Внутри приложения:
Список в ЛК (сортировка по дате).
Badge-счетчик непрочитанных.
Email:
Отправка через SMTP (Nodemailer для Node.js, net/smtp для Go).
Шаблоны писем для каждого типа уведомлений.
WebSocket (опционально):
Мгновенные pop-up уведомления.
Пример кода для Email (Node.js):

javascript
async function sendEmailNotification(userEmail, title, message) {
  await transporter.sendMail({
    from: 'noreply@j-app.ru',
    to: userEmail,
    subject: title,
    html: `<p>${message}</p>`
  });
}
3. Интеграция с другими модулями

При создании отклика → Уведомление работодателю.
При изменении статуса → Уведомление соискателю.
При отклонении вакансии модератором → Уведомление работодателю.
4. Технические требования

Авторизация: Проверка прав на просмотр/изменение откликов.
Валидация:
Соискатель не может откликнуться на свою вакансию.
Работодатель не может менять статус чужих откликов.
Производительность:
Индексы для job_posting_id, job_seeker_id, status.
Пагинация списка откликов.
5. Что проверить перед релизом

Уведомления приходят всем участникам.
Статус отклика меняется только владельцем вакансии.
Соискатель видит только свои отклики.