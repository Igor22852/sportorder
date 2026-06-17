// js/router.js - Роутинг
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('order')) {
        app.loadPage('order');
    } else if (hash === 'admin') {
        app.loadPage('admin');
    } else if (hash === 'my-orders') {
        app.loadPage('my-orders');
    } else {
        app.loadPage(hash || 'home');
    }
});