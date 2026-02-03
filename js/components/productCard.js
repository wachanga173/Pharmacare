// Product card component
import { addToCart } from '../services/cart.js';
import { showSuccess } from './toast.js';
import { updateCartBadge } from './header.js';

export function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    card.innerHTML = `
        <img src="${product.image || 'assets/images/products/placeholder.png'}" 
             alt="${product.name}" 
             class="product-image"
             onerror="this.src='assets/images/products/placeholder.png'">
        <div class="product-body">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description || ''}</p>
            <p class="product-price">${CONFIG.CURRENCY}${product.price.toFixed(2)}</p>
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
        addToCartBtn.addEventListener('click', () => {
            addToCart(product.id);
            showSuccess(`${product.name} added to cart!`);
            updateCartBadge();
        });
    }
    
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => {
            window.location.href = `pages/product-detail.html?id=${product.id}`;
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
