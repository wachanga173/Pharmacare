/**
 * Role-Based Access Control (RBAC) Helper
 * 
 * Use these functions to show/hide UI elements based on user role
 */

import { getCurrentUser } from './services/auth.js';

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
    const user = await getCurrentUser();
    return user?.isAdmin || false;
}

/**
 * Check if current user has a specific role
 * @param {string} role - 'admin' or 'customer'
 * @returns {Promise<boolean>}
 */
export async function hasRole(role) {
    const user = await getCurrentUser();
    return user?.role === role;
}

/**
 * Redirect non-admin users to home page
 * Call this on admin-only pages
 */
export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        window.location.href = '../index.html';
    }
}

/**
 * Show/hide element based on user role
 * @param {string} selector - CSS selector
 * @param {string[]} allowedRoles - Array of allowed roles
 */
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

/**
 * Initialize role-based UI
 * Call this on page load
 * 
 * Usage:
 * Add data-role="admin" or data-role="customer" to HTML elements
 * 
 * Example:
 * <button data-role="admin">Admin Dashboard</button>
 * <div data-role="customer">Customer Content</div>
 */
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

/**
 * Example: Protect admin page
 * 
 * Add this to the top of admin.js:
 * 
 * ```javascript
 * import { requireAdmin } from '../utils/rbac.js';
 * 
 * // Redirect non-admins
 * await requireAdmin();
 * ```
 */

/**
 * Example: Show admin menu item only for admins
 * 
 * In your HTML:
 * ```html
 * <nav>
 *   <a href="index.html">Home</a>
 *   <a href="products.html">Products</a>
 *   <a href="admin.html" data-admin-only>Admin Panel</a>
 * </nav>
 * ```
 * 
 * In your JavaScript:
 * ```javascript
 * import { initRoleBasedUI } from './utils/rbac.js';
 * 
 * document.addEventListener('DOMContentLoaded', async () => {
 *   await initRoleBasedUI();
 * });
 * ```
 */

/**
 * Example: Different content for different roles
 * 
 * In your HTML:
 * ```html
 * <div data-role="customer">
 *   <h2>Customer Dashboard</h2>
 *   <p>View your orders and profile</p>
 * </div>
 * 
 * <div data-role="admin">
 *   <h2>Admin Dashboard</h2>
 *   <p>Manage users, products, and orders</p>
 * </div>
 * ```
 */

/**
 * Example: Fetch users (admin only)
 * 
 * ```javascript
 * import { isAdmin } from './utils/rbac.js';
 * 
 * async function loadUsers() {
 *   if (!(await isAdmin())) {
 *     console.error('Admin access required');
 *     return;
 *   }
 *   
 *   const supabase = getSupabaseClient();
 *   const { data: users } = await supabase
 *     .from('users')
 *     .select('*');
 *   
 *   console.log('Users:', users);
 * }
 * ```
 */

/**
 * Example: Change user role (admin only)
 * 
 * ```javascript
 * import { isAdmin } from './utils/rbac.js';
 * 
 * async function changeUserRole(userId, newRole) {
 *   if (!(await isAdmin())) {
 *     throw new Error('Admin access required');
 *   }
 *   
 *   const supabase = getSupabaseClient();
 *   const { error } = await supabase
 *     .from('users')
 *     .update({ role: newRole })
 *     .eq('id', userId);
 *   
 *   if (error) throw error;
 *   
 *   return { success: true };
 * }
 * ```
 */
