// Footer component

export function initFooter() {
    const footerElement = document.getElementById('footer');
    if (!footerElement) return;
    
    footerElement.innerHTML = renderFooter();
}

function renderFooter() {
    const currentYear = new Date().getFullYear();
    
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>About Us</h3>
                        <p>Your trusted online pharmacy providing quality medications and healthcare products.</p>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul class="footer-links">
                            <li><a href="index.html">Home</a></li>
                            <li><a href="pages/products.html">Products</a></li>
                            <li><a href="pages/about.html">About Us</a></li>
                            <li><a href="pages/directors.html">Our Directors</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Customer Service</h3>
                        <ul class="footer-links">
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">Returns</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} ${CONFIG.APP_NAME}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}
