// Глобальные моки для Vitest (например, для window, fetch и др.)
// Можно расширять по мере необходимости
import { expect, vi } from 'vitest'
// import matchers from '@testing-library/jest-dom/matchers' // Vitest + ESM: импортировать из '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom'

expect.extend(matchers)

global.jest = vi
