<template>
  <div class="video-profile">
    <div class="video-header">
      <h3 class="video-title">🎥 Видео-приветствие</h3>
      <div v-if="!isFeatureEnabled('videoProfile')" class="feature-disabled">
        <span class="disabled-badge">Функция отключена</span>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="uploading" class="upload-state">
      <div class="upload-progress">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="upload-text">Загрузка видео... {{ uploadProgress }}%</p>
    </div>

    <!-- Видео есть -->
    <div v-else-if="videoUrl && isFeatureEnabled('videoProfile')" class="video-container">
      <video 
        ref="videoElement"
        :src="videoUrl"
        class="video-player"
        controls
        preload="metadata"
        :poster="posterUrl"
        @loadedmetadata="onVideoLoaded"
        @error="onVideoError"
      >
        <p class="video-fallback">Ваш браузер не поддерживает воспроизведение видео.</p>
      </video>
      
      <div class="video-actions">
        <button 
          @click="removeVideo" 
          class="btn-remove"
          :disabled="uploading"
        >
          🗑️ Удалить видео
        </button>
        <div class="video-info">
          <span class="video-duration">{{ videoDuration }}</span>
          <span class="video-size">{{ formatFileSize(videoFileSize) }}</span>
        </div>
      </div>
    </div>

    <!-- Загрузка нового видео -->
    <div v-else-if="isFeatureEnabled('videoProfile')" class="upload-zone">
      <input 
        ref="fileInput"
        type="file"
        accept="video/mp4,video/webm,video/mov"
        @change="handleFileSelect"
        class="file-input"
        id="video-upload"
      />
      <label for="video-upload" class="upload-label">
        <div class="upload-icon">📹</div>
        <div class="upload-text">
          <p class="upload-title">Загрузить видео-приветствие</p>
          <p class="upload-subtitle">MP4, WebM или MOV до 25MB</p>
          <p class="upload-hint">Рекомендуется: до 15 секунд, вертикальная ориентация</p>
        </div>
      </label>
      
      <div v-if="uploadError" class="upload-error">
        ❌ {{ uploadError }}
      </div>
    </div>

    <!-- Фича отключена -->
    <div v-else class="feature-disabled-content">
      <div class="disabled-placeholder">
        <span class="disabled-icon">🎬</span>
        <p class="disabled-text">Видео-приветствие временно недоступно</p>
        <p class="disabled-hint">Функция будет активирована в ближайшем обновлении</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { mediaService } from '@/services/media.service.js'
import { isFeatureEnabled, debugLog } from '@/utils/featureFlags.js'

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  initialVideoUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['video-uploaded', 'video-removed', 'upload-error'])

// Состояние
const videoUrl = ref(props.initialVideoUrl)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref(null)
const videoDuration = ref('')
const videoFileSize = ref(0)
const posterUrl = ref(null)

// Рефы
const videoElement = ref(null)
const fileInput = ref(null)

// Константы
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/mov']

// Обработка выбора файла
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Валидация
  const validationError = validateFile(file)
  if (validationError) {
    uploadError.value = validationError
    return
  }

  await uploadVideo(file)
}

// Валидация файла
const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Поддерживаются только форматы: MP4, WebM, MOV'
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return `Размер файла не должен превышать ${formatFileSize(MAX_FILE_SIZE)}`
  }
  
  return null
}

// Загрузка видео
const uploadVideo = async (file) => {
  try {
    uploading.value = true
    uploadError.value = null
    uploadProgress.value = 0
    
    debugLog('videoProfile', 'Начинаем загрузку видео', { size: file.size, type: file.type })
    
    // Симуляция прогресса (в реальности можно подключить xhr с progress)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)
    
    const { data, error } = await mediaService.uploadProfileVideo(props.userId, file)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    if (error) {
      throw new Error(error.message || 'Ошибка загрузки видео')
    }
    
    videoUrl.value = data.url
    videoFileSize.value = file.size
    
    // Генерируем poster через canvas (упрощенно)
    await nextTick()
    generatePoster()
    
    emit('video-uploaded', data.url)
    debugLog('videoProfile', 'Видео успешно загружено', data.url)
    
  } catch (err) {
    console.error('Ошибка загрузки видео:', err)
    uploadError.value = err.message
    emit('upload-error', err.message)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    
    // Очищаем input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Удаление видео
const removeVideo = async () => {
  try {
    const { error } = await mediaService.removeVideo(props.userId)
    if (error) throw error
    
    videoUrl.value = null
    videoDuration.value = ''
    videoFileSize.value = 0
    posterUrl.value = null
    
    emit('video-removed')
    debugLog('videoProfile', 'Видео удалено')
    
  } catch (err) {
    console.error('Ошибка удаления видео:', err)
    uploadError.value = 'Ошибка удаления видео'
  }
}

// Обработка загрузки метаданных видео
const onVideoLoaded = () => {
  if (!videoElement.value) return
  
  const duration = videoElement.value.duration
  videoDuration.value = formatDuration(duration)
  
  debugLog('videoProfile', 'Видео загружено', { duration })
}

// Обработка ошибки видео
const onVideoError = (event) => {
  console.error('Ошибка воспроизведения видео:', event)
  uploadError.value = 'Ошибка воспроизведения видео'
}

// Генерация постера (упрощенно)
const generatePoster = async () => {
  if (!videoElement.value) return
  
  // В реальности здесь можно создать canvas и захватить кадр
  // Пока оставляем заглушку
  posterUrl.value = null
}

// Утилиты
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.video-profile {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.video-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.feature-disabled .disabled-badge {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.upload-state {
  text-align: center;
  padding: 2rem;
}

.upload-progress {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.upload-text {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.video-container {
  position: relative;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 12px;
  background: #000;
}

.video-fallback {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 2rem;
}

.video-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.btn-remove {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.btn-remove:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.3);
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.video-info {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.upload-zone {
  position: relative;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-label:hover {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.05);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-title {
  color: white;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.upload-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.8rem;
}

.upload-error {
  margin-top: 1rem;
  padding: 12px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 0.9rem;
}

.feature-disabled-content {
  text-align: center;
  padding: 2rem;
}

.disabled-placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.disabled-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.disabled-text {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.disabled-hint {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .video-profile {
    padding: 16px;
  }
  
  .video-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .upload-label {
    padding: 1.5rem;
  }
  
  .upload-icon {
    font-size: 2rem;
  }
  
  .video-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .btn-remove {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .video-info {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>
