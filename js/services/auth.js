/**
 * Authentication Service with Supabase Integration
 * 
 * This service manages user authentication using Supabase Auth with localStorage fallback.
 * All functions are now ASYNC and return Promises.
 * 
 * USAGE EXAMPLES:
 * ================
 * 
 * 1. REGISTER A NEW USER:
 * ```javascript
 * import { register } from '../services/auth.js';
 * 
 * const result = await register({
 *   email: 'user@example.com',
 *   password: 'secure123',
 *   name: 'John Doe',
 *   phone: '+1234567890'
 * });
 * 
 * if (result.success) {
 *   console.log('User registered:', result.user);
 *   // Note: User will receive verification email
 * } else {
 *   console.error('Registration failed:', result.error);
 * }
 * ```
 * 
 * 2. LOGIN:
 * ```javascript
 * import { login } from '../services/auth.js';
 * 
 * const result = await login('user@example.com', 'password');
 * 
 * if (result.success) {
 *   console.log('Logged in as:', result.user);
 * }
 * ```
 * 
 * 3. LOGOUT:
 * ```javascript
 * import { logout } from '../services/auth.js';
 * 
 * await logout();
 * window.location.href = 'login.html';
 * ```
 * 
 * 4. CHECK IF USER IS LOGGED IN:
 * ```javascript
 * import { isLoggedIn } from '../services/auth.js';
 * 
 * const loggedIn = await isLoggedIn();
 * if (!loggedIn) {
 *   window.location.href = 'login.html';
 * }
 * ```
 * 
 * 5. GET CURRENT USER:
 * ```javascript
 * import { getCurrentUser } from '../services/auth.js';
 * 
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('User:', user.name, user.email);
 *   console.log('Is Admin:', user.isAdmin);
 * }
 * ```
 * 
 * 6. UPDATE USER PROFILE:
 * ```javascript
 * import { updateUserProfile } from '../services/auth.js';
 * 
 * const result = await updateUserProfile({
 *   name: 'New Name',
 *   phone: '+9876543210',
 *   address: '123 Main St, City, State'
 * });
 * ```
 * 
 * 7. PASSWORD RESET:
 * ```javascript
 * import { resetPassword } from '../services/auth.js';
 * 
 * const result = await resetPassword('user@example.com');
 * if (result.success) {
 *   alert(result.message); // "Check your email"
 * }
 * ```
 * 
 * 8. UPLOAD PROFILE PHOTO:
 * ```javascript
 * import { uploadProfilePhoto } from '../services/auth.js';
 * 
 * const file = document.getElementById('file-input').files[0];
 * const result = await uploadProfilePhoto(file);
 * 
 * if (result.success) {
 *   console.log('Photo URL:', result.url);
 * }
 * ```
 * 
 * 9. LISTEN TO AUTH STATE CHANGES:
 * ```javascript
 * import { onAuthStateChange } from '../services/auth.js';
 * 
 * onAuthStateChange((event, user) => {
 *   console.log('Auth event:', event); // SIGNED_IN, SIGNED_OUT, etc.
 *   console.log('User:', user);
 *   
 *   if (user) {
 *     // User logged in
 *   } else {
 *     // User logged out
 *   }
 * });
 * ```
 * 
 * FEATURES:
 * =========
 * ✅ Supabase Auth integration (primary)
 * ✅ localStorage fallback (for development)
 * ✅ Email verification
 * ✅ Password reset via email
 * ✅ Profile photo upload to Supabase Storage
 * ✅ Session persistence
 * ✅ Role-based access (admin/customer)
 * ✅ Automatic profile creation in users table
 * ✅ Auth state listener
 * 
 * SUPABASE SETUP REQUIRED:
 * ========================
 * 1. Enable Email Auth in Supabase Dashboard
 * 2. Create 'users' table with RLS policies
 * 3. Create 'user-avatars' storage bucket
 * 4. Configure email templates (optional)
 * 
 * @module auth
 */

// Authentication service - manages user authentication with Supabase
import { getFromStorage, saveToStorage } from '../utils/storage.js';

// Get Supabase client
function getSupabaseClient() {
    if (typeof window !== 'undefined' && window.supabase && window.CONFIG) {
        return window.supabase.createClient(
            window.CONFIG.SUPABASE.URL, 
            window.CONFIG.SUPABASE.ANON_KEY
        );
    }
    return null;
}

/**
 * Register a new user with Supabase Auth
 * @param {Object} userData - User data { email, password, name, phone }
 * @returns {Promise<Object>} { success, user, error }
 */
