// Глобальные моки для Vitest (например, для window, fetch и др.)
// Можно расширять по мере необходимости
import { expect, vi, beforeEach } from 'vitest'
// import matchers from '@testing-library/jest-dom/matchers' // Vitest + ESM: импортировать из '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom'
import { setActivePinia, createPinia } from 'pinia'

expect.extend(matchers)

global.jest = vi

// Инициализируем Pinia перед каждым тестом
beforeEach(() => {
	setActivePinia(createPinia())
})

// Базовый мок Notification API, чтобы не падали тесты в jsdom
if (typeof window !== 'undefined' && !('Notification' in window)) {
	// eslint-disable-next-line no-global-assign
	global.Notification = {
		permission: 'granted',
		requestPermission: async () => 'granted'
	}
}
