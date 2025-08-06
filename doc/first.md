<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Board - Твоя карьера начинается здесь</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-x: hidden;
            background: #0a0a0a;
            color: white;
        }

        /* Animated Background */
        .bg-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
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
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
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

        /* Header */
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

        /* Hero Section */
        .hero {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
        }

        .hero-content {
            max-width: 800px;
            padding: 0 20px;
        }

        .hero h1 {
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 30px;
            line-height: 1.1;
            animation: slideUp 1s ease-out;
        }

        .hero-subtitle {
            font-size: 1.5rem;
            margin-bottom: 50px;
            opacity: 0.9;
            animation: slideUp 1s ease-out 0.2s both;
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
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .dashboard-title {
            text-align: center;
            font-size: 3rem;
            font-weight: 900;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .dashboard-subtitle {
            text-align: center;
            font-size: 1.2rem;
            opacity: 0.8;
            margin-bottom: 60px;
        }

        /* Stats Counter */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-bottom: 80px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
            cursor: pointer;
        }

        .stat-card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 900;
            display: block;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stat-label {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        /* Carousel Sections */
        .carousel-section {
            margin: 80px 0;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
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

        /* Card Carousel */
        .carousel-container {
            position: relative;
            overflow: hidden;
            margin: 0 -20px;
        }

        .carousel-track {
            display: flex;
            transition: transform 0.5s ease;
            gap: 30px;
            padding: 0 20px;
        }

        /* Job Cards */
        .job-card {
            min-width: 350px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .job-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s;
        }

        .job-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            background: rgba(255, 255, 255, 0.15);
        }

        .job-card:hover::before {
            left: 100%;
        }

        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        .job-company {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .job-status {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(0, 255, 0, 0.3);
        }

        .job-title {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 10px;
            color: white;
        }

        .job-company-name {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
        }

        .job-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        }

        .job-detail {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }

        .job-salary {
            font-size: 1.5rem;
            font-weight: 800;
            color: #00ff88;
            margin-top: 15px;
        }

        /* Resume Cards */
        .resume-card {
            min-width: 320px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
            cursor: pointer;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .resume-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s;
        }

        .resume-card:hover {
            transform: translateY(-15px) scale(1.05);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            background: rgba(255, 255, 255, 0.15);
        }

        .resume-card:hover::before {
            left: 100%;
        }

        .resume-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(45deg, #f093fb, #f5576c);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
        }

        .resume-name {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: white;
        }

        .resume-title {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 15px;
        }

        .resume-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-bottom: 20px;
        }

        .skill-tag {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .resume-experience {
            color: #00ff88;
            font-weight: 600;
        }

        /* Floating Action Button */
        .fab {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
            transition: all 0.3s;
            z-index: 1000;
        }

        .fab:hover {
            transform: scale(1.1) rotate(360deg);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.7);
        }

        /* Search Overlay */
        .search-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }

        .search-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .search-container {
            max-width: 600px;
            width: 90%;
            position: relative;
        }

        .search-input {
            width: 100%;
            padding: 25px 30px;
            font-size: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            color: white;
            outline: none;
            transition: all 0.3s;
        }

        .search-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
        }

        .search-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .close-search {
            position: absolute;
            top: -60px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s;
        }

        .close-search:hover {
            transform: scale(1.2) rotate(90deg);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .dashboard-title {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            
            .job-card, .resume-card {
                min-width: 280px;
            }
            
            .section-header {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }
        }

        /* Scroll Indicator */
        .scroll-indicator {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            z-index: 10000;
            transition: width 0.1s;
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>
    <div class="scroll-indicator"></div>

    <header class="header">
        <nav class="nav">
            <a href="#" class="logo">🚀 JobBoard</a>
        </nav>
    </header>

    <section class="hero">
        <div class="hero-content">
            <h1>Будущее твоей карьеры<br>начинается <em>прямо сейчас</em></h1>
            <p class="hero-subtitle">Открой мир безграничных возможностей</p>
        </div>
    </section>

    <section class="dashboard">
        <div class="dashboard-container">
            <h2 class="dashboard-title">Live статистика</h2>
            <p class="dashboard-subtitle">Платформа растет каждую секунду</p>
            
            <div class="stats-grid">
                <div class="stat-card" onclick="animateCounter(this, 1247)">
                    <span class="stat-number" data-target="1247">0</span>
                    <span class="stat-label">Активных вакансий</span>
                </div>
                <div class="stat-card" onclick="animateCounter(this, 2891)">
                    <span class="stat-number" data-target="2891">0</span>
                    <span class="stat-label">Резюме в базе</span>
                </div>
                <div class="stat-card" onclick="animateCounter(this, 486)">
                    <span class="stat-number" data-target="486">0</span>
                    <span class="stat-label">IT компаний</span>
                </div>
                <div class="stat-card" onclick="animateCounter(this, 156)">
                    <span class="stat-number" data-target="156">0</span>
                    <span class="stat-label">Новых сегодня</span>
                </div>
            </div>

            <!-- Вакансии Карусель -->
            <div class="carousel-section">
                <div class="section-header">
                    <h3 class="section-title">🔥 Горячие вакансии</h3>
                    <div class="carousel-controls">
                        <button class="carousel-btn" onclick="slideCarousel('jobs', -1)">←</button>
                        <button class="carousel-btn" onclick="slideCarousel('jobs', 1)">→</button>
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
                        <button class="carousel-btn" onclick="slideCarousel('resumes', -1)">←</button>
                        <button class="carousel-btn" onclick="slideCarousel('resumes', 1)">→</button>
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
    <button class="fab" onclick="openSearch()">🔍</button>

    <!-- Search Overlay -->
    <div class="search-overlay" id="searchOverlay">
        <div class="search-container">
            <button class="close-search" onclick="closeSearch()">×</button>
            <input type="text" class="search-input" placeholder="Поиск вакансий, резюме, компаний..." onkeydown="handleSearch(event)">
        </div>
    </div>

    <script>
        // Scroll indicator
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            document.querySelector('.scroll-indicator').style.width = scrollPercent + '%';
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Counter animation
        function animateCounter(element, target) {
            const counter = element.querySelector('.stat-number');
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current).toLocaleString();
            }, 20);
        }

        // Carousel functionality
        let carouselPositions = {
            jobs: 0,
            resumes: 0
        };

        function slideCarousel(type, direction) {
            const track = document.getElementById(type + '-track');
            const cards = track.children;
            const cardWidth = cards[0].offsetWidth + 30; // card width + gap
            const maxPosition = -(cards.length - 3) * cardWidth; // show 3 cards at once
            
            carouselPositions[type] += direction * cardWidth;
            
            if (carouselPositions[type] > 0) carouselPositions[type] = 0;
            if (carouselPositions[type] < maxPosition) carouselPositions[type] = maxPosition;
            
            track.style.transform = `translateX(${carouselPositions[type]}px)`;
        }

        // Auto-scroll carousels
        setInterval(() => {
            slideCarousel('jobs', 1);
        }, 5000);

        setInterval(() => {
            slideCarousel('resumes', 1);
        }, 6000);

        // Search overlay
        function openSearch() {
            document.getElementById('searchOverlay').classList.add('active');
            document.querySelector('.search-input').focus();
        }

        function closeSearch() {
            document.getElementById('searchOverlay').classList.remove('active');
        }

        function handleSearch(event) {
            if (event.key === 'Escape') {
                closeSearch();
            } else if (event.key === 'Enter') {
                // Handle search
                console.log('Searching for:', event.target.value);
                closeSearch();
            }
        }

        // Click outside to close search
        document.getElementById('searchOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeSearch


                # По тегу
git checkout v1.0.0-homepage-showcase

# По хешу коммита
git checkout a58ba69

# Посмотреть изменения
git show v1.0.0-homepage-showcase