// Cart page logic
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../services/cart.js";
import { showSuccess, showError } from "../components/toast.js";
import { confirmModal } from "../components/modal.js";
import { updateCartBadge } from "../components/header.js";
import { sanitizeHTML } from "../utils/helpers.js";

export function initCartPage() {
  renderCart();
  setupCartHandlers();
}

async function renderCart() {
  const container = document.getElementById("cart-container");
  const summaryContainer = document.getElementById("cart-summary");

  if (!container) return;

  const cart = await getCart();

  // Always clear container before rendering
  container.innerHTML = "";
  if (cart.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <img src="../assets/images/cart-empty.svg" alt="Empty Cart" class="cart-empty-img" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet</p>
        <button class="shop-now-btn" onclick="window.location.href='products.html'">Shop Now</button>
      </div>
    `;
    if (summaryContainer) summaryContainer.innerHTML = "";
    return;
  }

  container.innerHTML = renderCartItems(cart.items);
  if (summaryContainer) {
    summaryContainer.innerHTML = renderCartSummary(cart);
  }
}

function renderCartItems(items) {
  return items
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.productId}">
        <img src="${sanitizeHTML(item.product.image || "assets/images/products/placeholder.png")}" 
           alt="${sanitizeHTML(item.product.name)}" 
           class="cart-item-image">
        <div class="cart-item-details">
          <h3>${sanitizeHTML(item.product.name)}</h3>
          <p>${CONFIG.CURRENCY}${item.product.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="btn-quantity" data-action="decrease" data-id="${item.productId}">-</button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input" 
               data-id="${item.productId}">
          <button class="btn-quantity" data-action="increase" data-id="${item.productId}">+</button>
        </div>
        <div class="cart-item-total">
          ${CONFIG.CURRENCY}${(item.product.price * item.quantity).toFixed(2)}
        </div>
        <button class="btn btn-danger remove-item" data-id="${item.productId}">Remove</button>
      </div>
    `,
    )
    .join("");
}

function renderCartSummary(cart) {
  const subtotal = cart.total;
  const shipping =
    subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
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
            <span>${shipping === 0 ? "FREE" : CONFIG.CURRENCY + shipping.toFixed(2)}</span>
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
  const container = document.getElementById("cart-container");
  if (!container) return;

  container.addEventListener("click", async (e) => {
    const target = e.target;

    // Remove item
    if (target.classList.contains("remove-item")) {
      const productId = target.dataset.id; // Use as string
      const confirmed = await confirmModal(
        "Remove Item",
        "Are you sure you want to remove this item?",
      );
      if (confirmed) {
        removeFromCart(productId);
        showSuccess("Item removed from cart");
        await renderCart(); // Refresh cart UI
        updateCartBadge();
      }
    }

    // Increase/decrease quantity
    if (target.classList.contains("btn-quantity")) {
      const productId = target.dataset.id; // Use as string
      const action = target.dataset.action;
      const cart = await getCart();
      const item = cart.items.find(
        (i) => String(i.productId) === String(productId),
      );

      if (item) {
        const newQuantity =
          action === "increase" ? item.quantity + 1 : item.quantity - 1;
        if (newQuantity > 0) {
          updateQuantity(productId, newQuantity);
          await renderCart();
          updateCartBadge();
        }
      }
    }
  });
}
