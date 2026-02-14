// Home page logic - Modern Dynamic Product Carousel
import { getProducts } from '../services/products.js';
import { addToCart } from '../services/cart.js';
import { showToast } from '../components/toast.js';

// Carousel State Management
const carouselState = {
    allProducts: [],
    availableProducts: [],
    currentProducts: [],
    productsPerView: 2,
    autoPlayInterval: null,
    autoPlayEnabled: true,
    timerInterval: null,
    timerProgress: 0,
    isTransitioning: false
};

export async function initHomePage() {
    try {
        // Load all products from database
        await loadAllProducts();
        
        // Initialize carousel
        initCarousel();
        
        // Setup navigation
        setupCarouselNavigation();
        
        // Setup auto-play
        startAutoPlay();
        
        // Adjust products per view based on screen size
        handleResponsiveView();
        window.addEventListener('resize', handleResponsiveView);
        
    } catch (error) {
        console.error('Error initializing home page:', error);
        showToast('Unable to load products. Please refresh the page.', 'error');
    }
}

async function loadAllProducts() {
    try {
        const products = await getProducts();
        carouselState.allProducts = products || [];
        carouselState.availableProducts = [...(products || [])];
        
        if (carouselState.allProducts.length === 0) {
            document.getElementById('carouselTrack').innerHTML = 
                '<div style="text-align: center; padding: 3rem; width: 100%;"><p>No products available at the moment.</p></div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        throw error;
    }
}

function initCarousel() {
    if (carouselState.allProducts.length === 0) return;
    
    // Load first batch of products
    loadNextProducts();
    
    // Update indicators
    updateIndicators();
}

function loadNextProducts() {
    const { availableProducts, productsPerView } = carouselState;
    
    // If no products available, reset from all products
    if (availableProducts.length === 0) {
        carouselState.availableProducts = [...carouselState.allProducts];
        
        // If still no products, nothing to show
        if (carouselState.availableProducts.length === 0) {
            return;
        }
    }
    
    // Randomly select products from available pool
    const numToSelect = Math.min(productsPerView, carouselState.availableProducts.length);
    const selectedProducts = [];
    
    for (let i = 0; i < numToSelect; i++) {
        // Pick random index from available products
        const randomIndex = Math.floor(Math.random() * carouselState.availableProducts.length);
        const product = carouselState.availableProducts[randomIndex];
        
        selectedProducts.push(product);
        
        // Remove from available pool
        carouselState.availableProducts.splice(randomIndex, 1);
    }
    
    // Replace current products with new selection
    carouselState.currentProducts = selectedProducts;
    
    // Render products
    renderProducts();
    
    // Update indicators to show progress
    updateIndicators();
}

function renderProducts() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const { currentProducts } = carouselState;
    
    // Fade out current products
    track.style.opacity = '0';
    
    setTimeout(() => {
        track.innerHTML = currentProducts.map((product, index) => `
            <div class="carousel-product-card" data-index="${index}" style="animation-delay: ${index * 0.1}s">
                <div class="carousel-product-image">
                    <img src="${product.image_url || 'assets/images/placeholder.png'}" 
                         alt="${product.name}"
                         onerror="this.src='assets/images/placeholder.png'">
                    ${product.stock < 10 ? '<span class="product-badge">Low Stock</span>' : ''}
                    ${product.stock === 0 ? '<span class="product-badge" style="background: #e53e3e;">Out of Stock</span>' : ''}
                </div>
                <div class="carousel-product-info">
                    <div class="carousel-product-category">${product.category || 'General'}</div>
                    <h3 class="carousel-product-name">${product.name}</h3>
                    <div class="carousel-product-price">${CONFIG.CURRENCY}${parseFloat(product.price).toFixed(2)}</div>
                    <div class="carousel-product-actions">
                        <button class="btn btn-primary" onclick="window.homePageActions.addToCartHandler('${product.id}')" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <a href="pages/product-detail.html?id=${product.id}" class="btn btn-secondary">View</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Fade in new products
        track.style.opacity = '1';
    }, 300);
}

function updateCarouselPosition(animate = true) {
    // Not needed anymore since we replace products instead of sliding
    // Keeping for compatibility
}

function setupCarouselNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Hide prev button since we're showing random products
    if (prevBtn) {
        prevBtn.style.display = 'none';
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (carouselState.isTransitioning) return;
            navigateNext();
        });
    }
}

function navigatePrevious() {
    // Not used in random selection mode
}

function navigateNext() {
    // Load new random products
    carouselState.isTransitioning = true;
    
    loadNextProducts();
    resetTimer();
    
    setTimeout(() => {
        carouselState.isTransitioning = false;
    }, 600);
}

function updateIndicators() {
    // Update indicators to show progress through product pool
    const indicators = document.getElementById('carouselIndicators');
    if (!indicators) return;
    
    const { allProducts, availableProducts } = carouselState;
    const totalProducts = allProducts.length;
    const shownProducts = totalProducts - availableProducts.length;
    
    // Show how many products viewed out of total
    indicators.innerHTML = `
        <div style="text-align: center; color: #64748b; font-size: 0.9rem; padding: 0.5rem;">
            Showing ${Math.min(shownProducts + carouselState.productsPerView, totalProducts)} of ${totalProducts} products
        </div>
    `;
}

function goToSlide(slideIndex) {
    // Not used in random selection mode
}

function startAutoPlay() {
    if (!carouselState.autoPlayEnabled) return;
    
    // Clear existing intervals
    if (carouselState.autoPlayInterval) {
        clearInterval(carouselState.autoPlayInterval);
    }
    if (carouselState.timerInterval) {
        clearInterval(carouselState.timerInterval);
    }
    
    // Auto-advance every 30 seconds
    carouselState.autoPlayInterval = setInterval(() => {
        navigateNext();
    }, 30000);
    
    // Update timer bar every 100ms
    carouselState.timerProgress = 0;
    const timerBar = document.getElementById('timerBar');
    
    carouselState.timerInterval = setInterval(() => {
        carouselState.timerProgress += (100 / 30000) * 100;
        if (timerBar) {
            timerBar.style.width = `${carouselState.timerProgress}%`;
        }
        if (carouselState.timerProgress >= 100) {
            carouselState.timerProgress = 0;
        }
    }, 100);
}

function stopAutoPlay() {
    if (carouselState.autoPlayInterval) {
        clearInterval(carouselState.autoPlayInterval);
        carouselState.autoPlayInterval = null;
    }
    if (carouselState.timerInterval) {
        clearInterval(carouselState.timerInterval);
        carouselState.timerInterval = null;
    }
    
    const timerBar = document.getElementById('timerBar');
    if (timerBar) {
        timerBar.style.width = '0%';
    }
}

function resetTimer() {
    stopAutoPlay();
    startAutoPlay();
}

function handleResponsiveView() {
    const width = window.innerWidth;
    
    if (width < 768) {
        carouselState.productsPerView = 1;
    } else {
        carouselState.productsPerView = 2;
    }
    
    updateCarouselPosition(false);
    updateIndicators();
}

async function addToCartHandler(productId) {
    try {
        const product = carouselState.allProducts.find(p => p.id === productId);
        if (!product) return;
        
        await addToCart(productId, 1);
        showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Please login to add items to cart', 'error');
    }
}

// Export actions for inline event handlers
window.homePageActions = {
    addToCartHandler,
    goToSlide
};

