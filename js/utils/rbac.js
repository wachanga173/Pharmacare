// Role-based access control helper functions

import { getCurrentUser } from './services/auth.js';

// Check if current user is an admin
export async function isAdmin() {
    const user = await getCurrentUser();
    return user?.isAdmin || false;
}

// Check if current user has a specific role
export async function hasRole(role) {
    const user = await getCurrentUser();
    return user?.role === role;
}

// Redirect non-admin users to home page
export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        window.location.href = '../index.html';
    }
}

// Show/hide element based on user role
export async function showForRoles(selector, allowedRoles) {
    const user = await getCurrentUser();
    const element = document.querySelector(selector);
    
    if (element) {
        if (user && allowedRoles.includes(user.role)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    }
}

// Initialize role-based UI - add data-role="admin" or data-role="customer" to HTML elements
export async function initRoleBasedUI() {
    const user = await getCurrentUser();
    
    if (!user) {
        // Hide all role-restricted elements
        document.querySelectorAll('[data-role]').forEach(el => {
            el.style.display = 'none';
        });
        return;
    }
    
    // Show elements matching user's role
    document.querySelectorAll('[data-role]').forEach(el => {
        const requiredRole = el.getAttribute('data-role');
        
        if (requiredRole === user.role || (requiredRole === 'admin' && user.isAdmin)) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
    
    // Handle elements that need admin access
    document.querySelectorAll('[data-admin-only]').forEach(el => {
        if (user.isAdmin) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}
