/**
 * Моки для эмуляции Deno Edge Functions в Node.js окружении
 */

// Мок для Deno.serve
export function createDenoServeMock() {
  return (handler: (req: Request) => Promise<Response> | Response) => {
    return {
      handler,
      // Метод для симуляции вызова handler'а в тестах
      async simulateRequest(req: Request): Promise<Response> {
        return await handler(req)
      }
    }
  }
}

// Устанавливаем глобальный мок
if (typeof global !== 'undefined') {
  global.Deno = {
    env: {
      get: (key: string) => process.env[key]
    },
    serve: createDenoServeMock()
  } as any
}

// Мок для Response с правильными типами
export class MockResponse extends Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init)
  }
}

// Мок для Request с правильными типами
export class MockRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init)
  }
}

// Экспорт для использования в тестах
export { createDenoServeMock as serve }
