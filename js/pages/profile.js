// Profile page logic
import { getCurrentUser, updateUserProfile, uploadProfilePhoto, logout } from '../services/auth.js';
import { showSuccess, showError } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';

export async function initProfilePage() {
    await renderProfile();
    setupProfileHandlers();
}

async function renderProfile() {
    const container = document.getElementById('profile-container');
    if (!container) return;
    
    const user = await getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    container.innerHTML = `
        <div class="profile-wrapper">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${user.avatar_url || 'https://via.placeholder.com/150'}" 
                         alt="${user.name}" 
                         id="profile-avatar-img">
                    <button class="btn btn-secondary" id="change-avatar-btn">Change Photo</button>
                    <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                </div>
                <div class="profile-info">
                    <h1>${user.name}</h1>
                    <p class="text-muted">${user.email}</p>
                    ${user.isAdmin ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-customer">Customer</span>'}
                </div>
            </div>
            
            <div class="profile-tabs">
                <button class="tab-btn active" data-tab="details">Personal Details</button>
                <button class="tab-btn" data-tab="orders">My Orders</button>
                <button class="tab-btn" data-tab="security">Security</button>
            </div>
            
            <div class="profile-content">
                <!-- Personal Details Tab -->
                <div class="tab-content active" id="details-tab">
                    <h2>Personal Information</h2>
                    <form id="profile-form">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="name" class="form-control" 
                                   value="${user.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" 
                                   value="${user.email}" disabled>
                            <small class="text-muted">Email cannot be changed</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" name="phone" class="form-control" 
                                   value="${user.phone || ''}" placeholder="+1 (555) 000-0000">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <textarea name="address" class="form-control" rows="3" 
                                      placeholder="Street address, City, State, ZIP">${user.address || ''}</textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            Save Changes
                        </button>
                    </form>
                </div>
                
                <!-- Orders Tab -->
                <div class="tab-content" id="orders-tab">
                    <h2>Order History</h2>
                    <div id="orders-list">
                        <p>Loading orders...</p>
                    </div>
                </div>
                
                <!-- Security Tab -->
                <div class="tab-content" id="security-tab">
                    <h2>Security Settings</h2>
                    
                    <div class="security-section">
                        <h3>Change Password</h3>
                        <form id="password-form">
                            <div class="form-group">
                                <label class="form-label">Current Password</label>
                                <input type="password" name="currentPassword" 
                                       class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">New Password</label>
                                <input type="password" name="newPassword" 
                                       class="form-control" required minlength="6">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" name="confirmPassword" 
                                       class="form-control" required minlength="6">
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                Update Password
                            </button>
                        </form>
                    </div>
                    
                    <div class="security-section">
                        <h3>Account Actions</h3>
                        <button class="btn btn-danger" id="delete-account-btn">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load orders if on orders tab
    setTimeout(loadUserOrders, 100);
}

function setupProfileHandlers() {
    // Tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            switchTab(e.target.dataset.tab);
        }
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Avatar upload
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    
    if (changeAvatarBtn && avatarUpload) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarUpload.click();
        });
        
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Delete account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteAccount);
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Load orders when switching to orders tab
    if (tabName === 'orders') {
        loadUserOrders();
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updates = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };
    
    const result = await updateUserProfile(updates);
    
    if (result.success) {
        showSuccess('Profile updated successfully!');
        await renderProfile();
    } else {
        showError(result.error || 'Failed to update profile');
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showError('Image size must be less than 2MB');
        return;
    }
    
    showSuccess('Uploading photo...');
    
    const result = await uploadProfilePhoto(file);
    
    if (result.success) {
        showSuccess('Photo updated successfully!');
        
        // Update avatar image
        const avatarImg = document.getElementById('profile-avatar-img');
        if (avatarImg) {
            avatarImg.src = result.url;
        }
    } else {
        showError(result.error || 'Failed to upload photo');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    // TODO: Implement password change with Supabase
    showError('Password change feature coming soon');
    
    // For Supabase implementation:
    // const supabase = getSupabaseClient();
    // const { error } = await supabase.auth.updateUser({ password: newPassword });
}

async function handleDeleteAccount() {
    const confirmed = await confirmModal(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
        const doubleConfirm = await confirmModal(
            'Final Confirmation',
            'This will permanently delete all your data. Are you absolutely sure?'
        );
        
        if (doubleConfirm) {
            // TODO: Implement account deletion
            showError('Account deletion feature coming soon');
            
            // For Supabase implementation:
            // Delete user data from database
            // Delete Supabase auth user
            // Logout
        }
    }
}

async function loadUserOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    const user = await getCurrentUser();
    if (!user) return;
    
    // Get Supabase client
    const supabase = window.supabase?.createClient(
        window.CONFIG.SUPABASE.URL,
        window.CONFIG.SUPABASE.ANON_KEY
    );
    
    if (!supabase) {
        ordersList.innerHTML = '<p>Orders feature requires database connection</p>';
        return;
    }
    
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!orders || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <p>No orders yet</p>
                    <a href="products.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Order #${order.order_number || order.id.substring(0, 8)}</strong>
                        <p class="text-muted">${formatDate(order.created_at)}</p>
                    </div>
                    <div>
                        <span class="badge badge-${getStatusColor(order.status)}">${order.status}</span>
                    </div>
                </div>
                <div class="order-body">
                    <p><strong>Total:</strong> ${CONFIG.CURRENCY}${order.total.toFixed(2)}</p>
                    <p><strong>Items:</strong> ${order.items?.length || 0}</p>
                </div>
                <div class="order-footer">
                    <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<p class="text-danger">Failed to load orders</p>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        processing: 'info',
        shipped: 'primary',
        delivered: 'success',
        cancelled: 'danger'
    };
    return colors[status] || 'secondary';
}

// Make viewOrderDetails available globally
window.viewOrderDetails = function(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
};
