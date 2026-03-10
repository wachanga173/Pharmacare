// Order detail page logic
import { isLoggedIn, getCurrentUser, getSupabaseClient } from '../services/auth.js';
import { showError } from '../components/toast.js';
import { sanitizeHTML } from '../utils/helpers.js';

export async function initOrderDetail() {
    // Check authentication - both customers and admins can view
    const loggedIn = await isLoggedIn();
    const user = await getCurrentUser();
    
    if (!loggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        showError('Order ID not found');
        document.getElementById('order-detail-content').innerHTML = '<p>Order ID not provided.</p>';
        return;
    }
    
    await loadOrderDetail(orderId, user);
}

async function loadOrderDetail(orderId, user) {
    const container = document.getElementById('order-detail-content');
    if (!container) return;
    
    try {
        const supabase = getSupabaseClient();
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        
        if (error) throw error;
        
        if (!order) {
            container.innerHTML = '<p>Order not found.</p>';
            return;
        }
        
        // Check if user has permission to view this order
        // Admins can view any order, customers can only view their own
        if (!user.isAdmin && order.user_id !== user.id) {
            container.innerHTML = '<p>You do not have permission to view this order.</p>';
            showError('Access denied');
            return;
        }
        
        container.innerHTML = renderOrderDetail(order);
    } catch (error) {
        console.error('Error loading order:', error);
        showError('Error loading order details');
        container.innerHTML = '<p>Error loading order details. Please try again.</p>';
    }
}

function renderOrderDetail(order) {
    const shippingInfo = order.shipping_info || {};
    const items = order.items || [];
    
    return `
        <div class="order-header">
            <h1>Order Details</h1>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <h2 style="margin: 0;">${sanitizeHTML(order.order_number || 'N/A')}</h2>
                <span class="status-badge status-${order.status}">${sanitizeHTML(order.status || 'pending')}</span>
            </div>
            
            <div class="order-meta">
                <div class="meta-item">
                    <div class="meta-label">Order Date</div>
                    <div class="meta-value">${new Date(order.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Customer ID</div>
                    <div class="meta-value">${sanitizeHTML(String(order.user_id).substring(0, 12))}...</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Payment Method</div>
                    <div class="meta-value">${sanitizeHTML((order.payment_method || 'N/A').toUpperCase())}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Total Amount</div>
                    <div class="meta-value" style="color: #007bff; font-size: 1.25rem;">
                        ${CONFIG.CURRENCY}${(order.total || 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="order-section">
            <h2>Order Items</h2>
            ${renderOrderItems(items)}
            
            <div class="order-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${CONFIG.CURRENCY}${(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${order.shipping_cost === 0 ? 'FREE' : CONFIG.CURRENCY + (order.shipping_cost || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span>${CONFIG.CURRENCY}${(order.tax || 0).toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>${CONFIG.CURRENCY}${(order.total || 0).toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="order-section">
            <h2>Shipping Information</h2>
            <div class="shipping-info">
                <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.name || 'N/A')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.phone || 'N/A')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.address || 'N/A')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">City:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.city || 'N/A')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">State/Region:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.state || 'N/A')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Zip/Postal Code:</span>
                    <span class="info-value">${sanitizeHTML(shippingInfo.zipCode || 'N/A')}</span>
                </div>
            </div>
        </div>
    `;
}

function renderOrderItems(items) {
    if (!items || items.length === 0) {
        return '<p>No items in this order.</p>';
    }
    
    return `
        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                ${item.product_image ? `
                                    <img src="${sanitizeHTML(item.product_image)}" 
                                         alt="${sanitizeHTML(item.product_name)}" 
                                         class="product-image">
                                ` : ''}
                                <div>
                                    <div style="font-weight: 600;">${sanitizeHTML(item.product_name || 'N/A')}</div>
                                    ${item.product_description ? `
                                        <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">
                                            ${sanitizeHTML(item.product_description.substring(0, 100))}${item.product_description.length > 100 ? '...' : ''}
                                        </div>
                                    ` : ''}
                                    ${item.product_id ? `
                                        <div style="font-size: 0.75rem; color: #999; margin-top: 0.25rem;">
                                            ID: ${sanitizeHTML(String(item.product_id).substring(0, 12))}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </td>
                        <td>${CONFIG.CURRENCY}${(item.product_price || 0).toFixed(2)}</td>
                        <td>${item.quantity || 0}</td>
                        <td style="font-weight: 600;">
                            ${CONFIG.CURRENCY}${((item.product_price || 0) * (item.quantity || 0)).toFixed(2)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
