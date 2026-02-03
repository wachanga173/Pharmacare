// Products service - manages product data
import { getFromStorage, saveToStorage } from '../utils/storage.js';

let productsCache = null;

export async function getProducts() {
    if (productsCache) {
        return productsCache;
    }
    
    // Try to get from localStorage first
    const storedProducts = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS);
    if (storedProducts && storedProducts.length > 0) {
        productsCache = storedProducts;
        return productsCache;
    }
    
    // Load from JSON file
    try {
        const response = await fetch(CONFIG.API.PRODUCTS);
        const products = await response.json();
        saveToStorage(CONFIG.STORAGE_KEYS.PRODUCTS, products);
        productsCache = products;
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

export async function getProductById(id) {
    const products = await getProducts();
    return products.find(p => p.id === parseInt(id));
}

export function searchProducts(products, query) {
    if (!query || query.trim() === '') {
        return products;
    }
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.category?.toLowerCase().includes(lowerQuery)
    );
}

export function filterByCategory(products, category) {
    if (!category || category === 'all') {
        return products;
    }
    
    return products.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
    );
}

export function addProduct(product) {
    const products = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    product.id = Math.max(...products.map(p => p.id), 0) + 1;
    products.push(product);
    saveToStorage(CONFIG.STORAGE_KEYS.PRODUCTS, products);
    productsCache = null; // Clear cache
    return product;
}

export function updateProduct(id, updates) {
    const products = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    const index = products.findIndex(p => p.id === id);
    
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        saveToStorage(CONFIG.STORAGE_KEYS.PRODUCTS, products);
        productsCache = null; // Clear cache
        return products[index];
    }
    
    return null;
}

export function deleteProduct(id) {
    let products = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    products = products.filter(p => p.id !== id);
    saveToStorage(CONFIG.STORAGE_KEYS.PRODUCTS, products);
    productsCache = null; // Clear cache
    return true;
}
