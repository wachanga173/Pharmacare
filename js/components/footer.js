// Footer component

export function initFooter() {
    const footerElement = document.getElementById('footer');
    if (!footerElement) return;
    
    footerElement.innerHTML = renderFooter();
}

function renderFooter() {
    const currentYear = new Date().getFullYear();
    
    // Detect if we're in the pages folder or root
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/') || currentPath.endsWith('.html') && !currentPath.endsWith('index.html');
    
    // Set paths based on current location
    const homePath = isInPagesFolder ? '../index.html' : 'index.html';
    const productsPath = isInPagesFolder ? 'products.html' : 'pages/products.html';
    const aboutPath = isInPagesFolder ? 'about.html' : 'pages/about.html';
    const contactPath = isInPagesFolder ? 'contact.html' : 'pages/contact.html';
    const directorsPath = isInPagesFolder ? 'directors.html' : 'pages/directors.html';
    const faqPath = isInPagesFolder ? 'faq.html' : 'pages/faq.html';
    const shippingPath = isInPagesFolder ? 'shipping.html' : 'pages/shipping.html';
    const returnsPath = isInPagesFolder ? 'returns.html' : 'pages/returns.html';
    const privacyPath = isInPagesFolder ? 'privacy.html' : 'pages/privacy.html';
    const termsPath = isInPagesFolder ? 'terms.html' : 'pages/terms.html';
    
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>${window.CONFIG.APP_NAME}</h3>
                        <p>Your trusted online pharmacy providing quality medications and healthcare products with care and professionalism.</p>
                        <p style="margin-top: 1rem;">
                            <strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:text-bottom;margin-right:4px;color:var(--primary-color)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call Us:</strong> 1-800-PHARMA<br>
                            <strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:text-bottom;margin-right:4px;color:var(--primary-color)"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email:</strong> info@pharmacare.com
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul class="footer-links">
                            <li><a href="${homePath}">Home</a></li>
                            <li><a href="${productsPath}">Products</a></li>
                            <li><a href="${aboutPath}">About Us</a></li>
                            <li><a href="${directorsPath}">Our Team</a></li>
                            <li><a href="${contactPath}">Contact Us</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Customer Service</h3>
                        <ul class="footer-links">
                            <li><a href="${faqPath}">Help & FAQ</a></li>
                            <li><a href="${shippingPath}">Shipping Information</a></li>
                            <li><a href="${returnsPath}">Returns & Refunds</a></li>
                            <li><a href="${privacyPath}">Privacy Policy</a></li>
                            <li><a href="${termsPath}">Terms & Conditions</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} ${window.CONFIG.APP_NAME}. All rights reserved. | Designed with  for better healthcare</p>
                </div>
            </div>
        </footer>
    `;
}
