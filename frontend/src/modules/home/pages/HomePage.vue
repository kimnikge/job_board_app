<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="bg-animation"></div>
    <div class="scroll-indicator"></div>

    <!-- Header (assuming it's part of MainLayout, but included here for completeness based on template) -->
    <!-- If your header is in MainLayout, you can remove this section -->
    <header class="header">
      <nav class="nav">
        <a href="#" class="logo"> JobBoard</a>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Будущее твоей карьеры<br>начинается <em>прямо сейчас</em></h1>
        <p class="hero-subtitle">Открой мир безграничных возможностей</p>
        <!-- Add search bar or call to action buttons here if needed -->
      </div>
    </section>

    <!-- Interactive Dashboard -->
    <section class="dashboard">
      <div class="dashboard-container">
        <h2 class="dashboard-title">Live статистика</h2>
        <p class="dashboard-subtitle">Платформа растет каждую секунду</p>

        <div class="stats-grid">
          <div class="stat-card" @click="animateCounter($event.currentTarget, 1247)">
            <span class="stat-number" data-target="1247">0</span>
            <span class="stat-label">Активных вакансий</span>
          </div>
          <div class="stat-card" @click="animateCounter($event.currentTarget, 2891)">
            <span class="stat-number" data-target="2891">0</span>
            <span class="stat-label">Резюме в базе</span>
          </div>
          <div class="stat-card" @click="animateCounter($event.currentTarget, 486)">
            <span class="stat-number" data-target="486">0</span>
            <span class="stat-label">IT компаний</span>
          </div>
          <div class="stat-card" @click="animateCounter($event.currentTarget, 156)">
            <span class="stat-number" data-target="156">0</span>
            <span class="stat-label">Новых сегодня</span>
          </div>
        </div>

        <!-- Вакансии Карусель -->
        <div class="carousel-section">
          <div class="section-header">
            <h3 class="section-title">🔥 Горячие вакансии</h3>
            <div class="carousel-controls">
              <button class="carousel-btn" @click="slideCarousel('jobs', -1)">←</button>
              <button class="carousel-btn" @click="slideCarousel('jobs', 1)">→</button>
            </div>
          </div>
          <div class="carousel-container">
            <div class="carousel-track" id="jobs-track">
              <div class="job-card">
                  <div class="job-header">
                      <div class="job-company">T</div>
                      <div class="job-status">Срочно</div>
                  </div>
                  <h4 class="job-title">Senior Full-Stack разработчик</h4>
                  <p class="job-company-name">TechCorp Kazakhstan</p>
                  <div class="job-details">
                      <span class="job-detail">📍 Алматы</span>
                      <span class="job-detail">💼 5+ лет</span>
                      <span class="job-detail">🏠 Удаленно</span>
                  </div>
                  <div class="job-salary">800,000 - 1,200,000 ₸</div>
              </div>
              
              <div class="job-card">
                  <div class="job-header">
                      <div class="job-company">F</div>
                      <div class="job-status">Новая</div>
                  </div>
                  <h4 class="job-title">Product Manager</h4>
                  <p class="job-company-name">Fintech Solutions</p>
                  <div class="job-details">
                      <span class="job-detail">📍 Нур-Султан</span>
                      <span class="job-detail">💼 3+ лет</span>
                      <span class="job-detail">🏢 Офис</span>
                  </div>
                  <div class="job-salary">от 600,000 ₸</div>
              </div>
              
              <div class="job-card">
                  <div class="job-header">
                      <div class="job-company">M</div>
                      <div class="job-status">Топ</div>
                  </div>
                  <h4 class="job-title">UX/UI Designer</h4>
                  <p class="job-company-name">Modern Digital</p>
                  <div class="job-details">
                      <span class="job-detail">📍 Шымкент</span>
                      <span class="job-detail">💼 2+ лет</span>
                      <span class="job-detail">🏠 Гибрид</span>
                  </div>
                  <div class="job-salary">450,000 - 700,000 ₸</div>
              </div>
              
              <div class="job-card">
                  <div class="job-header">
                      <div class="job-company">S</div>
                      <div class="job-status">Горячая</div>
                  </div>
                  <h4 class="job-title">DevOps Engineer</h4>
                  <p class="job-company-name">StartupHub</p>
                  <div class="job-details">
                      <span class="job-detail">📍 Алматы</span>
                      <span class="job-detail">💼 4+ лет</span>
                      <span class="job-detail">🏠 Удаленно</span>
                  </div>
                  <div class="job-salary">700,000 - 950,000 ₸</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Резюме Карусель -->
        <div class="carousel-section">
          <div class="section-header">
            <h3 class="section-title">⭐ Топ кандидаты</h3>
            <div class="carousel-controls">
              <button class="carousel-btn" @click="slideCarousel('resumes', -1)">←</button>
              <button class="carousel-btn" @click="slideCarousel('resumes', 1)">→</button>
            </div>
          </div>
          <div class="carousel-container">
            <div class="carousel-track" id="resumes-track">
              <div class="resume-card">
                  <div class="resume-avatar">А</div>
                  <h4 class="resume-name">Анна Калиева</h4>
                  <p class="resume-title">Senior React Developer</p>
                  <div class="resume-skills">
                      <span class="skill-tag">React</span>
                      <span class="skill-tag">TypeScript</span>
                      <span class="skill-tag">Node.js</span>
                      <span class="skill-tag">AWS</span>
                  </div>
                  <p class="resume-experience">5 лет опыта • Алматы</p>
              </div>
              
              <div class="resume-card">
                  <div class="resume-avatar">М</div>
                  <h4 class="resume-name">Максим Жанов</h4>
                  <p class="resume-title">Python Backend Developer</p>
                  <div class="resume-skills">
                      <span class="skill-tag">Python</span>
                      <span class="skill-tag">Django</span>
                      <span class="skill-tag">PostgreSQL</span>
                      <span class="skill-tag">Docker</span>
                  </div>
                  <p class="resume-experience">3 года опыта • Шымкент</p>
              </div>
              
              <div class="resume-card">
                  <div class="resume-avatar">Д</div>
                  <h4 class="resume-name">Диана Смагулова</h4>
                  <p class="resume-title">UX/UI Designer</p>
                  <div class="resume-skills">
                      <span class="skill-tag">Figma</span>
                      <span class="skill-tag">Adobe XD</span>
                      <span class="skill-tag">Sketch</span>
                      <span class="skill-tag">Prototyping</span>
                  </div>
                  <p class="resume-experience">4 года опыта • Нур-Султан</p>
              </div>
              
              <div class="resume-card">
                  <div class="resume-avatar">А</div>
                  <h4 class="resume-name">Арман Токаев</h4>
                  <p class="resume-title">Data Scientist</p>
                  <div class="resume-skills">
                      <span class="skill-tag">Python</span>
                      <span class="skill-tag">ML</span>
                      <span class="skill-tag">TensorFlow</span>
                      <span class="skill-tag">SQL</span>
                  </div>
                  <p class="resume-experience">6 лет опыта • Алматы</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating Action Button -->
    <button class="fab" @click="openSearch">🔍</button>

    <!-- Search Overlay -->
    <div class="search-overlay" :class="{ active: isSearchOpen }" @click="closeSearch">
      <div class="search-container" @click.stop>
        <button class="close-search" @click="closeSearch">×</button>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Поиск вакансий, резюме, компаний..." 
          v-model="searchQuery"
          @keydown.enter="handleSearch"
          @keydown.esc="closeSearch"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Состояние
const isSearchOpen = ref(false)
const searchQuery = ref('')
const carouselPositions = ref({
  jobs: 0,
  resumes: 0
})

// Методы
const animateCounter = (element, target) => {
  const counter = element.querySelector('.stat-number')
  const increment = target / 100
  let current = 0
  
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    counter.textContent = Math.floor(current).toLocaleString()
  }, 20)
}

