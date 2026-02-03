// Cart page logic
import { getCart, updateQuantity, removeFromCart, clearCart } from '../services/cart.js';
import { showSuccess, showError } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';
import { updateCartBadge } from '../components/header.js';

export function initCartPage() {
    renderCart();
    setupCartHandlers();
}

function renderCart() {
    const container = document.getElementById('cart-container');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.items.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary mt-2">Shop Now</a>
            </div>
        `;
        if (summaryContainer) summaryContainer.innerHTML = '';
        return;
    }
    
    container.innerHTML = renderCartItems(cart.items);
    if (summaryContainer) {
        summaryContainer.innerHTML = renderCartSummary(cart);
    }
}

function renderCartItems(items) {
    return items.map(item => `
        <div class="cart-item" data-id="${item.product.id}">
            <img src="${item.product.image || 'assets/images/products/placeholder.png'}" 
                 alt="${item.product.name}" 
                 class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.product.name}</h3>
                <p>${CONFIG.CURRENCY}${item.product.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="btn-quantity" data-action="decrease" data-id="${item.product.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" class="quantity-input" 
                       data-id="${item.product.id}">
                <button class="btn-quantity" data-action="increase" data-id="${item.product.id}">+</button>
            </div>
            <div class="cart-item-total">
                ${CONFIG.CURRENCY}${(item.product.price * item.quantity).toFixed(2)}
            </div>
            <button class="btn btn-danger remove-item" data-id="${item.product.id}">Remove</button>
        </div>
    `).join('');
}

function renderCartSummary(cart) {
    const subtotal = cart.total;
    const shipping = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
    const tax = subtotal * CONFIG.TAX_RATE;
    const total = subtotal + shipping + tax;
    
    return `
        <h3>Order Summary</h3>
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
        <a href="checkout.html" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            Proceed to Checkout
        </a>
    `;
}

function setupCartHandlers() {
    const container = document.getElementById('cart-container');
    if (!container) return;
    
    container.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Remove item
        if (target.classList.contains('remove-item')) {
            const productId = parseInt(target.dataset.id);
            const confirmed = await confirmModal('Remove Item', 'Are you sure you want to remove this item?');
            if (confirmed) {
                removeFromCart(productId);
                showSuccess('Item removed from cart');
                renderCart();
                updateCartBadge();
            }
        }
        
        // Increase/decrease quantity
        if (target.classList.contains('btn-quantity')) {
            const productId = parseInt(target.dataset.id);
            const action = target.dataset.action;
            const cart = getCart();
            const item = cart.items.find(i => i.product.id === productId);
            
            if (item) {
                const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
                if (newQuantity > 0) {
                    updateQuantity(productId, newQuantity);
                    renderCart();
                    updateCartBadge();
                }
            }
        }
    });
}