export async function register(userData) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        // Fallback to localStorage for development
        return localStorageRegister(userData);
    }
    
    try {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.name,
                    phone: userData.phone || ''
                }
            }
        });
        
        if (authError) throw authError;
        
        // Create user profile in users table
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: userData.email,
                full_name: userData.name,
                phone: userData.phone || '',
                role: 'customer'
            });
        
        if (profileError) console.error('Profile creation error:', profileError);
        
        return { 
            success: true, 
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: userData.name,
                isAdmin: false
            },
            message: 'Registration successful! Please check your email to verify your account.'
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'Registration failed' };
    }
}

/**
 * Login user with Supabase Auth
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { success, user, error }
 */
export async function login(email, password) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        // Fallback to localStorage for development
        return localStorageLogin(email, password);
    }
    
    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Get user profile from users table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        const userSession = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.full_name || data.user.user_metadata?.full_name || email,
            phone: profile?.phone || '',
            isAdmin: profile?.role === 'admin',
            role: profile?.role || 'customer'
        };
        
        // Store in localStorage for quick access
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        
        return { success: true, user: userSession };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Invalid email or password' };
    }
}

/**
 * Logout current user
 * @returns {Promise<Object>} { success }
 */
export async function logout() {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    return { success: true };
}

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
    }
    
    // Fallback to localStorage
    const user = getFromStorage(CONFIG.STORAGE_KEYS.USER);
    return !!user;
}

/**
 * Get current logged-in user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return null;
        
        // Get full profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        const userSession = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
            phone: profile?.phone || '',
            isAdmin: profile?.role === 'admin',
            role: profile?.role || 'customer',
            avatar_url: profile?.avatar_url || ''
        };
        
        // Update localStorage cache
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        
        return userSession;
    }
    
    // Fallback to localStorage
    return getFromStorage(CONFIG.STORAGE_KEYS.USER);
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} { success, user, error }
 */
export async function updateUserProfile(updates) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        return localStorageUpdateProfile(updates);
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'Not logged in' };
        }
        
        // Update users table
        const { error: updateError } = await supabase
            .from('users')
            .update({
                full_name: updates.name,
                phone: updates.phone,
                address: updates.address
            })
            .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        // Update auth metadata if name changed
        if (updates.name) {
            await supabase.auth.updateUser({
                data: { full_name: updates.name }
            });
        }
        
        // Get updated profile
        const updatedUser = await getCurrentUser();
        
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message || 'Failed to update profile' };
    }
}

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<Object>} { success, message, error }
 */
export async function resetPassword(email) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        return { success: false, error: 'Password reset not available in offline mode' };
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/pages/reset-password.html`
        });
        
        if (error) throw error;
        
        return { 
            success: true, 
            message: 'Password reset email sent! Check your inbox.' 
        };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message || 'Failed to send reset email' };
    }
}

/**
 * Upload profile photo to Supabase Storage
 * @param {File} file 
 * @returns {Promise<Object>} { success, url, error }
 */
export async function uploadProfilePhoto(file) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        return { success: false, error: 'Upload not available' };
    }
    
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Not logged in');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        // Upload to user-avatars bucket
        const { error: uploadError } = await supabase.storage
            .from('user-avatars')
            .upload(fileName, file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(fileName);
        
        // Update user profile with avatar URL
        await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);
        
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Photo upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Listen to auth state changes
 * @param {Function} callback 
 */
export function onAuthStateChange(callback) {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                const user = await getCurrentUser();
                callback(event, user);
            } else {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
                callback(event, null);
            }
        });
    }
}

// ============ LocalStorage Fallback Functions ============

function localStorageLogin(email, password) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const userSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        return { success: true, user: userSession };
    }
    
    return { success: false, error: 'Invalid email or password' };
}

function localStorageRegister(userData) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    
    if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userData,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(CONFIG.STORAGE_KEYS.USER + 's', users);
    
    const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: false
    };
    saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
    
    return { success: true, user: userSession };
}

function localStorageUpdateProfile(updates) {
    const currentUser = getFromStorage(CONFIG.STORAGE_KEYS.USER);
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        saveToStorage(CONFIG.STORAGE_KEYS.USER + 's', users);
        
        const updatedSession = {
            id: users[userIndex].id,
            email: users[userIndex].email,
            name: users[userIndex].name,
            isAdmin: users[userIndex].isAdmin
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, updatedSession);
        
        return { success: true, user: updatedSession };
    }
    
    return { success: false, error: 'User not found' };
}
