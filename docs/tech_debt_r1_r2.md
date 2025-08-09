# ТЕХНИЧЕСКИЙ ДОЛГ R1/R2 - ПЛАН УСТРАНЕНИЯ

## КРИТИЧЕСКИЕ ПРОПУСКИ (надо исправить перед R3):

### 1. VideoProfile компонент ⚠️ HIGH
**Проблема**: Компонент не реализован, только заглушка
**План**: 
- [ ] Базовый upload через mediaService
- [ ] Простое воспроизведение <video>
- [ ] Фича-флаг включить для dev
- [ ] Ограничения размера файла

### 2. Ленивая загрузка секций профиля ⚠️ MEDIUM  
**Проблема**: Все компоненты грузятся синхронно
**План**:
- [ ] Обернуть SkillBar, BadgeCarousel, ExperienceTimeline в defineAsyncComponent
- [ ] Добавить Suspense с skeleton loaders
- [ ] Тестирование bundle size

### 3. Тесты для новых компонентов ⚠️ MEDIUM
**Проблема**: Нет покрытия тестами
**План**:
- [ ] SkillBar.test.js - props, цветовые уровни
- [ ] BadgeCarousel.test.js - скролл, tooltip
- [ ] ExperienceTimeline.test.js - сортировка, форматы дат
- [ ] Mock данные для тестов

### 4. RPC функции заглушки ⚠️ HIGH (блокирует R3)
**Проблема**: recalc_skills и get_user_profile_full не работают
**План**:
- [ ] Реализовать recalc_skills с JOIN по badge_skill_links
- [ ] Реализовать get_user_profile_full с агрегацией 
- [ ] Тесты для RPC через SQL скрипты

## ТЕХНИЧЕСКИЕ УЛУЧШЕНИЯ (желательно):

### 5. TypeScript миграция ⚠️ LOW
**Статус**: Начато (tsconfig + типы), но сервисы еще .js
**План**:
- [ ] Перевести сервисы на .ts  
- [ ] Store на TypeScript
- [ ] Компоненты с <script setup lang="ts">

### 6. Error boundaries ⚠️ LOW
**Проблема**: Нет обработки ошибок компонентов
**План**:
- [ ] ErrorBoundary для секций профиля
- [ ] Fallback UI при сбоях загрузки

### 7. Performance optimization ⚠️ LOW
**Проблема**: Может быть медленно на слабых устройствах
**План**:
- [ ] Virtual scrolling для больших списков badges
- [ ] Debounce для анимаций SkillBar
- [ ] Performance budget проверка

## ПРИОРИТЕТ ИСПРАВЛЕНИЙ:
1. VideoProfile (блокирует демонстрацию) 
2. RPC функции (блокирует R3)
3. Тесты (блокирует качество)
4. Ленивая загрузка (производительность)

## DEADLINES:
- VideoProfile: 1-2 дня
- RPC + тесты: 2-3 дня  
- Ленивая загрузка: 1 день
- **ИТОГО**: ~5 дней до готовности к R3
