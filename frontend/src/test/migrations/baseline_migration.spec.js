import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// Тест не исполняет SQL, а проверяет наличие ключевых конструкций в baseline миграции.
// Цель: быстрый сигнал что файл содержит ожидаемые сущности и может быть идемпотентным (CREATE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS).

const MIGRATION_FILE = path.resolve(__dirname, '../../../../backend/supabase/migrations/20250809120000_baseline_profile_extension.sql')

function read() {
  return fs.readFileSync(MIGRATION_FILE, 'utf-8')
}

describe('baseline migration structure', () => {
  const sql = read()

  it('contains required tables', () => {
    ;['CREATE TABLE IF NOT EXISTS public.skills',
      'CREATE TABLE IF NOT EXISTS public.badges',
      'CREATE TABLE IF NOT EXISTS public.badge_skill_links',
      'CREATE TABLE IF NOT EXISTS public.work_logs',
      'CREATE TABLE IF NOT EXISTS public.employers']
      .forEach(fragment => {
        expect(sql).toContain(fragment)
      })
  })

  it('is idempotent style (add column if not exists)', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS short_bio/)
  })

  it('defines RPC stubs', () => {
    expect(sql).toContain('FUNCTION public.recalc_skills')
    expect(sql).toContain('FUNCTION public.get_user_profile_full')
  })
})
