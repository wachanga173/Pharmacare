// Home page logic - Modern Dynamic Product Carousel
import { getProducts } from '../services/products.js';
import { addToCart } from '../services/cart.js';
import { showToast } from '../components/toast.js';

// Carousel State Management
const carouselState = {
    allProducts: [],
    shownProductIds: new Set(),
    currentProducts: [],
    currentIndex: 0,
    productsPerView: 3,
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
}

function loadNextProducts() {
    const { allProducts, shownProductIds, productsPerView } = carouselState;
    
    // Get available products (not yet shown)
    const availableProducts = allProducts.filter(p => !shownProductIds.has(p.id));
    
    // If all products have been shown, reset the tracking
    if (availableProducts.length === 0) {
        carouselState.shownProductIds.clear();
        carouselState.currentProducts = [];
        loadNextProducts();
        return;
    }
    
    // Randomly select products from available ones
    const selectedProducts = [];
    const numToSelect = Math.min(productsPerView, availableProducts.length);
    
    const shuffled = [...availableProducts].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numToSelect; i++) {
        const product = shuffled[i];
        selectedProducts.push(product);
        carouselState.shownProductIds.add(product.id);
    }
    
    // Add to current products
    carouselState.currentProducts.push(...selectedProducts);
    
    // Render products
    renderProducts();
    updateIndicators();
}

function renderProducts() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const { currentProducts } = carouselState;
    
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
                <div class="carousel-product-price">$${parseFloat(product.price).toFixed(2)}</div>
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
    
    // Update carousel position
    updateCarouselPosition(false);
}

function updateCarouselPosition(animate = true) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const { currentIndex, productsPerView } = carouselState;
    
    // Calculate the offset
    const cardWidth = 300; // min-width of card
    const gap = 32; // 2rem gap
    const offset = currentIndex * (cardWidth + gap);
    
    if (animate) {
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
        track.style.transition = 'none';
    }
    
    track.style.transform = `translateX(-${offset}px)`;
}

function setupCarouselNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (carouselState.isTransitioning) return;
            navigatePrevious();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (carouselState.isTransitioning) return;
            navigateNext();
        });
    }
    
    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', toggleAutoPlay);
    }
}

function navigatePrevious() {
    const { currentIndex } = carouselState;
    
    if (currentIndex > 0) {
        carouselState.currentIndex--;
        updateCarouselPosition(true);
        updateIndicators();
        resetTimer();
    }
}

function navigateNext() {
    const { currentIndex, currentProducts, productsPerView } = carouselState;
    const maxIndex = currentProducts.length - productsPerView;
    
    if (currentIndex < maxIndex) {
        carouselState.currentIndex++;
        updateCarouselPosition(true);
        updateIndicators();
        resetTimer();
    } else {
        // Load more products
        loadNextProducts();
        carouselState.currentIndex++;
        updateIndicators();
        resetTimer();
    }
}

function updateIndicators() {
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (!indicatorsContainer) return;
    
    const { currentProducts, productsPerView, currentIndex } = carouselState;
    const numIndicators = Math.ceil(currentProducts.length / productsPerView);
    
    indicatorsContainer.innerHTML = Array.from({ length: numIndicators }, (_, i) => {
        const isActive = Math.floor(currentIndex / productsPerView) === i;
        return `<button class="indicator-dot ${isActive ? 'active' : ''}" 
                        data-index="${i}" 
                        onclick="window.homePageActions.goToSlide(${i})"></button>`;
    }).join('');
}

function goToSlide(slideIndex) {
    const { productsPerView } = carouselState;
    carouselState.currentIndex = slideIndex * productsPerView;
    updateCarouselPosition(true);
    updateIndicators();
    resetTimer();
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
    if (carouselState.autoPlayEnabled) {
        stopAutoPlay();
        startAutoPlay();
    }
}

function toggleAutoPlay() {
    carouselState.autoPlayEnabled = !carouselState.autoPlayEnabled;
    
    const btn = document.getElementById('autoPlayBtn');
    const playIcon = btn.querySelector('.play-icon');
    
    if (carouselState.autoPlayEnabled) {
        btn.classList.add('active');
        playIcon.textContent = '⏸';
        startAutoPlay();
    } else {
        btn.classList.remove('active');
        playIcon.textContent = '▶';
        stopAutoPlay();
    }
}

function handleResponsiveView() {
    const width = window.innerWidth;
    
    if (width < 768) {
        carouselState.productsPerView = 1;
    } else if (width < 1024) {
        carouselState.productsPerView = 2;
    } else {
        carouselState.productsPerView = 3;
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

