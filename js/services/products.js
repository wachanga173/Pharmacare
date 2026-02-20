// Products service - manages product data
import { getFromStorage, saveToStorage } from '../utils/storage.js';

let productsCache = null;
let supabase = null;

// Initialize Supabase client
function getSupabaseClient() {
    if (!supabase) {
        console.log('Checking Supabase dependencies:');
        console.log('- window.supabase:', typeof window.supabase);
        console.log('- window.CONFIG:', typeof window.CONFIG);
        console.log('- window.CONFIG.SUPABASE:', window.CONFIG?.SUPABASE);
        
        if (typeof window !== 'undefined' && window.supabase && window.CONFIG && window.CONFIG.SUPABASE.URL && window.CONFIG.SUPABASE.ANON_KEY) {
            console.log('Initializing Supabase client...');
            supabase = window.supabase.createClient(window.CONFIG.SUPABASE.URL, window.CONFIG.SUPABASE.ANON_KEY);
            console.log('Supabase client initialized successfully');
        }
    }
    return supabase;
}

export async function getProducts() {
    if (productsCache) {
        return productsCache;
    }
    
    // If Supabase is configured, fetch from there
    const client = getSupabaseClient();
    console.log('Supabase client:', client ? 'Available' : 'Not available');
    
    if (client) {
        try {
            console.log('Fetching products from Supabase...');
            const { data, error } = await client
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Products fetched from Supabase:', data?.length || 0, 'items');
            productsCache = data || [];
            return productsCache;
        } catch (error) {
            console.error('Error loading products from Supabase:', error);
        }
    } else {
        console.warn('Supabase client not initialized. Check CONFIG settings.');
    }
    
    // Fallback to localStorage or return empty array
    const storedProducts = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS);
    if (storedProducts && storedProducts.length > 0) {
        console.log('Using cached products from localStorage:', storedProducts.length, 'items');
        productsCache = storedProducts;
        return productsCache;
    }
    
    console.log('No products found in Supabase or localStorage');
    return [];
}

export async function getProductById(id) {
    const products = await getProducts();
    // Handle both string UUIDs and integer IDs
    return products.find(p => p.id == id || p.id === parseInt(id));
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

export async function addProduct(product) {
    // If Supabase is configured, add to Supabase
    const client = getSupabaseClient();
    if (client) {
        try {
            const { data, error } = await client
                .from('products')
                .insert([product])
                .select()
                .single();
            
            if (error) throw error;
            
            productsCache = null; // Clear cache
            return data;
        } catch (error) {
            console.error('Error adding product to Supabase:', error);
            throw error;
        }
    }
    
    // Fallback to localStorage
    const products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    product.id = Math.max(...products.map(p => p.id), 0) + 1;
    products.push(product);
    saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
    productsCache = null;
    return product;
}

export async function updateProduct(id, updates) {
    // If Supabase is configured, update in Supabase
    const client = getSupabaseClient();
    if (client) {
        try {
            const { data, error } = await client
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            productsCache = null; // Clear cache
            return data;
        } catch (error) {
            console.error('Error updating product in Supabase:', error);
            throw error;
        }
    }
    
    // Fallback to localStorage
    const products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    const index = products.findIndex(p => p.id === id);
    
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
        productsCache = null;
        return products[index];
    }
    
    return null;
}

export async function deleteProduct(id) {
    // If Supabase is configured, delete from Supabase
    const client = getSupabaseClient();
    if (client) {
        try {
            const { error } = await client
                .from('products')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            productsCache = null; // Clear cache
            return true;
        } catch (error) {
            console.error('Error deleting product from Supabase:', error);
            throw error;
        }
    }
    
    // Fallback to localStorage
    let products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    products = products.filter(p => p.id !== id);
    saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
    productsCache = null;
    return true;
}
