// Header component
import { getCartItemCount } from '../services/cart.js';
import { isLoggedIn, getCurrentUser, logout } from '../services/auth.js';

export function initHeader() {
    const headerElement = document.getElementById('header');
    if (!headerElement) return;
    
    headerElement.innerHTML = renderHeader();
    attachHeaderEventListeners();
    updateCartBadge();
}

function renderHeader() {
    const cartCount = getCartItemCount();
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();
    
    return `
        <nav class="header">
            <div class="container">
                <div class="header-nav">
                    <a href="index.html" class="logo">${CONFIG.APP_NAME}</a>
                    
                    <ul class="nav-links">
                        <li><a href="index.html" class="nav-link">Home</a></li>
                        <li><a href="pages/products.html" class="nav-link">Products</a></li>
                        <li><a href="pages/about.html" class="nav-link">About Us</a></li>
                        ${loggedIn ? `
                            <li><a href="pages/profile.html" class="nav-link">Profile</a></li>
                            ${user?.isAdmin ? '<li><a href="pages/admin.html" class="nav-link">Admin</a></li>' : ''}
                            <li><a href="#" class="nav-link" id="logout-btn">Logout</a></li>
                        ` : `
                            <li><a href="pages/login.html" class="nav-link">Login</a></li>
                            <li><a href="pages/register.html" class="nav-link">Register</a></li>
                        `}
                        <li>
                            <a href="pages/cart.html" class="nav-link cart-icon">
                                Cart
                                ${cartCount > 0 ? `<span class="cart-badge" id="cart-badge">${cartCount}</span>` : ''}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

function attachHeaderEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            window.location.reload();
        });
    }
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const cartCount = getCartItemCount();
    
    if (badge) {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}
