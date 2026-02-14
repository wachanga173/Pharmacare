// Application configuration
const CONFIG = {
    APP_NAME: 'Pharmacare',
    VERSION: '1.0.0',
    
    // Supabase Configuration
    SUPABASE: {
        URL: 'https://hegzpymtsmcsngpesidr.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ3pweW10c21jc25ncGVzaWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDM0ODUsImV4cCI6MjA4NTc3OTQ4NX0.PeFuKMvdAaFvhW_1vPlIHI7pwkGDsyaJ6DY4efcNjy4'
    },
    
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
    CURRENCY: 'KSh ',
    
    // Tax rate (percentage)
    TAX_RATE: 0.08,
    
    // Shipping
    SHIPPING_COST: 5.99,
    FREE_SHIPPING_THRESHOLD: 50
};

// Make CONFIG available globally for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
