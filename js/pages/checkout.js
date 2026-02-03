// Checkout page logic
import { getCart } from '../services/cart.js';
import { isLoggedIn } from '../services/auth.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateCheckoutForm } from '../utils/validation.js';

export function initCheckoutPage() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }
    
    const cart = getCart();
    if (cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    renderOrderSummary();
    setupCheckoutForm();
}

function renderOrderSummary() {
    const container = document.getElementById('order-summary');
    if (!container) return;
    
    const cart = getCart();
    const subtotal = cart.total;
    const shipping = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
    const tax = subtotal * CONFIG.TAX_RATE;
    const total = subtotal + shipping + tax;
    
    container.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.items.map(item => `
            <div class="summary-item">
                <span>${item.product.name} x ${item.quantity}</span>
                <span>${CONFIG.CURRENCY}${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${CONFIG.CURRENCY}${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'FREE' : CONFIG.CURRENCY + shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax:</span>
            <span>${CONFIG.CURRENCY}${tax.toFixed(2)}</span>
        </div>
        <hr>
        <div class="summary-row summary-total">
            <span>Total:</span>
            <span>${CONFIG.CURRENCY}${total.toFixed(2)}</span>
        </div>
    `;
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const validation = validateCheckoutForm(data);
        if (!validation.isValid) {
            showError(validation.errors.join(', '));
            return;
        }
        
        // Process order
        try {
            await processOrder(data);
            showSuccess('Order placed successfully!');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
        } catch (error) {
            showError('Error processing order. Please try again.');
            console.error('Checkout error:', error);
        }
    });
}

async function processOrder(orderData) {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, this would send data to a server
            console.log('Processing order:', orderData);
            resolve();
        }, 1000);
    });
}
