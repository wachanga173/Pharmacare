// Header component
import { getCartItemCount } from "../services/cart.js";
import { isLoggedIn, getCurrentUser, logout } from "../services/auth.js";

export async function initHeader() {
  const headerElement = document.getElementById("header");
  if (!headerElement) return;

  headerElement.innerHTML = await renderHeader();
  attachHeaderEventListeners();
  updateCartBadge();
  window.addEventListener("cart:updated", () => updateCartBadge());
}

async function renderHeader() {
  const cartCount = await getCartItemCount();
  const loggedIn = await isLoggedIn();
  const user = loggedIn ? await getCurrentUser() : null;

  // Determine paths
  const currentPath = window.location.pathname;
  const isInPagesFolder =
    currentPath.includes("/pages/") && !currentPath.endsWith("index.html");
  const isInDirectorsFolder = currentPath.includes("/pages/directors/");

  let homePath,
    productsPath,
    aboutPath,
    contactPath,
    profilePath,
    adminPath,
    loginPath,
    registerPath,
    cartPath;

  if (isInDirectorsFolder) {
    homePath = "../../index.html";
    productsPath = "../products.html";
    aboutPath = "../about.html";
    contactPath = "../contact.html";
    profilePath = "../profile.html";
    adminPath = "../admin.html";
    loginPath = "../login.html";
    registerPath = "../register.html";
    cartPath = "../cart.html";
  } else if (isInPagesFolder) {
    homePath = "../index.html";
    productsPath = "products.html";
    aboutPath = "about.html";
    contactPath = "contact.html";
    profilePath = "profile.html";
    adminPath = "admin.html";
    loginPath = "login.html";
    registerPath = "register.html";
    cartPath = "cart.html";
  } else {
    homePath = "index.html";
    productsPath = "pages/products.html";
    aboutPath = "pages/about.html";
    contactPath = "pages/contact.html";
    profilePath = "pages/profile.html";
    adminPath = "pages/admin.html";
    loginPath = "pages/login.html";
    registerPath = "pages/register.html";
    cartPath = "pages/cart.html";
  }

  // Unified menu
  return `
        <nav class="header">
            <div class="container">
                <div class="header-nav">
                    <a href="${homePath}" class="logo">
                      <img class="logo-icon" src="https://res.cloudinary.com/dopdw3i4y/image/upload/v1773749232/Gemini_Generated_Image_52aq2h52aq2h52aq_1_cdnuew.png" alt="Pharmacare logo pill" />
                        ${window.CONFIG.APP_NAME}
                    </a>

                    <!-- Hamburger -->
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div class="nav-menu">
                        <ul class="nav-links nav-links-center">
                            <li><a href="${homePath}" class="nav-link">Home</a></li>
                            <li><a href="${productsPath}" class="nav-link">Products</a></li>
                            <li><a href="${aboutPath}" class="nav-link">About</a></li>
                            <li><a href="${contactPath}" class="nav-link">Contact</a></li>
                          <li>
                            <a href="${cartPath}" class="nav-link cart-link">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Cart
                              <span class="cart-badge" id="cart-badge" style="display: ${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
                            </a>
                          </li>
                        </ul>

                        <ul class="nav-links nav-links-right">
                            ${
                              loggedIn
                                ? `
                                <li><a href="${profilePath}" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Profile</a></li>
                                ${user?.isAdmin ? `<li><a href="${adminPath}" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Admin</a></li>` : ""}
                                <li><a href="#" class="nav-link" id="logout-btn">Logout</a></li>
                            `
                                : `
                                <li><a href="${loginPath}" class="nav-link">Login</a></li>
                                <li><a href="${registerPath}" class="nav-link btn-register">Sign Up</a></li>
                            `
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

function attachHeaderEventListeners() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
      window.location.reload();
    });
  }

  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }
}

export async function updateCartBadge() {
  let badge = document.getElementById("cart-badge");
  const cartCount = await getCartItemCount();
  
  if (badge) {
    badge.textContent = cartCount;
    badge.style.display = cartCount > 0 ? "flex" : "none";
  } else {
    // If badge doesn't exist, find cart link and add it
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.id = 'cart-badge';
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? "flex" : "none";
      cartLink.appendChild(badge);
    }
  }
}