const slideCarousel = (type, direction) => {
  const track = document.getElementById(`${type}-track`)
  if (!track) return
  
  const cards = track.children
  if (cards.length === 0) return
  
  const cardWidth = cards[0].offsetWidth + 30 // card width + gap
  const maxPosition = -(cards.length - 3) * cardWidth // show 3 cards at once
  
  carouselPositions.value[type] += direction * cardWidth
  
  if (carouselPositions.value[type] > 0) carouselPositions.value[type] = 0
  if (carouselPositions.value[type] < maxPosition) carouselPositions.value[type] = maxPosition
  
  track.style.transform = `translateX(${carouselPositions.value[type]}px)`
}

const openSearch = () => {
  isSearchOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeSearch = () => {
  isSearchOpen.value = false
  document.body.style.overflow = ''
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery.value)
  }
  closeSearch()
}

// Lifecycle hooks
onMounted(() => {
  // Initialize counters
  document.querySelectorAll('.stat-card').forEach(card => {
    const target = parseInt(card.querySelector('.stat-number').dataset.target)
    animateCounter(card, target)
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* General Body/Page styles */
.home-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
    background: #ffffff;
    color: #333333;
}

/* Animated Background */
.bg-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: linear-gradient(45deg, #f3f4f6, #e5e7eb, #dbeafe, #eff6ff);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
}

.bg-animation::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-30px) rotate(0.5deg); }
    66% { transform: translateY(15px) rotate(-0.5deg); }
}

