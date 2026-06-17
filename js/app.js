// js/app.js - Основная логика приложения
class App {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.updateAuthUI();
        this.loadPage(this.currentPage);
    }

    // Навигация
    loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('mainContent');
        
        switch(page) {
            case 'home':
                content.innerHTML = this.getHomePage();
                break;
            case 'catalog':
                content.innerHTML = this.getCatalogPage();
                break;
            case 'about':
                content.innerHTML = this.getAboutPage();
                break;
            case 'support':
                content.innerHTML = this.getSupportPage();
                break;
            case 'blog':
                content.innerHTML = this.getBlogPage();
                break;
            case 'admin':
                content.innerHTML = this.getAdminPage();
                break;
            case 'order':
                content.innerHTML = this.getOrderPage();
                break;
            case 'my-orders':
                content.innerHTML = this.getMyOrdersPage();
                break;
            default:
                content.innerHTML = this.getHomePage();
        }
        
        this.updateActiveNav();
        window.scrollTo(0, 0);
    }

    updateActiveNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.textContent.toLowerCase().includes(this.currentPage)) {
                link.classList.add('active');
            }
        });
    }

    // Авторизация
    handleAuth(event) {
        event.preventDefault();
        const login = document.getElementById('authLogin').value;
        const password = document.getElementById('authPassword').value;
        
        const user = db.authenticate(login, password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateAuthUI();
            closeModal('authModal');
            showToast(`Добро пожаловать, ${user.name}!`);
            
            if (user.role === 'admin') {
                this.loadPage('admin');
            }
        } else {
            showToast('Неверный логин или пароль');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.loadPage('home');
        showToast('Вы вышли из системы');
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userNameDisplay = document.getElementById('userNameDisplay');
        
        if (this.currentUser) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            userNameDisplay.textContent = this.currentUser.name;
            
            // Добавляем ссылку в админку если админ
            if (this.currentUser.role === 'admin') {
                const adminLink = document.createElement('button');
                adminLink.textContent = 'Админка';
                adminLink.className = 'btn-logout';
                adminLink.onclick = () => this.loadPage('admin');
                userMenu.appendChild(adminLink);
            }
        } else {
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    // Страницы
    getHomePage() {
        return `
            <div class="hero-section">
                <div class="container">
                    <div class="hero-content">
                        <div class="hero-text">
                            <h1>Аренда снаряжения для активного отдыха</h1>
                            <p>Велосипеды, байдарки, горное снаряжение и полный комплект для туризма</p>
                            <button class="btn-primary" onclick="app.loadPage('catalog')">
                                <i class="fas fa-list"></i> Перейти в каталог
                            </button>
                        </div>
                        <div class="hero-stats">
                            <div class="stats-grid">
                                <div class="stat-item"><h3>120+</h3><p>ед. техники</p></div>
                                <div class="stat-item"><h3>98%</h3><p>довольных клиентов</p></div>
                                <div class="stat-item"><h3>24/7</h3><p>поддержка</p></div>
                                <div class="stat-item"><h3>5 звёзд</h3><p>на картах</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <h2 style="margin:30px 0 20px;">🏕️ Популярное снаряжение</h2>
                <div class="equipment-grid">
                    ${db.getInventory().slice(0, 6).map(item => this.createItemCard(item)).join('')}
                </div>
                
                <h2 style="margin:40px 0 20px;">🧭 Категории</h2>
                <div class="cat-grid">
                    ${this.getCategories().slice(0, 6).map(cat => this.createCategoryCard(cat)).join('')}
                </div>
            </div>
        `;
    }

    getCatalogPage() {
        const categories = this.getCategories();
        const inventory = db.getInventory();
        
        return `
            <div class="container" style="padding:30px 0;">
                <h2>📦 Каталог снаряжения</h2>
                <div class="cat-grid" style="margin:30px 0;">
                    ${categories.map(cat => `
                        <div class="cat-item" onclick="app.filterByCategory('${cat.key}')">
                            <i class="fas ${cat.icon}"></i>
                            <h4>${cat.name}</h4>
                            <p>${cat.desc}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div id="catalogItems">
                    <h3>Все товары</h3>
                    <div class="equipment-grid">
                        ${inventory.map(item => this.createItemCard(item)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    filterByCategory(category) {
        const items = db.getInventory().filter(item => item.category === category);
        const catalogItems = document.getElementById('catalogItems');
        if (catalogItems) {
            catalogItems.innerHTML = `
                <h3>Товары категории</h3>
                <div class="equipment-grid">
                    ${items.map(item => this.createItemCard(item)).join('')}
                </div>
                <button class="btn-primary" onclick="app.loadPage('catalog')" style="margin-top:20px;">
                    Показать все товары
                </button>
            `;
        }
    }

    getAboutPage() {
        return `
            <div class="container" style="padding:30px 0;">
                <h2>О нас</h2>
                <div class="admin-panel">
                    <h3><i class="fas fa-users"></i> Наш коллектив</h3>
                    <p>Нас 25 человек: от инструкторов до механиков. Мы тестируем всё снаряжение на себе.</p>
                </div>
                <div class="admin-panel">
                    <h3><i class="fas fa-clock"></i> Расписание</h3>
                    <p><strong>Пункты проката:</strong> ежедневно с 8:00 до 22:00</p>
                    <p><strong>Онлайн-поддержка:</strong> круглосуточно</p>
                </div>
                <div class="admin-panel">
                    <h3><i class="fas fa-map-marker-alt"></i> Пункты проката</h3>
                    <p><strong>Москва:</strong> ул. Лужники, 24, стр. 1</p>
                    <p><strong>Санкт-Петербург:</strong> Крестовский остров, 10</p>
                    <p><strong>Казань:</strong> ул. Баумана, 45</p>
                </div>
            </div>
        `;
    }

    getSupportPage() {
        return `
            <div class="container" style="padding:30px 0;">
                <h2>Поддержка</h2>
                <div class="admin-panel">
                    <h3><i class="fas fa-question-circle"></i> FAQ</h3>
                    <div style="margin:20px 0;">
                        <h4>Как забронировать снаряжение?</h4>
                        <p>Выберите товар в каталоге и нажмите "Арендовать". Наш менеджер свяжется с вами.</p>
                    </div>
                    <div style="margin:20px 0;">
                        <h4>Какие документы нужны?</h4>
                        <p>Паспорт или водительское удостоверение.</p>
                    </div>
                </div>
            </div>
        `;
    }

    getBlogPage() {
        return `
            <div class="container" style="padding:30px 0;">
                <h2>Блог</h2>
                <div class="equipment-grid">
                    <div class="equip-card" style="cursor:default;">
                        <div class="equip-icon"><i class="fas fa-bicycle"></i></div>
                        <h3>Топ-5 горных велосипедов 2026</h3>
                        <p>Сравнили модели Merida, Trek и Cannondale</p>
                    </div>
                    <div class="equip-card" style="cursor:default;">
                        <div class="equip-icon"><i class="fas fa-water"></i></div>
                        <h3>Байдарочный маршрут по Вуоксе</h3>
                        <p>Полный гайд по трёхдневному сплаву</p>
                    </div>
                </div>
            </div>
        `;
    }

    getOrderPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = parseInt(urlParams.get('item'));
        const item = db.getItemById(itemId);
        
        if (!item) {
            return '<div class="container"><h2>Товар не найден</h2></div>';
        }
        
        return `
            <div class="container" style="padding:30px 0;">
                <h2>Оформление заказа</h2>
                <div class="order-form">
                    <h3>${item.name}</h3>
                    <p>Цена: ${item.price} ₽/день</p>
                    
                    <form id="rentForm" onsubmit="app.submitOrder(event, ${item.id})">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Дата начала:</label>
                                <input type="date" id="startDate" required>
                            </div>
                            <div class="form-group">
                                <label>Дата окончания:</label>
                                <input type="date" id="endDate" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Количество дней: <span id="daysCount">0</span></label>
                            <label>Итого к оплате: <strong id="totalPrice">0 ₽</strong></label>
                        </div>
                        
                        <div class="form-group">
                            <label>Комментарий:</label>
                            <textarea id="comment" rows="3"></textarea>
                        </div>
                        
                        <button type="submit" class="btn-primary">Подтвердить заказ</button>
                    </form>
                </div>
            </div>
            <script>
                document.getElementById('startDate').addEventListener('change', calculatePrice);
                document.getElementById('endDate').addEventListener('change', calculatePrice);
                
                function calculatePrice() {
                    const start = new Date(document.getElementById('startDate').value);
                    const end = new Date(document.getElementById('endDate').value);
                    if (start && end && end > start) {
                        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        document.getElementById('daysCount').textContent = days;
                        document.getElementById('totalPrice').textContent = 
                            (days * ${item.price}) + ' ₽';
                    }
                }
            </script>
        `;
    }

    getMyOrdersPage() {
        if (!this.currentUser) {
            return `<div class="container"><h2>Необходимо авторизоваться</h2></div>`;
        }
        
        const orders = db.getUserOrders(this.currentUser.id);
        
        return `
            <div class="container" style="padding:30px 0;">
                <h2>Мои заказы</h2>
                ${orders.length === 0 ? 
                    '<p>У вас пока нет заказов</p>' :
                    `<table class="admin-table">
                        <thead>
                            <tr>
                                <th>Товар</th>
                                <th>Дата начала</th>
                                <th>Дата окончания</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>${order.itemName}</td>
                                    <td>${order.startDate}</td>
                                    <td>${order.endDate}</td>
                                    <td>${order.totalPrice} ₽</td>
                                    <td>${order.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`
                }
            </div>
        `;
    }

    getAdminPage() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            return '<div class="container"><h2>Доступ запрещен</h2></div>';
        }
        
        const orders = db.getOrders();
        const inventory = db.getInventory();
        
        return `
            <div class="container" style="padding:30px 0;">
                <h2>Админ-панель</h2>
                
                <div class="admin-panel">
                    <h3>Управление инвентарем</h3>
                    <form onsubmit="app.addInventoryItem(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Название:</label>
                                <input type="text" id="newItemName" required>
                            </div>
                            <div class="form-group">
                                <label>Цена (₽/день):</label>
                                <input type="number" id="newItemPrice" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Категория:</label>
                                <select id="newItemCategory">
                                    <option value="bikes">Велосипеды</option>
                                    <option value="boats">Лодки</option>
                                    <option value="sup">SUP-борды</option>
                                    <option value="trekking">Туризм</option>
                                    <option value="fitness">Фитнес</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Количество:</label>
                                <input type="number" id="newItemCount" value="1">
                            </div>
                        </div>
                        <button type="submit" class="btn-primary">Добавить товар</button>
                    </form>
                </div>
                
                <div class="admin-panel">
                    <h3>Список заказов</h3>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Товар</th>
                                <th>Даты</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>${order.id}</td>
                                    <td>${order.itemName}</td>
                                    <td>${order.startDate} - ${order.endDate}</td>
                                    <td>${order.totalPrice} ₽</td>
                                    <td>${order.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="admin-panel">
                    <h3>Текущий инвентарь</h3>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Цена</th>
                                <th>Всего</th>
                                <th>Доступно</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inventory.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.price} ₽</td>
                                    <td>${item.count}</td>
                                    <td>${item.available}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    addInventoryItem(event) {
        event.preventDefault();
        const item = {
            name: document.getElementById('newItemName').value,
            price: parseInt(document.getElementById('newItemPrice').value),
            category: document.getElementById('newItemCategory').value,
            count: parseInt(document.getElementById('newItemCount').value),
            description: 'Новый товар',
            icon: 'fa-box'
        };
        
        db.addItem(item);
        this.loadPage('admin');
        showToast('Товар добавлен!');
    }

    submitOrder(event, itemId) {
        event.preventDefault();
        
        if (!this.currentUser) {
            showToast('Необходимо авторизоваться');
            openModal('authModal');
            return;
        }
        
        const item = db.getItemById(itemId);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        
        const order = db.createOrder({
            userId: this.currentUser.id,
            itemId: itemId,
            itemName: item.name,
            startDate: startDate,
            endDate: endDate,
            days: days,
            totalPrice: days * item.price
        });
        
        showToast('Заказ оформлен!');
        setTimeout(() => this.loadPage('my-orders'), 1500);
    }

    createItemCard(item) {
        return `
            <div class="equip-card">
                <div class="equip-icon"><i class="fas ${item.icon}"></i></div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="equip-price">${item.price} ₽/день</div>
                <p style="color:#666;">Доступно: ${item.available} шт.</p>
                <button class="btn-primary" onclick="app.navigateToOrder(${item.id})">
                    Арендовать
                </button>
            </div>
        `;
    }

    navigateToOrder(itemId) {
        window.location.hash = `order?item=${itemId}`;
        this.loadPage('order');
    }

    getCategories() {
        return [
            { name: 'Велосипеды', icon: 'fa-bicycle', desc: 'Горные, BMX', key: 'bikes' },
            { name: 'Лодки/байдарки', icon: 'fa-ship', desc: 'Одноместные', key: 'boats' },
            { name: 'SUP-борды', icon: 'fa-water', desc: 'Надувные доски', key: 'sup' },
            { name: 'Туризм', icon: 'fa-hiking', desc: 'Палатки, рюкзаки', key: 'trekking' },
            { name: 'Гидрокостюмы', icon: 'fa-tshirt', desc: 'Неопрен', key: 'wetsuit' },
            { name: 'Скалолазание', icon: 'fa-mountain', desc: 'Обвязки, каски', key: 'climbing' },
            { name: 'Фитнес', icon: 'fa-dumbbell', desc: 'Гантели, коврики', key: 'fitness' },
            { name: 'Зимний спорт', icon: 'fa-skiing', desc: 'Лыжи, сноуборды', key: 'winter' },
            { name: 'Детское', icon: 'fa-child', desc: 'Велосипеды, защита', key: 'kids' }
        ];
    }

    createCategoryCard(cat) {
        return `
            <div class="cat-item" onclick="app.filterByCategory('${cat.key}')">
                <i class="fas ${cat.icon}"></i>
                <h4>${cat.name}</h4>
                <p>${cat.desc}</p>
            </div>
        `;
    }
}

// Вспомогательные функции
function showToast(message) {
    const toast = document.getElementById('toastMsg');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function navigateTo(page) {
    app.loadPage(page);
}

// Создаем экземпляр приложения при загрузке
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    
    // Обработчики событий
    document.getElementById('loginBtn').addEventListener('click', () => openModal('authModal'));
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Подписка
    document.getElementById('subscribeBtn').addEventListener('click', () => {
        const email = document.getElementById('subsEmail').value;
        if (email && email.includes('@')) {
            showToast('📩 Подписка оформлена!');
            document.getElementById('subsEmail').value = '';
        } else {
            showToast('✉️ Введите корректный email');
        }
    });
});