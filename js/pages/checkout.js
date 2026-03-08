// Checkout page logic
import { getCart, clearCart } from "../services/cart.js";
import { isLoggedIn, getCurrentUser } from "../services/auth.js";
import { showSuccess, showError } from "../components/toast.js";
import { validateCheckoutForm } from "../utils/validation.js";
import { sanitizeHTML } from "../utils/helpers.js";

export async function initCheckoutPage() {
  // Check if user is logged in
  if (!(await isLoggedIn())) {
    window.location.href = "login.html?redirect=checkout.html";
    return;
  }

  const cart = await getCart();
  if (cart.items.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  await renderOrderSummary();
  setupCheckoutForm();
  setupPaymentMethodSwitcher();
  function setupPaymentMethodSwitcher() {
    const form = document.getElementById("checkout-form");
    if (!form) return;
    const paymentSelect = form.querySelector('select[name="paymentMethod"]');
    const mpesaFields = form.querySelector(".mpesa-fields");
    const cardFields = form.querySelector(".card-fields");
    if (!paymentSelect || !mpesaFields || !cardFields) return;
    function updateFields() {
      if (paymentSelect.value === "mpesa") {
        mpesaFields.style.display = "";
        cardFields.style.display = "none";
      } else if (paymentSelect.value === "card") {
        mpesaFields.style.display = "none";
        cardFields.style.display = "";
      } else {
        mpesaFields.style.display = "none";
        cardFields.style.display = "none";
      }
    }
    paymentSelect.addEventListener("change", updateFields);
    updateFields();
  }
}

async function renderOrderSummary() {
  const container = document.getElementById("order-summary");
  if (!container) return;

  const cart = await getCart();
  const subtotal = cart.total;
  const shipping =
    subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
  const tax = subtotal * CONFIG.TAX_RATE;
  const total = subtotal + shipping + tax;

  container.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.items
          .map(
            (item) => `
            <div class="summary-item">
                <span>${sanitizeHTML(item.product.name)} x ${item.quantity}</span>
                <span>${CONFIG.CURRENCY}${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
        `,
          )
          .join("")}
        <hr>
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
    `;
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const validation = validateCheckoutForm(data);
    if (!validation.isValid) {
      showError(validation.errors.join(", "));
      return;
    }

    // If M-Pesa, simulate USSD password prompt
    if (data.paymentMethod === "mpesa") {
      const password = prompt(
        "M-Pesa Payment: Enter your M-Pesa PIN to complete the payment (simulated USSD prompt)",
      );
      if (!password || password.trim().length < 4) {
        showError("Payment cancelled or invalid PIN.");
        return;
      }
    }

    // Process order
    try {
      await processOrder(data);
      showSuccess("Order placed successfully!");
      // Clear cart after successful order
      clearCart();
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 2000);
    } catch (error) {
      showError("Error processing order. Please try again.");
      console.error("Checkout error:", error);
    }
  });
}

async function processOrder(orderData) {
  // Get current user
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get cart data
  const cart = await getCart();
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate order totals
  const subtotal = cart.total;
  const shipping =
    subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
  const tax = subtotal * CONFIG.TAX_RATE;
  const total = subtotal + shipping + tax;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Prepare order items
  const orderItems = cart.items.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_price: item.product.price,
    quantity: item.quantity,
  }));

  // Prepare order data for database
  const order = {
    user_id: user.id,
    order_number: orderNumber,
    status: "pending",
    items: orderItems,
    subtotal: subtotal,
    shipping_cost: shipping,
    tax: tax,
    total: total,
    shipping_info: {
      name: orderData.fullName,
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      zipCode: orderData.zipCode,
      phone: orderData.phone,
    },
    payment_method: orderData.paymentMethod,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Get Supabase client
  const supabase = window.supabase?.createClient(
    window.CONFIG.SUPABASE.URL,
    window.CONFIG.SUPABASE.ANON_KEY,
    {
      auth: {
        redirectTo:
          window.CONFIG.SITE_URL ||
          "https://wachanga173.github.io/Pharmacare",
      },
    }
  );

  if (!supabase) {
    // Fallback: Log to console if Supabase is not available
    console.log("Processing order (no database):", order);
    return;
  }

  // Save order to Supabase
  const { data, error } = await supabase.from("orders").insert(order).select();

  if (error) {
    console.error("Error saving order to database:", error);
    throw new Error("Failed to save order: " + error.message);
  }

  console.log("Order saved successfully:", data);
  return data;
}
