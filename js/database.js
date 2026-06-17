// js/database.js - Имитация базы данных через localStorage
class Database {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация БД если пусто
        if (!localStorage.getItem('sportArenaDB')) {
            const initialDB = {
                users: [
                    { id: 1, login: 'admin', password: 'admin', role: 'admin', name: 'Администратор' },
                    { id: 2, login: 'client', password: 'client', role: 'client', name: 'Иван Петров' }
                ],
                inventory: [
                    { id: 1, name: 'Горный велосипед Merida', category: 'bikes', price: 1100, 
                      description: '24 скорости, дисковые тормоза, алюминиевая рама', 
                      icon: 'fa-bicycle', count: 15, available: 12 },
                    { id: 2, name: 'BMX Stunt Pro', category: 'bikes', price: 700, 
                      description: 'Прочный 20 дюймов, стальная рама', 
                      icon: 'fa-bicycle', count: 10, available: 8 },
                    { id: 3, name: 'Городской велосипед', category: 'bikes', price: 500, 
                      description: 'Корзина, 7 скоростей, удобное седло', 
                      icon: 'fa-bicycle', count: 20, available: 18 },
                    { id: 4, name: 'Байдарка двухместная', category: 'boats', price: 1200, 
                      description: 'Устойчивая, весла в комплекте', 
                      icon: 'fa-ship', count: 8, available: 6 },
                    { id: 5, name: 'SUP-борд 10\'6"', category: 'sup', price: 900, 
                      description: 'Широкий, весло и насос в комплекте', 
                      icon: 'fa-water', count: 12, available: 10 },
                    { id: 6, name: 'Палатка 2-местная', category: 'trekking', price: 700, 
                      description: 'Водостойкая, легкая, тамбур', 
                      icon: 'fa-campground', count: 25, available: 22 },
                    { id: 7, name: 'Гидрокостюм 3/2 мм', category: 'wetsuit', price: 600, 
                      description: 'Короткие рукава, неопрен', 
                      icon: 'fa-tshirt', count: 30, available: 28 },
                    { id: 8, name: 'Скальные туфли', category: 'climbing', price: 550, 
                      description: 'Размеры 36-45, липкая резина', 
                      icon: 'fa-shoe-prints', count: 20, available: 18 },
                    { id: 9, name: 'Гантели разборные 2-10 кг', category: 'fitness', price: 350, 
                      description: 'Регулировка веса, хромированный гриф', 
                      icon: 'fa-dumbbell', count: 15, available: 12 },
                    { id: 10, name: 'Сноуборд + ботинки', category: 'winter', price: 1100, 
                      description: 'Ростовка 150-165, крепления Burton', 
                      icon: 'fa-snowboarding', count: 10, available: 8 },
                    { id: 11, name: 'Детский велосипед 16"', category: 'kids', price: 450, 
                      description: 'С дополнительными колесами, звонок', 
                      icon: 'fa-bicycle', count: 12, available: 10 },
                    { id: 12, name: 'Коврик для йоги 6 мм', category: 'fitness', price: 200, 
                      description: 'Нескользящий, легкий', 
                      icon: 'fa-yoga', count: 25, available: 23 }
                ],
                orders: [],
                currentId: 1
            };
            this.saveDB(initialDB);
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem('sportArenaDB'));
    }

    saveDB(data) {
        localStorage.setItem('sportArenaDB', JSON.stringify(data));
    }

    // Работа с пользователями
    authenticate(login, password) {
        const db = this.getDB();
        return db.users.find(u => u.login === login && u.password === password);
    }

    // Работа с инвентарем
    getInventory() {
        return this.getDB().inventory;
    }

    getItemById(id) {
        return this.getDB().inventory.find(item => item.id === id);
    }

    addItem(item) {
        const db = this.getDB();
        item.id = db.inventory.length + 1;
        item.available = item.count || 0;
        db.inventory.push(item);
        this.saveDB(db);
        return item;
    }

    updateItem(id, updatedItem) {
        const db = this.getDB();
        const index = db.inventory.findIndex(item => item.id === id);
        if (index !== -1) {
            db.inventory[index] = { ...db.inventory[index], ...updatedItem };
            this.saveDB(db);
            return true;
        }
        return false;
    }

    // Работа с заказами
    getOrders() {
        return this.getDB().orders;
    }

    createOrder(orderData) {
        const db = this.getDB();
        const order = {
            id: db.orders.length + 1,
            userId: orderData.userId,
            itemId: orderData.itemId,
            itemName: orderData.itemName,
            startDate: orderData.startDate,
            endDate: orderData.endDate,
            days: orderData.days,
            totalPrice: orderData.totalPrice,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Уменьшаем количество доступных
        const item = db.inventory.find(i => i.id === orderData.itemId);
        if (item && item.available > 0) {
            item.available--;
        }
        
        db.orders.push(order);
        this.saveDB(db);
        return order;
    }

    getUserOrders(userId) {
        return this.getDB().orders.filter(order => order.userId === userId);
    }
}

// Создаем глобальный экземпляр БД
const db = new Database();