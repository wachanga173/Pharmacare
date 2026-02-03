// Authentication service - manages user authentication
import { getFromStorage, saveToStorage } from '../utils/storage.js';

export function login(email, password) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Don't store password in session
        const userSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        return { success: true, user: userSession };
    }
    
    return { success: false, error: 'Invalid email or password' };
}

export function register(userData) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userData,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(CONFIG.STORAGE_KEYS.USER + 's', users);
    
    // Auto login
    const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: false
    };
    saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
    
    return { success: true, user: userSession };
}

export function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
}

export function isLoggedIn() {
    const user = getFromStorage(CONFIG.STORAGE_KEYS.USER);
    return !!user;
}

export function getCurrentUser() {
    return getFromStorage(CONFIG.STORAGE_KEYS.USER);
}

export function updateUserProfile(updates) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        saveToStorage(CONFIG.STORAGE_KEYS.USER + 's', users);
        
        // Update session
        const updatedSession = {
            id: users[userIndex].id,
            email: users[userIndex].email,
            name: users[userIndex].name,
            isAdmin: users[userIndex].isAdmin
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, updatedSession);
        
        return { success: true, user: updatedSession };
    }
    
    return { success: false, error: 'User not found' };
}
