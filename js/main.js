// Main application entry point
import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { initHomePage } from './pages/home.js';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize common components
        initHeader();
        initFooter();
        
        // Initialize page-specific content based on current page
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        switch (page) {
            case 'index.html':
            case '':
                await initHomePage();
                break;
            // Add other page initializations here
            default:
                console.log('Page:', page);
        }
        
        // Handle navigation
        setupNavigation();
        
    } catch (error) {
        console.error('Application initialization error:', error);
    }
});

// Setup navigation handlers
function setupNavigation() {
    // Handle internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-nav]');
        if (link) {
            e.preventDefault();
            const page = link.getAttribute('href');
            navigateTo(page);
        }
    });
}

// Navigate to page
function navigateTo(page) {
    window.location.href = page;
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
