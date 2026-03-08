// Admin page logic
import { isLoggedIn, getCurrentUser } from '../services/auth.js';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/products.js';
import { showSuccess, showError } from '../components/toast.js';
import { showModal, confirmModal } from '../components/modal.js';
import { sanitizeHTML } from '../utils/helpers.js';
import { initEditProductModal } from './EditProduct.js';

export async function initAdminPage() {
    // Check authentication and authorization
    const loggedIn = await isLoggedIn();
    const user = await getCurrentUser();
    
    if (!loggedIn || !user?.isAdmin) {
        window.location.href = 'login.html';
        return;
    }
    
    loadProductsTable();
    setupAdminHandlers();
}

async function loadProductsTable() {
    const container = document.getElementById('admin-products-table');
    if (!container) return;
    
    try {
        const products = await getProducts(true); // Force reload to get fresh data
        container.innerHTML = renderProductsTable(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error loading products');
    }
}

function renderProductsTable(products) {
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>${sanitizeHTML(String(product.id))}</td>
                        <td>${sanitizeHTML(product.name)}</td>
                        <td>${sanitizeHTML(product.category)}</td>
                        <td>${CONFIG.CURRENCY}${product.price.toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="btn btn-secondary edit-product" data-id="${product.id}">Edit</button>
                            <button class="btn btn-danger delete-product" data-id="${product.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function setupAdminHandlers() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', showAddProductModal);
    }
    
    const container = document.getElementById('admin-products-table');
    if (container) {
        container.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-product')) {
                const id = e.target.dataset.id;
                const confirmed = await confirmModal('Delete Product', 'Are you sure?');
                if (confirmed) {
                    deleteProduct(id);
                    showSuccess('Product deleted');
                    loadProductsTable();
                }
            }

            if (e.target.classList.contains('edit-product')) {
                const id = e.target.dataset.id;
                showEditProductModal(id);
            }
        });
    }
}

function showAddProductModal() {
    const content = `
        <form id="product-form">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" name="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label class="form-label">Price</label>
                <input type="number" name="price" class="form-control" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">Stock</label>
                <input type="number" name="stock" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Product</button>
        </form>
    `;
    
    showModal('Add Product', content);
}

async function showEditProductModal(id) {
    const content = await initEditProductModal(id, loadProductsTable);
    if (content) {
        showModal('Edit Product', content);
    }
}
