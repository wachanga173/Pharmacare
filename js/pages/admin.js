// Admin page logic
import { isLoggedIn, getCurrentUser } from '../services/auth.js';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/products.js';
import { showSuccess, showError } from '../components/toast.js';
import { showModal, confirmModal } from '../components/modal.js';
import { sanitizeHTML } from '../utils/helpers.js';
import { initEditProductModal } from './EditProduct.js';
import { getSupabaseClient } from '../services/auth.js';

let currentTab = 'products';

export async function initAdminPage() {
    // Check authentication and authorization
    const loggedIn = await isLoggedIn();
    const user = await getCurrentUser();
    
    if (!loggedIn || !user?.isAdmin) {
        window.location.href = 'login.html';
        return;
    }
    
    setupTabHandlers();
    loadProductsTable();
    setupAdminHandlers();
}

function setupTabHandlers() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update active tab button
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
    
    // Load content for the selected tab
    switch(tabName) {
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'contacts':
            loadContactsTable();
            break;
        case 'users':
            loadUsersTable();
            break;
    }
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
    
    // Products table handlers
    const productsContainer = document.getElementById('admin-products-table');
    if (productsContainer) {
        productsContainer.addEventListener('click', async (e) => {
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
    
    // Orders table handlers
    const ordersContainer = document.getElementById('admin-orders-table');
    if (ordersContainer) {
        ordersContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('view-order')) {
                const orderId = e.target.dataset.id;
                await showOrderDetailModal(orderId);
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

// ============ ORDERS MANAGEMENT ============
async function loadOrdersTable() {
    const container = document.getElementById('admin-orders-table');
    if (!container) return;
    
    container.innerHTML = '<p>Loading orders...</p>';
    
    try {
        const supabase = getSupabaseClient();
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        container.innerHTML = renderOrdersTable(orders || []);
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p>Error loading orders. Make sure the orders table exists and RLS policies are configured.</p>';
    }
}

function renderOrdersTable(orders) {
    if (!orders.length) {
        return '<p>No orders found.</p>';
    }
    
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer ID</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${sanitizeHTML(order.order_number || 'N/A')}</td>
                        <td>${sanitizeHTML(String(order.user_id).substring(0, 8))}...</td>
                        <td><span class="status-badge status-${order.status}">${sanitizeHTML(order.status || 'pending')}</span></td>
                        <td>${CONFIG.CURRENCY}${(order.total || 0).toFixed(2)}</td>
                        <td>${order.items ? order.items.length : 0}</td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-secondary view-order" data-id="${order.id}">View Details</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============ CONTACTS MANAGEMENT ============
async function loadContactsTable() {
    const container = document.getElementById('admin-contacts-table');
    if (!container) return;
    
    container.innerHTML = '<p>Loading contacts...</p>';
    
    try {
        const supabase = getSupabaseClient();
        const { data: contacts, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        container.innerHTML = renderContactsTable(contacts || []);
    } catch (error) {
        console.error('Error loading contacts:', error);
        container.innerHTML = '<p>Error loading contacts. Make sure the contacts table exists and RLS policies are configured.</p>';
    }
}

function renderContactsTable(contacts) {
    if (!contacts.length) {
        return '<p>No contact submissions found.</p>';
    }
    
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${contacts.map(contact => `
                    <tr>
                        <td>${sanitizeHTML(contact.name || 'N/A')}</td>
                        <td>${sanitizeHTML(contact.email || 'N/A')}</td>
                        <td>${sanitizeHTML(contact.subject || 'N/A')}</td>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${sanitizeHTML(contact.message || 'N/A')}
                        </td>
                        <td>${contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============ USERS MANAGEMENT ============
async function loadUsersTable() {
    const container = document.getElementById('admin-users-table');
    if (!container) return;
    
    container.innerHTML = '<p>Loading users...</p>';
    
    try {
        const supabase = getSupabaseClient();
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        container.innerHTML = renderUsersTable(users || []);
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p>Error loading users. Make sure you have permission to view users.</p>';
    }
}

function renderUsersTable(users) {
    if (!users.length) {
        return '<p>No users found.</p>';
    }
    
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${sanitizeHTML(String(user.id).substring(0, 8))}...</td>
                        <td>${sanitizeHTML(user.email || 'N/A')}</td>
                        <td>${sanitizeHTML(user.full_name || 'N/A')}</td>
                        <td><span class="role-badge role-${user.role || 'customer'}">${sanitizeHTML(user.role || 'customer')}</span></td>
                        <td>${sanitizeHTML(user.phone || 'N/A')}</td>
                        <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============ ORDER DETAIL MODAL FOR ADMIN ============
async function showOrderDetailModal(orderId) {
    try {
        const supabase = getSupabaseClient();
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        
        if (error) throw error;
        
        if (!order) {
            showError('Order not found');
            return;
        }
        
        const content = renderOrderDetailForAdmin(order);
        showModal('Order Details', content, { className: 'modal-large' });
    } catch (error) {
        console.error('Error loading order:', error);
        showError('Error loading order details');
    }
}

function renderOrderDetailForAdmin(order) {
    const shippingInfo = order.shipping_info || {};
    const items = order.items || [];
    
    return `
        <div style="max-height: 70vh; overflow-y: auto;">
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 6px; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${sanitizeHTML(order.order_number || 'N/A')}</h3>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span class="status-badge status-${order.status}" id="current-status-badge">${sanitizeHTML(order.status || 'pending')}</span>
                        <button class="btn btn-secondary btn-sm" onclick="window.showStatusUpdateForm('${order.id}', '${order.status}')">Change Status</button>
                    </div>
                </div>
                
                <!-- Status Update Form (hidden by default) -->
                <div id="status-update-form" style="display: none; margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border: 2px solid #007bff;">
                    <h4 style="margin: 0 0 1rem 0; font-size: 1rem;">Update Order Status</h4>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <select id="new-status-select" class="form-control" style="flex: 1; max-width: 250px;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="window.updateOrderStatus('${order.id}')">Save</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.hideStatusUpdateForm()">Cancel</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem; margin-top: 1rem;">
                    <div>
                        <strong>Order Date:</strong><br>
                        ${new Date(order.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                    <div>
                        <strong>Customer ID:</strong><br>
                        ${sanitizeHTML(String(order.user_id).substring(0, 12))}...
                    </div>
                    <div>
                        <strong>Payment Method:</strong><br>
                        ${sanitizeHTML((order.payment_method || 'N/A').toUpperCase())}
                    </div>
                    <div>
                        <strong>Total:</strong><br>
                        <span style="color: #007bff; font-size: 1.1rem; font-weight: 600;">
                            ${CONFIG.CURRENCY}${(order.total || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;">Order Items</h4>
                ${renderOrderItemsForAdmin(items)}
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span>Subtotal:</span>
                        <span>${CONFIG.CURRENCY}${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span>Shipping:</span>
                        <span>${order.shipping_cost === 0 ? 'FREE' : CONFIG.CURRENCY + (order.shipping_cost || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span>Tax:</span>
                        <span>${CONFIG.CURRENCY}${(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 2px solid #dee2e6; margin-top: 0.5rem; font-weight: 700; font-size: 1.1rem; color: #007bff;">
                        <span>Total:</span>
                        <span>${CONFIG.CURRENCY}${(order.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;">Shipping Information</h4>
                <div style="display: grid; gap: 0.75rem; font-size: 0.9rem;">
                    <div style="display: flex; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="min-width: 140px; color: #666;">Full Name:</strong>
                        <span>${sanitizeHTML(shippingInfo.name || 'N/A')}</span>
                    </div>
                    <div style="display: flex; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="min-width: 140px; color: #666;">Phone:</strong>
                        <span>${sanitizeHTML(shippingInfo.phone || 'N/A')}</span>
                    </div>
                    <div style="display: flex; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="min-width: 140px; color: #666;">Address:</strong>
                        <span>${sanitizeHTML(shippingInfo.address || 'N/A')}</span>
                    </div>
                    <div style="display: flex; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="min-width: 140px; color: #666;">City:</strong>
                        <span>${sanitizeHTML(shippingInfo.city || 'N/A')}</span>
                    </div>
                    <div style="display: flex; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="min-width: 140px; color: #666;">State/Region:</strong>
                        <span>${sanitizeHTML(shippingInfo.state || 'N/A')}</span>
                    </div>
                    <div style="display: flex; padding: 0.5rem 0;">
                        <strong style="min-width: 140px; color: #666;">Zip/Postal Code:</strong>
                        <span>${sanitizeHTML(shippingInfo.zipCode || 'N/A')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderOrderItemsForAdmin(items) {
    if (!items || items.length === 0) {
        return '<p>No items in this order.</p>';
    }
    
    return `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
                            <strong>${sanitizeHTML(item.product_name || 'N/A')}</strong>
                            ${item.product_id ? `<br><small style="color: #666;">ID: ${sanitizeHTML(String(item.product_id).substring(0, 12))}</small>` : ''}
                        </td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">${CONFIG.CURRENCY}${(item.product_price || 0).toFixed(2)}</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">${item.quantity || 0}</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                            ${CONFIG.CURRENCY}${((item.product_price || 0) * (item.quantity || 0)).toFixed(2)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============ ORDER STATUS UPDATE FUNCTIONS ============
// Make these available globally for inline onclick handlers
window.showStatusUpdateForm = function(orderId, currentStatus) {
    const form = document.getElementById('status-update-form');
    if (form) {
        form.style.display = 'block';
        form.dataset.orderId = orderId;
    }
};

window.hideStatusUpdateForm = function() {
    const form = document.getElementById('status-update-form');
    if (form) {
        form.style.display = 'none';
    }
};

window.updateOrderStatus = async function(orderId) {
    const select = document.getElementById('new-status-select');
    if (!select) return;
    
    const newStatus = select.value;
    
    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('orders')
            .update({ 
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
        
        if (error) throw error;
        
        // Update the badge in the modal
        const badge = document.getElementById('current-status-badge');
        if (badge) {
            badge.className = `status-badge status-${newStatus}`;
            badge.textContent = newStatus;
        }
        
        // Hide the form
        window.hideStatusUpdateForm();
        
        // Show success message
        showSuccess(`Order status updated to ${newStatus}`);
        
        // Reload orders table if we're on the orders tab
        if (currentTab === 'orders') {
            loadOrdersTable();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Failed to update order status');
    }
};
