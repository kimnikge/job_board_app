/**
 * Выполнение SQL через Supabase API
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQLFile() {
  console.log('🗄️ Выполняем полное пересоздание базы данных...')
  
  try {
    // Читаем SQL файл
    const sqlContent = fs.readFileSync('./database_reset.sql', 'utf8')
    
    // Разбиваем на отдельные команды по точке с запятой
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && cmd !== '')
    
    console.log(`📋 Найдено команд: ${commands.length}`)
    
    // Выполняем команды по одной через REST API
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim()
      if (command) {
        console.log(`⚡ Выполняем команду ${i + 1}/${commands.length}`)
        console.log(`SQL: ${command.substring(0, 80)}...`)
        
        try {
          // Используем REST API для выполнения SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: command + ';' })
          })
          
          if (!response.ok) {
            const error = await response.text()
            console.log(`⚠️  Команда ${i + 1} - возможная ошибка: ${error}`)
          } else {
            console.log(`✅ Команда ${i + 1} выполнена`)
          }
        } catch (error) {
          console.log(`⚠️  Команда ${i + 1} - ошибка: ${error.message}`)
        }
      }
    }
    
    console.log('🎉 Скрипт выполнен!')
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
  }
}

async function executeManually() {
  console.log('🔧 Выполняем команды вручную через Supabase клиент...')
  
  try {
    // Команда 1: Удаляем старые таблицы
    console.log('🗑️  Удаляем старые таблицы...')
    const dropCommands = [
      'DROP TABLE IF EXISTS urgent_job_responses CASCADE',
      'DROP TABLE IF EXISTS job_applications CASCADE',
      'DROP TABLE IF EXISTS urgent_jobs CASCADE', 
      'DROP TABLE IF EXISTS job_postings CASCADE',
      'DROP TABLE IF EXISTS companies CASCADE',
      'DROP TABLE IF EXISTS user_profiles CASCADE',
      'DROP TABLE IF EXISTS candidate_profiles CASCADE',
      'DROP TABLE IF EXISTS employer_profiles CASCADE'
    ]
    
    for (const cmd of dropCommands) {
      try {
        await supabase.rpc('exec_sql', { sql: cmd })
        console.log(`✅ ${cmd}`)
      } catch (e) {
        console.log(`⚠️  ${cmd} - ${e.message}`)
      }
    }
    
    console.log('✅ Старые таблицы удалены')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  }
}

// Простой способ - используем прямые INSERT команды
async function createBasicStructure() {
  console.log('🏗️  Создаем базовую структуру вручную...')
  
  try {
    // Проверяем, какие таблицы есть
    const { data: existingTables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      console.error('❌ Ошибка проверки таблиц:', error)
      return
    }
    
    const tableNames = existingTables.map(t => t.table_name)
    console.log('📊 Существующие таблицы:', tableNames.join(', '))
    
    // Проверяем наличие нужных таблиц
    const requiredTables = ['user_profiles', 'companies', 'urgent_jobs']
    const missingTables = requiredTables.filter(table => !tableNames.includes(table))
    
    if (missingTables.length > 0) {
      console.log('❌ Отсутствуют таблицы:', missingTables.join(', '))
      console.log('🔧 Нужно создать таблицы через Supabase Dashboard')
    } else {
      console.log('✅ Все необходимые таблицы существуют!')
      
      // Проверяем данные в таблицах
      for (const table of requiredTables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          console.log(`📈 ${table}: ${count} записей`)
        } catch (e) {
          console.log(`⚠️  ${table}: ошибка - ${e.message}`)
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Ошибка:', error)
  }
}

// Запускаем проверку
createBasicStructure()
