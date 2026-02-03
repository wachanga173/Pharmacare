// Application configuration
const CONFIG = {
    APP_NAME: 'Online Pharmacy',
    VERSION: '1.0.0',
    
    // Storage keys
    STORAGE_KEYS: {
        CART: 'pharmacy_cart',
        USER: 'pharmacy_user',
        PRODUCTS: 'pharmacy_products',
        ORDERS: 'pharmacy_orders'
    },
    
    // API endpoints (mock for now)
    API: {
        PRODUCTS: 'data/products.json',
        USERS: 'data/users.json'
    },
    
    // Pagination
    ITEMS_PER_PAGE: 12,
    
    // Toast duration
    TOAST_DURATION: 3000,
    
    // Currency
    CURRENCY: '$',
    
    // Tax rate (percentage)
    TAX_RATE: 0.08,
    
    // Shipping
    SHIPPING_COST: 5.99,
    FREE_SHIPPING_THRESHOLD: 50
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
