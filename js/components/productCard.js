// Product card component
import { addToCart } from '../services/cart.js';
import { showSuccess } from './toast.js';
import { updateCartBadge } from './header.js';
import { sanitizeHTML } from '../utils/helpers.js';

export function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    // Detect if we're in the pages folder for correct relative paths
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/');
    const imageFallback = isInPagesFolder 
        ? '../assets/images/products/placeholder.png'
        : 'assets/images/products/placeholder.png';
    
    card.innerHTML = `
        <img src="${sanitizeHTML(product.image_url || product.image || imageFallback)}" 
             alt="${sanitizeHTML(product.name)}" 
             class="product-image"
             onerror="this.src='${imageFallback}'">
        <div class="product-body">
            <h3 class="product-title">${sanitizeHTML(product.name)}</h3>
            <p class="product-description">${sanitizeHTML(product.description || '')}</p>
            <p class="product-price">${window.CONFIG.CURRENCY}${product.price.toFixed(2)}</p>
            ${product.stock > 0 ? `
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary view-details-btn" data-id="${product.id}">
                        Details
                    </button>
                </div>
            ` : '<p class="text-danger">Out of Stock</p>'}
        </div>
    `;
    
    // Event listeners
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            await addToCart(product.id);
            showSuccess(`${product.name} added to cart!`);
            await updateCartBadge();
        });
    }
    
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => {
            // Detect if we're already in the pages folder
            const currentPath = window.location.pathname;
            const isInPagesFolder = currentPath.includes('/pages/');
            const detailPath = isInPagesFolder 
                ? `product-detail.html?id=${product.id}`
                : `pages/product-detail.html?id=${product.id}`;
            window.location.href = detailPath;
        });
    }
    
    return card;
}

export function renderProductGrid(products, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-4';
    
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
    
    container.appendChild(grid);
}
