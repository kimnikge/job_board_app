<template>
  <div class="application-form">
    <form @submit.prevent="submitForm">
      <!-- ...existing form fields... -->

      <div class="form-group">
        <label for="coverLetter">Cover Letter</label>
        <textarea
          id="coverLetter"
          v-model="form.coverLetter"
          class="form-control"
          required
        ></textarea>
      </div>

      <div v-if="isOwnJob" class="application-form__error">
        Нельзя откликнуться на свою вакансию
      </div>

      <div v-if="error" class="application-form__error">{{ error }}</div>

      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isOwnJob || loading || !isFormValid"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Submit Application
      </button>
    </form>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useJobApi } from '@/api/job'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export default {
  props: {
    jobId: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const jobApi = useJobApi()
    const authStore = useAuthStore()
    const toast = useToast()

    const job = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const form = ref({
      coverLetter: ''
    })
    const selectedResume = ref(null)

    // Fetch job details by ID
    const fetchJobDetails = async () => {
      loading.value = true
      try {
        job.value = await jobApi.getJobById(props.jobId)
      } catch (error) {
        console.error('Error fetching job details:', error)
      } finally {
        loading.value = false
      }
    }

    // Бизнес-валидация: нельзя откликнуться на свою вакансию
    const isOwnJob = computed(() => {
      // jobApi.getJobById(props.jobId) должен возвращать employer_id
      // и userId должен быть получен из authStore или localStorage
      const userId = localStorage.getItem('user_id')
      return job.value && job.value.employer_id === Number(userId)
    })

    const isFormValid = computed(() => {
      return !isOwnJob.value && selectedResume.value && form.value.coverLetter.trim().length > 0
    })

    const submitForm = async () => {
      if (!isFormValid.value) return

      if (!selectedResume.value) {
        error.value = 'Пожалуйста, выберите резюме'
        return
      }
      if (isOwnJob.value) {
        error.value = 'Нельзя откликнуться на свою вакансию'
        return
      }
      loading.value = true
      error.value = null
      try {
        await jobApi.applyToJob(props.jobId, {
          resumeId: selectedResume.value.id,
          coverLetter: form.value.coverLetter
        })
        toast.success('Отклик отправлен', 'Ваш отклик успешно отправлен работодателю')
        emit('submit')
      } catch (err) {
        error.value = err.message || 'Ошибка при отправке отклика'
      } finally {
        loading.value = false
      }
    }

    // Fetch job details on component mount
    fetchJobDetails()

    return {
      job,
      loading,
      form,
      selectedResume,
      isOwnJob,
      isFormValid,
      submitForm,
      error
    }
  }
}
</script>

<style scoped>
.application-form {
  max-width: 600px;
  margin: 0 auto;
}

.application-form__error {
  color: red;
  margin-top: 10px;
}
</style>