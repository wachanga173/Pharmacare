// Utility: Force-populate localStorage with products from products.json if empty
export async function ensureLocalProductsPopulated() {
  let localProducts = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS);
  if (!localProducts || localProducts.length === 0) {
    try {
      const response = await fetch("../data/products.json");
      if (response.ok) {
        const products = await response.json();
        saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
        return products;
      }
    } catch (e) {
      console.error("Failed to load products.json:", e);
    }
  }
  return getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
}
// Products service - manages product data
import { getFromStorage, saveToStorage } from "../utils/storage.js";

let productsCache = null;
let supabase = null;

// Initialize Supabase client
function getSupabaseClient() {
  if (!supabase) {
    console.log("Checking Supabase dependencies:");
    console.log("- window.supabase:", typeof window.supabase);
    console.log("- window.CONFIG:", typeof window.CONFIG);
    console.log("- window.CONFIG.SUPABASE:", window.CONFIG?.SUPABASE);

    if (
      typeof window !== "undefined" &&
      window.supabase &&
      window.CONFIG &&
      window.CONFIG.SUPABASE.URL &&
      window.CONFIG.SUPABASE.ANON_KEY
    ) {
      console.log("Initializing Supabase client...");
      supabase = window.supabase.createClient(
        window.CONFIG.SUPABASE.URL,
        window.CONFIG.SUPABASE.ANON_KEY,
        {
          auth: {
            redirectTo:
              window.CONFIG.SITE_URL ||
              "https://wachanga173.github.io/Pharmacare",
          },
        },
      );
      console.log("Supabase client initialized successfully");
    }
  }
  return supabase;
}

export async function getProducts(forceReload = false) {
  if (productsCache && !forceReload) {
    return productsCache;
  }

  // If Supabase is configured, fetch from there
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      productsCache = data || [];
      // Also update localStorage for offline use
      if (productsCache.length > 0) {
        saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, productsCache);
      }
      return productsCache;
    } catch (error) {
      console.error("Error loading products from Supabase:", error);
    }
  }
  // Always fallback to localStorage
  const storedProducts = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS);
  if (storedProducts && storedProducts.length > 0) {
    productsCache = storedProducts;
    return productsCache;
  }
  return [];
}

export async function getProductById(id) {
  const products = await getProducts();
  // Handle both string UUIDs and integer IDs
  return products.find((p) => p.id == id || p.id === parseInt(id));
}

export function searchProducts(products, query) {
  if (!query || query.trim() === "") {
    return products;
  }

  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category?.toLowerCase().includes(lowerQuery),
  );
}

export function filterByCategory(products, category) {
  if (!category || category === "all") {
    return products;
  }

  return products.filter(
    (product) => product.category?.toLowerCase() === category.toLowerCase(),
  );
}

export async function addProduct(product) {
  // If Supabase is configured, add to Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) throw error;

      productsCache = null; // Clear cache
      return data;
    } catch (error) {
      console.error("Error adding product to Supabase:", error);
      throw error;
    }
  }

  // Fallback to localStorage
  const products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
  product.id = Math.max(...products.map((p) => p.id), 0) + 1;
  products.push(product);
  saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
  productsCache = null;
  return product;
}

export async function updateProduct(id, updates) {
  console.log('[UPDATE] Starting update for ID:', id, 'Updates:', updates);
  
  // If Supabase is configured, update in Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Error updating product in Supabase:", error);
      } else if (data) {
        productsCache = null; // Clear cache
        console.log('[UPDATE] Updated in Supabase, cleared cache');
        return data;
      } else {
        console.log("No product updated in Supabase, falling back to localStorage");
      }
    } catch (error) {
      console.error("Error updating product in Supabase:", error);
      // Fall back to localStorage if Supabase fails
    }
  }

  // Fallback to localStorage
  const products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
  console.log('[UPDATE] Loaded', products.length, 'products from localStorage');
  console.log('[UPDATE] Looking for product with ID:', id, 'Type:', typeof id);
  
  // Handle both string and integer IDs
  const index = products.findIndex((p) => {
    return p.id == id || p.id === parseInt(id) || String(p.id) === String(id);
  });

  if (index !== -1) {
    console.log('[UPDATE] Found product at index', index);
    console.log('[UPDATE] Before update:', JSON.parse(JSON.stringify(products[index])));
    products[index] = { ...products[index], ...updates };
    console.log('[UPDATE] After update:', JSON.parse(JSON.stringify(products[index])));
    saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
    productsCache = null;
    console.log('[UPDATE] Saved to localStorage and cleared cache');
    return products[index];
  }

  console.error('[UPDATE] Product not found with ID:', id);
  return null;
}

export async function deleteProduct(id) {
  // If Supabase is configured, delete from Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("products").delete().eq("id", id);

      if (error) throw error;

      productsCache = null; // Clear cache
      return true;
    } catch (error) {
      console.error("Error deleting product from Supabase:", error);
      throw error;
    }
  }

  // Fallback to localStorage
  let products = getFromStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS) || [];
  products = products.filter((p) => p.id !== id);
  saveToStorage(window.CONFIG.STORAGE_KEYS.PRODUCTS, products);
  productsCache = null;
  return true;
}
