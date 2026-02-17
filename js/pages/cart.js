// Cart page logic
import { getCart, updateQuantity, removeFromCart, clearCart } from '../services/cart.js';
import { showSuccess, showError } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';
import { updateCartBadge } from '../components/header.js';


export function initCartPage() {
    renderCart();
    setupCartHandlers();
}

// Placeholder for medication interaction check
function checkMedicationInteractions(items) {
    // Example: Warn if both product ID 101 and 202 are in cart
    const ids = items.map(item => String(item.product.id));
    if (ids.includes('101') && ids.includes('202')) {
        showError('Warning: Medication interaction detected between products 101 and 202.');
        return true;
    }
    return false;
}

function renderCart() {
    const container = document.getElementById('cart-container');
    const summaryContainer = document.getElementById('cart-summary');
    if (!container) return;
    const cart = getCart();

    // Empty state
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

    // Prescription logic
    const requiresPrescription = cart.items.some(item => item.product.requiresPrescription);
    let prescriptionBanner = '';
    let prescriptionUploaded = window.__prescriptionUploaded || false;
    if (requiresPrescription) {
        prescriptionBanner = `
            <div class="alert alert-warning d-flex align-items-center" role="alert">
                <span class="me-2 bi bi-exclamation-triangle-fill"></span>
                <span>Some items require a valid prescription to purchase.</span>
                <button id="upload-prescription-btn" class="btn btn-sm btn-warning ms-3">Upload Prescription</button>
                <input type="file" id="prescription-file" accept=".jpg,.jpeg,.png,.pdf" style="display:none;" />
                <span id="prescription-status" class="ms-2">${prescriptionUploaded ? 'Prescription uploaded.' : ''}</span>
            </div>
        `;
    }

    // Medication interaction check
    checkMedicationInteractions(cart.items);

    container.innerHTML = `
        ${prescriptionBanner}
        ${renderCartItems(cart.items)}
    `;
    if (summaryContainer) {
        summaryContainer.innerHTML = renderCartSummary(cart, requiresPrescription, prescriptionUploaded);
    }

    // Setup prescription upload logic
    if (requiresPrescription) {
        const uploadBtn = document.getElementById('upload-prescription-btn');
        const fileInput = document.getElementById('prescription-file');
        const statusSpan = document.getElementById('prescription-status');
        if (uploadBtn && fileInput) {
            uploadBtn.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    window.__prescriptionUploaded = true;
                    if (statusSpan) statusSpan.textContent = 'Prescription uploaded.';
                    renderCart(); // re-render to enable checkout
                }
            };
        }
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

function renderCartSummary(cart, requiresPrescription = false, prescriptionUploaded = false) {
    const subtotal = cart.total;
    const vat = subtotal * 0.15;
    const grandTotal = subtotal + vat;
    // If you want to keep shipping/tax logic, add it here
    let checkoutDisabled = requiresPrescription && !prescriptionUploaded;
    return `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${CONFIG.CURRENCY}${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>VAT (15%):</span>
            <span>${CONFIG.CURRENCY}${vat.toFixed(2)}</span>
        </div>
        <hr>
        <div class="summary-row summary-total">
            <span>Grand Total:</span>
            <span>${CONFIG.CURRENCY}${grandTotal.toFixed(2)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary${checkoutDisabled ? ' disabled' : ''}" style="width: 100%; margin-top: 1rem;" id="checkout-btn">
            Proceed to Checkout
        </a>
        ${checkoutDisabled ? '<div class="text-danger mt-2">Upload a prescription to enable checkout.</div>' : ''}
    `;
}

function setupCartHandlers() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    // Delegate click events
    container.addEventListener('click', async (e) => {
        const target = e.target;

        // Remove item
        if (target.classList.contains('remove-item')) {
            const productId = parseInt(target.dataset.id);
            const confirmed = await confirmModal('Remove Item', 'Are you sure you want to remove this item?');
            if (confirmed) {
                removeFromCart(productId);
                showSuccess('"Item removed from cart");
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

    // Delegate quantity input changes
    container.addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-input')) {
            const productId = parseInt(target.dataset.id);
            let value = parseInt(target.value);
            if (isNaN(value) || value < 1) value = 1;
            updateQuantity(productId, value);
            renderCart();
            updateCartBadge();
        }
    });
}
