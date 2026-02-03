// Cart service - manages shopping cart operations
import { getFromStorage, saveToStorage } from '../utils/storage.js';

export function getCart() {
    const cart = getFromStorage(CONFIG.STORAGE_KEYS.CART);
    if (!cart) {
        return { items: [], total: 0 };
    }
    return cart;
}

export function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const products = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('Product not found');
        return false;
    }
    
    const existingItem = cart.items.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product,
            quantity
        });
    }
    
    updateCartTotal(cart);
    saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
    return true;
}

export function removeFromCart(productId) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.product.id !== productId);
    updateCartTotal(cart);
    saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
}

export function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.items.find(item => item.product.id === productId);
    
    if (item) {
        item.quantity = quantity;
        updateCartTotal(cart);
        saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
    }
}

export function clearCart() {
    saveToStorage(CONFIG.STORAGE_KEYS.CART, { items: [], total: 0 });
}

export function getCartItemCount() {
    const cart = getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
}

function updateCartTotal(cart) {
    cart.total = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0);
}
