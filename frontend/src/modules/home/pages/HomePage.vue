<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="bg-animation"></div>

    <!-- Header (assuming it's part of MainLayout, but included here for completeness based on template) -->
    <!-- If your header is in MainLayout, you can remove this section -->
    <!-- <header class="header">
      <nav class="nav">
        <a href="#" class="logo">Job Board</a>
      </nav>
    </header> -->

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Твоя карьера начинается здесь</h1>
        <p class="hero-subtitle">Найди работу своей мечты или лучшего сотрудника для своей команды</p>
        <!-- Add search bar or call to action buttons here if needed -->
      </div>
    </section>

    <!-- Interactive Dashboard -->
    <section class="dashboard">
      <div class="dashboard-container">
        <h2 class="dashboard-title">Цифры говорят сами за себя</h2>
        <p class="dashboard-subtitle">Актуальная статистика платформы</p>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{ jobCount }}</span>
            <span class="stat-label">Актуальных вакансий</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ resumeCount }}</span>
            <span class="stat-label">Кандидатов в поиске</span>
          </div>
          <!-- Add more stats if needed -->
        </div>

        <!-- Latest Jobs Carousel Section -->
        <div v-if="latestJobs.length" class="carousel-section">
            <div class="section-header">
                <h3 class="section-title">Последние вакансии</h3>
                 <!-- Carousel controls can be added here -->
                 <!-- <div class="carousel-controls">
                     <button class="carousel-btn">&#8249;</button>
                     <button class="carousel-btn">&#8250;</button>
                 </div> -->
            </div>
            <div class="carousel-list">
                 <div v-for="job in latestJobs" :key="job.id" class="carousel-item job-item">
                      <h4>{{ job.title }}</h4>
                      <p>{{ job.location }}</p>
                      <p>{{ job.salary }}</p>
                      <!-- Add more job details as needed -->
                 </div>
             </div>
        </div>

        <!-- Latest Resumes Carousel Section -->
         <div v-if="latestResumes.length" class="carousel-section">
             <div class="section-header">
                 <h3 class="section-title">Новые резюме</h3>
                  <!-- Carousel controls can be added here -->
                  <!-- <div class="carousel-controls">
                      <button class="carousel-btn">&#8249;</button>
                      <button class="carousel-btn">&#8250;</button>
                  </div> -->
             </div>
             <div class="carousel-list">
                 <div v-for="resume in latestResumes" :key="resume.id" class="carousel-item resume-item">
                      <h4>{{ resume.fullName }}</h4>
                      <p>{{ resume.position }}</p>
                      <p>{{ resume.salary.toLocaleString() }} ₸</p>
                       <!-- Add more resume details as needed -->
                 </div>
             </div>
         </div>

      </div>
    </section>

    <!-- Add other sections from template if needed (e.g., features, testimonials, footer) -->

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import jobApi from '@/modules/job/services/jobApi'; // Adjust path if necessary
import resumeApi from '@/modules/resume/services/resumeApi'; // Adjust path if necessary

const jobCount = ref(0);
const resumeCount = ref(0);
const latestJobs = ref([]);
const latestResumes = ref([]);

onMounted(async () => {
  try {
    // Fetch all jobs to get count and latest (basic implementation)
    const jobsResponse = await jobApi.getAllJobs(); // Assuming this fetches all jobs
    latestJobs.value = jobsResponse.data; // Use all jobs for latest for now
    jobCount.value = latestJobs.value.length;

    // Fetch all resumes to get count and latest (basic implementation)
    const resumesResponse = await resumeApi.getAllResumes(); // Assuming this fetches all resumes
    latestResumes.value = resumesResponse.data; // Use all resumes for latest for now
    resumeCount.value = latestResumes.value.length;

  } catch (error) {
    console.error('Error fetching data for home page:', error);
    // TODO: Display error message to user
  }
});
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

</style> 