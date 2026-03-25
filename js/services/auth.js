// Authentication service - manages user authentication with Supabase and localStorage fallback
import { getFromStorage, saveToStorage } from '../utils/storage.js';
import { hashPassword } from '../utils/helpers.js';

const PROFILE_BUCKET = 'profile';
const PROFILE_SIGNED_URL_TTL = 60 * 60;

// Get Supabase client
export function getSupabaseClient() {
    if (typeof window !== 'undefined' && window.supabase && window.CONFIG) {
        return window.supabase.createClient(
            window.CONFIG.SUPABASE.URL, 
            window.CONFIG.SUPABASE.ANON_KEY,
            {
                auth: {
                    redirectTo: window.CONFIG.SITE_URL || 'https://wachanga173.github.io/Pharmacare'
                }
            }
        );
    }
    return null;
}

async function resolveAvatarUrl(supabase, avatarValue) {
    if (!avatarValue) return '';

    if (/^https?:\/\//i.test(avatarValue)) {
        return avatarValue;
    }

    const storagePath = avatarValue.startsWith(`${PROFILE_BUCKET}/`)
        ? avatarValue.substring(PROFILE_BUCKET.length + 1)
        : avatarValue;

    const { data, error } = await supabase.storage
        .from(PROFILE_BUCKET)
        .createSignedUrl(storagePath, PROFILE_SIGNED_URL_TTL);

    if (error) {
        console.error('Avatar signed URL error:', error);
        return '';
    }

    return data?.signedUrl || '';
}

// Register new user with Supabase Auth
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
        
        if (!authData.user) {
            throw new Error('User registration failed - no user data returned');
        }
        
        // Create user profile in public.users table with role
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: userData.email,
                full_name: userData.name,
                phone: userData.phone || '',
                role: userData.role || 'customer', // Default to customer if not specified
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (profileError) {
            console.error('Profile creation error:', profileError);
            // If profile creation fails, we should delete the auth user to maintain consistency
            await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
            throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
        
        const userRole = profileData?.role || 'customer';
        
        return { 
            success: true, 
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: userData.name,
                role: userRole,
                isAdmin: userRole === 'admin'
            },
            message: 'Registration successful! Please check your email to verify your account.'
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'Registration failed' };
    }
}

// Login user with Supabase Auth
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
        
        const avatarPath = profile?.avatar_url || '';
        const avatarUrl = await resolveAvatarUrl(supabase, avatarPath);

        // Always check role from public.users
        const userRole = profile?.role || 'customer';
        const userSession = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.full_name || data.user.user_metadata?.full_name || email,
            phone: profile?.phone || '',
            role: userRole,
            isAdmin: userRole === 'admin',
            avatar_path: avatarPath,
            avatar_url: avatarUrl
        };
        // Store in localStorage for quick access
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        return { success: true, user: userSession };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Invalid email or password' };
    }
}

// Logout current user
export async function logout() {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    return { success: true };
}

// Check if user is logged in
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

// Get current logged-in user
export async function getCurrentUser() {
    const supabase = getSupabaseClient();
    
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return null;
        
        // Get full profile
        const cachedUser = getFromStorage(CONFIG.STORAGE_KEYS.USER) || {};

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        const avatarPath = profile?.avatar_url || cachedUser.avatar_path || '';
        const resolvedAvatarUrl = await resolveAvatarUrl(supabase, avatarPath);
        const avatarUrl = resolvedAvatarUrl || cachedUser.avatar_url || '';

        // Always check role from public.users
        const userRole = profile?.role || 'customer';
        const userSession = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
            phone: profile?.phone || '',
            role: userRole,
            isAdmin: userRole === 'admin',
            avatar_path: avatarPath,
            avatar_url: avatarUrl
        };
        // Update localStorage cache
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        return userSession;
    }
    
    // Fallback to localStorage
    return getFromStorage(CONFIG.STORAGE_KEYS.USER);
}

// Update user profile
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

// Send password reset email
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

// Upload profile photo to Supabase Storage
export async function uploadProfilePhoto(file) {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
        return { success: false, error: 'Upload not available' };
    }
    
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Not logged in');
        
        const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // Upload to private profile bucket
        const { error: uploadError } = await supabase.storage
            .from(PROFILE_BUCKET)
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type || 'image/jpeg'
            });
        
        if (uploadError) throw uploadError;

        // Persist storage path in profile so a fresh signed URL can be generated per session.
        const { error: profileUpdateError } = await supabase
            .from('users')
            .update({ avatar_url: filePath })
            .eq('id', user.id);

        if (profileUpdateError) throw profileUpdateError;

        const { data: signedData, error: signedUrlError } = await supabase.storage
            .from(PROFILE_BUCKET)
            .createSignedUrl(filePath, PROFILE_SIGNED_URL_TTL);

        if (signedUrlError) throw signedUrlError;
        
        const signedUrl = signedData?.signedUrl || '';
        const cachedUser = getFromStorage(CONFIG.STORAGE_KEYS.USER);

        if (cachedUser) {
            saveToStorage(CONFIG.STORAGE_KEYS.USER, {
                ...cachedUser,
                avatar_path: filePath,
                avatar_url: signedUrl
            });
        }

        return { success: true, url: signedUrl };
    } catch (error) {
        console.error('Photo upload error:', error);
        return { success: false, error: error.message };
    }
}

// Listen to auth state changes
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

// LocalStorage Fallback Functions

async function localStorageLogin(email, password) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    const hashedPassword = await hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
        const userRole = user.role || (user.isAdmin ? 'admin' : 'customer');
        const userSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole,
            isAdmin: userRole === 'admin'
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, userSession);
        return { success: true, user: userSession };
    }
    
    return { success: false, error: 'Invalid email or password' };
}

async function localStorageRegister(userData) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USER + 's') || [];
    
    if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' };
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    const userRole = userData.role || 'customer';
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userData,
        password: hashedPassword,  // Store hashed password
        role: userRole,
        isAdmin: userRole === 'admin',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(CONFIG.STORAGE_KEYS.USER + 's', users);
    
    const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: userRole,
        isAdmin: userRole === 'admin'
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
        
        const userRole = users[userIndex].role || (users[userIndex].isAdmin ? 'admin' : 'customer');
        const updatedSession = {
            id: users[userIndex].id,
            email: users[userIndex].email,
            name: users[userIndex].name,
            role: userRole,
            isAdmin: userRole === 'admin'
        };
        saveToStorage(CONFIG.STORAGE_KEYS.USER, updatedSession);
        
        return { success: true, user: updatedSession };
    }
    
    return { success: false, error: 'User not found' };
}
