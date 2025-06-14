<template>
  <div class="resume-export">
    <button @click="exportPDF">Экспортировать в PDF</button>
    <div v-if="exporting" class="exporting-msg">Экспортируем...</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '../services/api.js'

const props = defineProps({ resumeId: Number })
const exporting = ref(false)
const error = ref('')

async function exportPDF() {
  exporting.value = true
  error.value = ''
  try {
    const res = await api.getResume(props.resumeId)
    const r = res.data
    const doc = new jsPDF()
    doc.text(r.full_name, 14, 18)
    doc.text(`Профессия: ${r.profession || ''}`, 14, 28)
    doc.text(`Город: ${r.city || ''}`, 14, 36)
    doc.text(`Возраст: ${r.age || ''}`, 14, 44)
    doc.text('Навыки:', 14, 54)
    doc.text((r.skills || []).join(', '), 30, 54)
    doc.text('Опыт работы:', 14, 64)
    if (r.experience && r.experience.length) {
      autoTable(doc, {
        startY: 70,
        head: [['Должность', 'Компания', 'Период']],
        body: r.experience.map(e => [e.position, e.company, e.period])
      })
    }
    if (r.about) {
      doc.text('О себе:', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80)
      doc.text(r.about, 14, (doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 88))
    }
    doc.save(`resume_${r.full_name}.pdf`)
  } catch (e) {
    error.value = 'Ошибка экспорта PDF'
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.resume-export {
  margin: 18px 0;
}
button {
  background: #0088cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 500;
  cursor: pointer;
}
.exporting-msg {
  color: #888;
  margin-top: 8px;
}
.error-msg {
  color: #e53935;
  margin-top: 8px;
}
</style>
