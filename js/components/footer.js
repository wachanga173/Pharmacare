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
    
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>${window.CONFIG.APP_NAME}</h3>
                        <p>Your trusted online pharmacy providing quality medications and healthcare products with care and professionalism.</p>
                        <p style="margin-top: 1rem;">
                            <strong>📞 Call Us:</strong> 1-800-PHARMA<br>
                            <strong>📧 Email:</strong> info@pharmacare.com
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
                            <li><a href="#">Help & FAQ</a></li>
                            <li><a href="#">Shipping Information</a></li>
                            <li><a href="#">Returns & Refunds</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms & Conditions</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} ${window.CONFIG.APP_NAME}. All rights reserved. | Designed with ❤️ for better healthcare</p>
                </div>
            </div>
        </footer>
    `;
}
