// Products page logic
import {
  getProducts,
  searchProducts,
  filterByCategory,
} from "../services/products.js";
import { renderProductGrid } from "../components/productCard.js";
import { addToCart } from "../services/cart.js";
import { showSuccess } from "../components/toast.js";
import { updateCartBadge } from "../components/header.js";

let allProducts = [];
let filteredProducts = [];

export async function initProductsPage() {
  try {
    await loadProducts();
    setupFilters();
    setupSearch();
  } catch (error) {
    console.error("Error initializing products page:", error);
  }
}

async function loadProducts() {
  const container = document.getElementById("products-container");
  if (!container) return;

  try {
    allProducts = await getProducts();
    filteredProducts = [...allProducts];
    renderProductGrid(filteredProducts, container);
  } catch (error) {
    console.error("Error loading products:", error);
    container.innerHTML =
      '<p class="text-center">Error loading products. Please try again later.</p>';
  }
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      const category = e.target.value;
      if (category === "all") {
        filteredProducts = [...allProducts];
      } else {
        filteredProducts = filterByCategory(allProducts, category);
      }
      renderProducts();
    });
  }
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      filteredProducts = searchProducts(allProducts, query);
      renderProducts();
    });
  }
}

function renderProducts() {
  const container = document.getElementById("products-container");
  renderProductGrid(filteredProducts, container);
  setupAddToCartHandlers();
}

// Attach event delegation for add-to-cart buttons after rendering
function setupAddToCartHandlers() {
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (btn) {
      const productId = btn.getAttribute("data-id");
      if (!productId) return;
      const success = await addToCart(productId, 1);
      if (success) {
        showSuccess("Product added to cart!");
        updateCartBadge();
      } else {
        showSuccess("Could not add product.");
      }
    }
  });
}
