<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job App - HoReCa Kazakhstan</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .app-container {
            max-width: 414px;
            margin: 0 auto;
            background: #f8f9ff;
            min-height: 100vh;
            position: relative;
            box-shadow: 0 0 30px rgba(0,0,0,0.2);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 20px rgba(102, 126, 234, 0.3);
        }

        .logo {
            color: white;
            font-size: 20px;
            font-weight: bold;
        }

        .header-actions {
            display: flex;
            gap: 15px;
        }

        .header-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        .header-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }

        /* Search Bar */
        .search-container {
            padding: 20px;
            background: white;
            margin: -10px 15px 20px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
            position: relative;
            z-index: 10;
        }

        .search-bar {
            display: flex;
            align-items: center;
            background: #f8f9ff;
            border-radius: 12px;
            padding: 12px 15px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }

        .search-bar:focus-within {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-bar input {
            flex: 1;
            border: none;
            background: none;
            outline: none;
            font-size: 16px;
            margin-left: 10px;
        }

        .search-bar i {
            color: #667eea;
        }

        /* Location Filter */
        .location-filter {
            padding: 0 20px 20px;
        }

        .filter-tabs {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 5px;
        }

        .filter-tab {
            background: white;
            border: 2px solid #e0e7ff;
            padding: 8px 16px;
            border-radius: 20px;
            white-space: nowrap;
            transition: all 0.3s ease;
            cursor: pointer;
            font-size: 14px;
        }

        .filter-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }

        .filter-tab:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }

        /* Categories Section */
        .categories-section {
            padding: 0 20px 20px;
        }

        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .category-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .category-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .category-card:hover::before {
            transform: scaleX(1);
        }

        .category-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }

        .category-icon {
            font-size: 30px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .category-name {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .category-count {
            color: #666;
            font-size: 12px;
        }

        /* Quick Actions */
        .quick-actions {
            padding: 0 20px 20px;
        }

        .actions-carousel {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            padding-bottom: 5px;
        }

        .action-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            min-width: 160px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .action-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .action-card i {
            font-size: 24px;
            margin-bottom: 10px;
            display: block;
        }

        .action-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .action-subtitle {
            font-size: 12px;
            opacity: 0.8;
        }

        /* Recent Activity */
        .recent-activity {
            padding: 0 20px 100px;
        }

        .activity-list {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }

        .activity-item {
            padding: 15px 20px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-item:hover {
            background: #f8f9ff;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 3px;
        }

        .activity-meta {
            color: #666;
            font-size: 12px;
        }

        /* Bottom Navigation */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 414px;
            background: white;
            padding: 10px 0;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
            z-index: 100;
        }

        .nav-items {
            display: flex;
            justify-content: around;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 12px;
            text-decoration: none;
            color: #666;
            transition: all 0.3s ease;
            border-radius: 12px;
            cursor: pointer;
        }

        .nav-item.active {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }

        .nav-item i {
            font-size: 20px;
            margin-bottom: 4px;
        }

        .nav-item span {
            font-size: 11px;
            font-weight: 500;
        }

        .nav-item:hover {
            color: #667eea;
            transform: translateY(-2px);
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .category-card, .action-card, .activity-item {
            animation: fadeInUp 0.6s ease forwards;
        }

        .category-card:nth-child(2) { animation-delay: 0.1s; }
        .category-card:nth-child(3) { animation-delay: 0.2s; }
        .category-card:nth-child(4) { animation-delay: 0.3s; }

        /* Scrollbar Styling */
        .filter-tabs::-webkit-scrollbar,
        .actions-carousel::-webkit-scrollbar {
            height: 4px;
        }

        .filter-tabs::-webkit-scrollbar-track,
        .actions-carousel::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 2px;
        }

        .filter-tabs::-webkit-scrollbar-thumb,
        .actions-carousel::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 2px;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .modal-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            padding: 20px;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }

        .modal-title {
            font-size: 18px;
            font-weight: bold;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #666;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <i class="fas fa-utensils"></i> Job App
            </div>
            <div class="header-actions">
                <button class="header-btn" onclick="openNotifications()">
                    <i class="fas fa-bell"></i>
                </button>
                <button class="header-btn" onclick="openMenu()">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>

        <!-- Search Container -->
        <div class="search-container">
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Поиск вакансий или специалистов...">
            </div>
        </div>

        <!-- Location Filter -->
        <div class="location-filter">
            <div class="filter-tabs">
                <div class="filter-tab active" onclick="setLocation(this, 'all')">Все города</div>
                <div class="filter-tab" onclick="setLocation(this, 'almaty')">Алматы</div>
                <div class="filter-tab" onclick="setLocation(this, 'astana')">Астана</div>
                <div class="filter-tab" onclick="setLocation(this, 'shymkent')">Шимкент</div>
                <div class="filter-tab" onclick="setLocation(this, 'aktobe')">Актобе</div>
            </div>
        </div>

        <!-- Categories Section -->
        <div class="categories-section">
            <h2 class="section-title">
                <i class="fas fa-th-large"></i>
                Категории
            </h2>
            <div class="categories-grid">
                <div class="category-card" onclick="openCategory('waiter')">
                    <div class="category-icon">
                        <i class="fas fa-concierge-bell"></i>
                    </div>
                    <div class="category-name">Официанты</div>
                    <div class="category-count">156 вакансий</div>
                </div>
                <div class="category-card" onclick="openCategory('chef')">
                    <div class="category-icon">
                        <i class="fas fa-chef-hat"></i>
                    </div>
                    <div class="category-name">Повара</div>
                    <div class="category-count">89 вакансий</div>
                </div>
                <div class="category-card" onclick="openCategory('barista')">
                    <div class="category-icon">
                        <i class="fas fa-coffee"></i>
                    </div>
                    <div class="category-name">Бариста</div>
                    <div class="category-count">67 вакансий</div>
                </div>
                <div class="category-card" onclick="openCategory('manager')">
                    <div class="category-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="category-name">Менеджеры</div>
                    <div class="category-count">43 вакансии</div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
            <h2 class="section-title">
                <i class="fas fa-bolt"></i>
                Быстрые действия
            </h2>
            <div class="actions-carousel">
                <div class="action-card" onclick="switchPage('urgent')">
                    <i class="fas fa-fire"></i>
                    <div class="action-title">Срочно</div>
                    <div class="action-subtitle">Горячие вакансии</div>
                </div>
                <div class="action-card" onclick="switchPage('resumes')">
                    <i class="fas fa-user-circle"></i>
                    <div class="action-title">Резюме</div>
                    <div class="action-subtitle">Найти специалиста</div>
                </div>
                <div class="action-card" onclick="openCreateJob()">
                    <i class="fas fa-plus-circle"></i>
                    <div class="action-title">Создать</div>
                    <div class="action-subtitle">Разместить вакансию</div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
            <h2 class="section-title">
                <i class="fas fa-clock"></i>
                Последние обновления
            </h2>
            <div class="activity-list">
                <div class="activity-item" onclick="openActivity('new-job')">
                    <div class="activity-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Новая вакансия: Старший повар</div>
                        <div class="activity-meta">Ресторан "Алаша" • 5 мин назад</div>
                    </div>
                </div>
                <div class="activity-item" onclick="openActivity('new-resume')">
                    <div class="activity-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Новое резюме: Официант с опытом</div>
                        <div class="activity-meta">Ерлан К. • 15 мин назад</div>
                    </div>
                </div>
                <div class="activity-item" onclick="openActivity('promotion')">
                    <div class="activity-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Акция: Бесплатное размещение</div>
                        <div class="activity-meta">Действует до конца месяца</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <div class="nav-items">
                <a href="#" class="nav-item active" onclick="switchPage('home')">
                    <i class="fas fa-home"></i>
                    <span>Главная</span>
                </a>
                <a href="#" class="nav-item" onclick="switchPage('jobs')">
                    <i class="fas fa-bullhorn"></i>
                    <span>Объявления</span>
                </a>
                <a href="#" class="nav-item" onclick="switchPage('resumes')">
                    <i class="fas fa-user"></i>
                    <span>Резюме</span>
                </a>
                <a href="#" class="nav-item" onclick="switchPage('urgent')">
                    <i class="fas fa-fire"></i>
                    <span>Срочно</span>
                </a>
                <a href="#" class="nav-item" onclick="switchPage('profile')">
                    <i class="fas fa-user-circle"></i>
                    <span>Профиль</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Category Modal -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Вакансии в категории</div>
                <button class="modal-close" onclick="closeModal('categoryModal')">&times;</button>
            </div>
            <div id="categoryContent">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    </div>

    <script>
        // Navigation Functions
        function switchPage(page) {
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            event.target.closest('.nav-item').classList.add('active');
            
            // Here you would implement page switching logic
            console.log('Switching to page:', page);
            
            // Simulate page content change
            updatePageContent(page);
        }

        function updatePageContent(page) {
            // This would update the main content based on the selected page
            const pageContent = {
                'home': 'Главная страница',
                'jobs': 'Страница объявлений',
                'resumes': 'Страница резюме', 
                'urgent': 'Срочные вакансии',
                'profile': 'Профиль пользователя'
            };
            
            // Add visual feedback
            document.body.style.background = page === 'urgent' ? 
                'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' : 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        // Location Filter
        function setLocation(element, location) {
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            element.classList.add('active');
            
            // Add animation effect
            element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
            
            console.log('Location set to:', location);
        }

        // Category Functions
        function openCategory(category) {
            const categoryData = {
                'waiter': {
                    title: 'Вакансии официантов',
                    jobs: [
                        { title: 'Официант в ресторан', company: 'Ресторан "Достар"', salary: '120,000 - 150,000 ₸' },
                        { title: 'Старший официант', company: 'Кафе "Арман"', salary: '150,000 - 180,000 ₸' },
                        { title: 'Официант-бармен', company: 'Бар "Алматы"', salary: '130,000 - 160,000 ₸' }
                    ]
                },
                'chef': {
                    title: 'Вакансии поваров',
                    jobs: [
                        { title: 'Повар горячего цеха', company: 'Ресторан "Казахстан"', salary: '200,000 - 250,000 ₸' },
                        { title: 'Су-шеф', company: 'Отель "Достык"', salary: '300,000 - 400,000 ₸' },
                        { title: 'Повар-кондитер', company: 'Кафе "Сладость"', salary: '180,000 - 220,000 ₸' }
                    ]
                }
            };

            const data = categoryData[category] || categoryData['waiter'];
            
            let content = `<h3>${data.title}</h3><div style="margin-top: 15px;">`;
            data.jobs.forEach(job => {
                content += `
                    <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                        <div style="font-weight: 600; margin-bottom: 5px;">${job.title}</div>
                        <div style="color: #666; font-size: 14px; margin-bottom: 3px;">${job.company}</div>
                        <div style="color: #667eea; font-weight: 600;">${job.salary}</div>
                    </div>
                `;
            });
            content += '</div>';
            
            document.getElementById('categoryContent').innerHTML = content;
            document.getElementById('categoryModal').style.display = 'block';
        }

        // Modal Functions
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Header Functions
        function openNotifications() {
            alert('Уведомления: У вас 3 новых сообщения');
        }

        function openMenu() {
            alert('Меню: Настройки, Помощь, О приложении');
        }

        // Activity Functions
        function openActivity(activityId) {
            const activities = {
                'new-job': 'Открыть вакансию: Старший повар в ресторане "Алаша"',
                'new-resume': 'Посмотреть резюме: Официант с опытом работы 3 года',
                'promotion': 'Подробнее об акции: Размещайте вакансии бесплатно'
            };
            
            alert(activities[activityId] || 'Подробности активности');
        }

        function openCreateJob() {
            alert('Создание новой вакансии: Переход в форму размещения');
        }

        // Search functionality
        document.querySelector('.search-bar input').addEventListener('input', function(e) {
            const query = e.target.value;
            if (query.length > 2) {
                // Simulate search suggestions
                console.log('Searching for:', query);
            }
        });

        // Add touch animations for mobile
        document.querySelectorAll('.category-card, .action-card, .nav-item').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        });

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            console.log('HoReCa Job App initialized');
            
            // Add some loading animation
            document.querySelectorAll('.category-card').forEach((card, index) => {
                card.style.animationDelay = (index * 0.1) + 's';
            });
        });
    </script>
</body>
</html>