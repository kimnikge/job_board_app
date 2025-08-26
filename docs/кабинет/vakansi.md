<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Горячая вакансия - Бармен</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .job-card {
            max-width: 380px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            position: relative;
            animation: slideUp 0.8s ease;
        }

        @keyframes slideUp {
            from { 
                transform: translateY(50px); 
                opacity: 0; 
            }
            to { 
                transform: translateY(0); 
                opacity: 1; 
            }
        }

        .card-header {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            padding: 25px;
            position: relative;
            overflow: hidden;
        }

        .card-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-20px, -20px) rotate(10deg); }
        }

        .urgent-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 15px;
            border-radius: 20px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .job-title {
            font-size: 28px;
            font-weight: 800;
            color: white;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
            position: relative;
            z-index: 2;
        }

        .job-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 500;
            position: relative;
            z-index: 2;
        }

        .card-content {
            padding: 30px 25px;
        }

        .time-section {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            margin: -10px -10px 25px -10px;
            padding: 20px;
            border-radius: 20px;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .time-section::before {
            content: '⏰';
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            opacity: 0.3;
        }

        .time-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .time-details {
            font-size: 16px;
            font-weight: 600;
        }

        .requirements-section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .requirement-item {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 15px;
            color: white;
            font-weight: 500;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .requirement-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background: rgba(255,255,255,0.5);
            border-radius: 0 10px 10px 0;
        }

        .requirement-item:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(240, 147, 251, 0.4);
        }

        .requirement-item:nth-child(2) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .requirement-item:nth-child(3) {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            color: #2d3748;
        }

        .requirement-item:nth-child(4) {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #2d3748;
        }

        .requirement-icon {
            margin-right: 10px;
            font-size: 18px;
        }

        .salary-section {
            background: linear-gradient(135deg, #ffeaa7, #fab1a0);
            padding: 20px;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 25px;
            position: relative;
            overflow: hidden;
        }

        .salary-section::before {
            content: '💰';
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 30px;
            opacity: 0.3;
        }

        .salary-amount {
            font-size: 32px;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .salary-description {
            color: #5a5a5a;
            font-weight: 600;
        }

        .benefits-section {
            background: rgba(102, 126, 234, 0.1);
            padding: 20px;
            border-radius: 20px;
            margin-bottom: 25px;
        }

        .benefit-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-weight: 500;
            color: #4a5568;
        }

        .benefit-item:last-child {
            margin-bottom: 0;
        }

        .benefit-icon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 16px;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
        }

        .btn-apply {
            flex: 2;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-apply::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .btn-apply:hover::before {
            left: 100%;
        }

        .btn-apply:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(79, 172, 254, 0.6);
        }

        .btn-save {
            flex: 1;
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
            border: 2px solid #ff6b6b;
            padding: 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-save:hover {
            background: #ff6b6b;
            color: white;
            transform: scale(1.1);
        }

        .back-btn {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            z-index: 10;
        }

        .back-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }

        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }

        .floating-circle {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,142,142,0.2));
            animation: floatUpDown 4s ease-in-out infinite;
        }

        .floating-circle:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 80%;
            animation-delay: 0s;
        }

        .floating-circle:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 70%;
            left: 10%;
            animation-delay: 2s;
        }

        .floating-circle:nth-child(3) {
            width: 100px;
            height: 100px;
            top: 30%;
            left: 5%;
            animation-delay: 1s;
        }

        @keyframes floatUpDown {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
    </style>
</head>
<body>
    <div class="floating-elements">
        <div class="floating-circle"></div>
        <div class="floating-circle"></div>
        <div class="floating-circle"></div>
    </div>

    <div class="job-card">
        <div class="card-header">
            <button class="back-btn" onclick="goBack()">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                </svg>
            </button>
            
            <div class="urgent-badge">
                🔥 Срочно на подмену
            </div>
            <h1 class="job-title">Бармен</h1>
            <p class="job-subtitle">Требуется опытный специалист</p>
        </div>

        <div class="card-content">
            <div class="time-section">
                <div class="time-title">Завтра смена</div>
                <div class="time-details">18:00 - 02:00 (8 часов)</div>
            </div>

            <div class="requirements-section">
                <h3 class="section-title">
                    ⚡ Требования
                </h3>
                
                <div class="requirement-item">
                    <span class="requirement-icon">🍸</span>
                    Умение готовить коктейли
                </div>
                
                <div class="requirement-item">
                    <span class="requirement-icon">🥃</span>
                    Знание элитного алкоголя
                </div>
                
                <div class="requirement-item">
                    <span class="requirement-icon">☕</span>
                    Навыки бариста
                </div>
            </div>

            <div class="salary-section">
                <div class="salary-amount">15 000 ₸</div>
                <div class="salary-description">За выход на смену</div>
            </div>

            <div class="benefits-section">
                <h3 class="section-title">
                    🎁 Бонусы
                </h3>
                
                <div class="benefit-item">
                    <div class="benefit-icon">🍕</div>
                    Стафф питание включено
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">🚗</div>
                    Развозка в черте города
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn-apply" onclick="applyForJob()">
                    Откликнуться сейчас
                </button>
                <button class="btn-save" onclick="saveJob()">
                    ❤️
                </button>
            </div>
        </div>
    </div>

    <script>
        function applyForJob() {
            const btn = document.querySelector('.btn-apply');
            btn.style.transform = 'scale(0.95)';
            btn.innerHTML = 'Отправляем...';
            
            setTimeout(() => {
                btn.innerHTML = '✅ Отклик отправлен!';
                btn.style.background = 'linear-gradient(135deg, #55a3ff, #003d82)';
                showNotification('Ваш отклик отправлен! 🚀 Ожидайте звонка от работодателя');
                
                setTimeout(() => {
                    btn.style.transform = '';
                }, 300);
            }, 1000);
        }

        function saveJob() {
            const btn = document.querySelector('.btn-save');
            btn.innerHTML = '💖';
            btn.style.transform = 'scale(1.2)';
            btn.style.background = '#ff6b6b';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.style.transform = '';
                showNotification('Вакансия добавлена в избранное! 💖');
            }, 300);
        }

        function goBack() {
            const card = document.querySelector('.job-card');
            card.style.animation = 'slideDown 0.5s ease forwards';
            
            setTimeout(() => {
                showNotification('Возвращаемся к списку вакансий...');
            }, 300);
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #4facfe, #00f2fe);
                color: white;
                padding: 15px 25px;
                border-radius: 15px;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(79, 172, 254, 0.4);
                z-index: 1000;
                animation: slideInDown 0.5s ease;
                max-width: 90%;
                text-align: center;
            `;
            notification.textContent = message;
            
            if (!document.querySelector('#notificationStyles')) {
                const style = document.createElement('style');
                style.id = 'notificationStyles';
                style.textContent = `
                    @keyframes slideInDown {
                        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                        to { transform: translateX(-50%) translateY(0); opacity: 1; }
                    }
                    @keyframes slideDown {
                        from { transform: translateY(0); opacity: 1; }
                        to { transform: translateY(50px); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideInDown 0.5s ease reverse';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }

        // Добавляем интерактивность при загрузке
        document.addEventListener('DOMContentLoaded', function() {
            const requirements = document.querySelectorAll('.requirement-item');
            requirements.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.6s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 200 + index * 100);
            });
        });

        // Добавляем свайп-жесты
        let startX, startY, distX, distY;
        const threshold = 100;

        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            distX = e.changedTouches[0].clientX - startX;
            distY = e.changedTouches[0].clientY - startY;
            
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
                if (distX > 0) {
                    // Свайп вправо - лайк
                    saveJob();
                } else {
                    // Свайп влево - отклик
                    applyForJob();
                }
            }
        });
    </script>
</body>
</html>