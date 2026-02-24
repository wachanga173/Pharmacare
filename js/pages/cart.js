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

import { ensureLocalProductsPopulated } from "../services/products.js";

export function initCartPage() {
  renderCart();
  setupCartHandlers();
}

export async function renderCart() {
  const cartContainer = document.getElementById("cart-container");
  const totalPriceElem = document.getElementById("cart-total");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  // Force-populate local products from products.json if needed
  await ensureLocalProductsPopulated();
  const cart = await getCart();
  console.log("Cart contents:", cart.items);

  if (!cart.items.length) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    if (totalPriceElem) totalPriceElem.textContent = "";
    return;
  }

  // Build table
  const table = document.createElement("table");
  table.className = "cart-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>Quantity</th>
        <th>Subtotal</th>
        <th>Remove</th>
      </tr>
    </thead>
    <tbody>
      ${cart.items
        .map(
          (item) => `
        <tr>
          <td><img src="${item.product.image}" alt="${item.product.name}" class="cart-img" /></td>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>$${(item.product.price * item.quantity).toFixed(2)}</td>
          <td>
            <button class="remove-btn" data-id="${item.productId}">Remove</button>
          </td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  `;
  cartContainer.appendChild(table);

  // Display total price
  if (totalPriceElem)
    totalPriceElem.textContent = `Total: $${cart.total.toFixed(2)}`;

  // Bind remove buttons
  cartContainer.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      removeFromCart(id);
      renderCart();
    });
  });
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

document.addEventListener("DOMContentLoaded", renderCart);
