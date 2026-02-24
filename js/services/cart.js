// Cart service - manages shopping cart operations
import { getFromStorage, saveToStorage } from "../utils/storage.js";
import { getProducts, getProductById } from "./products.js";

// Get cart with full product data from database
export async function getCart() {
  const cart = getFromStorage(CONFIG.STORAGE_KEYS.CART);
  if (!cart || !cart.items || cart.items.length === 0) {
    return { items: [], total: 0 };
  }

  // Fetch current product data from database
  const products = await getProducts();
  const itemsWithCurrentData = [];

  for (const item of cart.items) {
    // Ensure productId is always a number for comparison
    let productId = item.productId || item.product?.id;
    if (typeof productId === "string" && !isNaN(productId)) {
      productId = parseInt(productId);
    }
    const currentProduct = products.find(
      (p) => p.id == productId || p.id === String(productId),
    );

    if (currentProduct) {
      itemsWithCurrentData.push({
        productId: currentProduct.id,
        product: currentProduct,
        quantity: item.quantity,
      });
    }
  }

  const cartWithUpdatedData = {
    items: itemsWithCurrentData,
    total: 0,
  };

  updateCartTotal(cartWithUpdatedData);
  return cartWithUpdatedData;
}

// Get cart items without fetching from database (for synchronous operations)
export function getCartRaw() {
  const cart = getFromStorage(CONFIG.STORAGE_KEYS.CART);
  if (!cart) {
    return { items: [], total: 0 };
  }
  return cart;
}

export async function addToCart(productId, quantity = 1) {
  const cart = getCartRaw();
  const product = await getProductById(productId);

  if (!product) {
    console.error("Product not found");
    return false;
  }

  // Store product details locally for offline access
  let localProducts = getFromStorage(CONFIG.STORAGE_KEYS.PRODUCTS) || [];
  const existsLocally = localProducts.some((p) => p.id == product.id);
  if (!existsLocally) {
    localProducts.push(product);
    saveToStorage(CONFIG.STORAGE_KEYS.PRODUCTS, localProducts);
  }

  const normalizedId = String(productId);
  const existingItem = cart.items.find(
    (item) => String(item.productId) === normalizedId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.productId = normalizedId;
    existingItem.product = product;
  } else {
    cart.items.push({
      productId: normalizedId,
      product,
      quantity,
    });
  }

  saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
  return true;
}

export function removeFromCart(productId) {
  const cart = getCartRaw();
  const normalizedId = String(productId);
  cart.items = cart.items.filter(
    (item) => String(item.productId) !== normalizedId,
  );
  saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
}

export function updateQuantity(productId, quantity) {
  const cart = getCartRaw();
  const item = cart.items.find((item) => {
    const itemProductId = item.productId || item.product?.id;
    return itemProductId == productId;
  });

  if (item) {
    item.quantity = quantity;
    // Ensure productId is stored
    item.productId = productId;
    // Remove old product object if it exists
    delete item.product;
    saveToStorage(CONFIG.STORAGE_KEYS.CART, cart);
  }
}

export function clearCart() {
  saveToStorage(CONFIG.STORAGE_KEYS.CART, { items: [], total: 0 });
}

export async function getCartItemCount() {
  const cart = getCartRaw();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

function updateCartTotal(cart) {
  cart.total = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);
}
