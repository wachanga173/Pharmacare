// Home page logic
import { getProducts } from '../services/products.js';
import { renderProductGrid } from '../components/productCard.js';

export async function initHomePage() {
    try {
        await loadFeaturedProducts();
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;
    
    try {
        const products = await getProducts();
        // Show first 8 products as featured
        const featured = products.slice(0, 8);
        renderProductGrid(featured, container);
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<p class="text-center">Error loading products. Please try again later.</p>';
    }
}