/* Header (commented out if in MainLayout) */
/*
.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 20px 0;
    transition: all 0.3s;
}

.header.scrolled {
    background: rgba(0, 0, 0, 0.8);
    padding: 15px 0;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.logo {
    font-size: 28px;
    font-weight: 900;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
}
*/

/* Hero Section */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    color: #1f2937;
    padding: 0 20px;
}

.hero-content {
    max-width: 800px;
    padding: 0 20px; /* Add padding for content */
}

.hero h1 {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 30px;
    line-height: 1.1;
    animation: slideUp 1s ease-out;
    color: #111827;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 50px;
    opacity: 0.8;
    animation: slideUp 1s ease-out 0.2s both;
    color: #4b5563;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Interactive Dashboard */
.dashboard {
    position: relative;
    padding: 100px 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
}

.dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

.dashboard-title {
    color: #111827;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.dashboard-subtitle {
    color: #6b7280;
    font-size: 1.25rem;
    margin-bottom: 3rem;
}

/* Stats Counter */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 80px;
}

.stat-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-number {
    color: #4f46e5;
    font-size: 2.5rem;
    font-weight: 700;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #6b7280;
    font-size: 1.125rem;
}

/* Carousel Sections */
.carousel-section {
    margin: 80px 0;
    color: white; /* Ensure text is visible */
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding: 0 20px; /* Add padding for alignment */
}

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.carousel-controls {
    display: flex;
    gap: 10px;
}

.carousel-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.carousel-list {
    display: flex;
    overflow-x: auto; /* Enable horizontal scrolling */
    gap: 20px; /* Gap between carousel items */
    padding-bottom: 20px; /* Add padding for scrollbar */
     /* Hide scrollbar for a cleaner look */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

.carousel-list::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
}

.carousel-item {
    flex: 0 0 300px; /* Set item width and prevent shrinking */
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    cursor: pointer;
    color: white; /* Ensure text is visible */
}

.carousel-item:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.carousel-item h4 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: 600;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .dashboard-title {
        font-size: 2rem;
    }

    .dashboard-subtitle {
        font-size: 1rem;
    }

    .stat-number {
        font-size: 2rem;
    }

    .stat-label {
        font-size: 0.9rem;
    }

    .section-title {
        font-size: 1.8rem;
    }

    .carousel-item {
         flex: 0 0 250px; /* Adjust item width for smaller screens */
    }
     .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
     .carousel-controls {
        align-self: flex-end; /* Align controls to the right */
    }
}

@media (max-width: 480px) {
    .hero h1 {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .dashboard-title {
        font-size: 1.5rem;
    }

     .carousel-item {
         flex: 0 0 200px; /* Further adjust item width */
    }
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.1);
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.search-overlay.active {
  opacity: 1;
  visibility: visible;
}

.search-container {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  position: relative;
}

.close-search {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

/* Job Cards */
.job-card {
  flex: 0 0 calc(33.333% - 1rem);
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.job-company {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.job-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: #f1f5f9;
  color: #64748b;
}

.job-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.job-company-name {
  color: #64748b;
  margin-bottom: 1rem;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.job-detail {
  font-size: 0.875rem;
  color: #64748b;
}

.job-salary {
  font-weight: 600;
  color: #3b82f6;
}

/* Resume Cards */
.resume-card {
  flex: 0 0 calc(33.333% - 1rem);
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.resume-avatar {
  width: 3rem;
  height: 3rem;
  background: #3b82f6;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 1rem;
}

.resume-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.resume-title {
  color: #64748b;
  margin-bottom: 1rem;
}

.resume-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skill-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 1rem;
}

.resume-experience {
  font-size: 0.875rem;
  color: #64748b;
}

/* Carousel Container */
.carousel-container {
  overflow: hidden;
  margin: 0 -1rem;
  padding: 0 1rem;
}

.carousel-track {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.3s ease;
}
</style> 