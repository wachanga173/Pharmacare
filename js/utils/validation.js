// Validation utilities

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
}

export function validateRequired(value) {
    return value && value.trim() !== '';
}

export function validateLoginForm(data) {
    const errors = [];
    
    if (!validateRequired(data.email)) {
        errors.push('Email is required');
    } else if (!validateEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    if (!validateRequired(data.password)) {
        errors.push('Password is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateRegisterForm(data) {
    const errors = [];
    
    if (!validateRequired(data.name)) {
        errors.push('Name is required');
    }
    
    if (!validateRequired(data.email)) {
        errors.push('Email is required');
    } else if (!validateEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    if (!validateRequired(data.password)) {
        errors.push('Password is required');
    } else if (!validatePassword(data.password)) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateCheckoutForm(data) {
    const errors = [];
    
    if (!validateRequired(data.fullName)) {
        errors.push('Full name is required');
    }
    
    if (!validateRequired(data.address)) {
        errors.push('Address is required');
    }
    
    if (!validateRequired(data.city)) {
        errors.push('City is required');
    }
    
    if (!validateRequired(data.zipCode)) {
        errors.push('ZIP code is required');
    }
    
    if (!validateRequired(data.phone)) {
        errors.push('Phone is required');
    }
    
    if (!validateRequired(data.cardNumber)) {
        errors.push('Card number is required');
    }
    
    if (!validateRequired(data.cardExpiry)) {
        errors.push('Card expiry is required');
    }
    
    if (!validateRequired(data.cardCVV)) {
        errors.push('CVV is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateProductForm(data) {
    const errors = [];
    
    if (!validateRequired(data.name)) {
        errors.push('Product name is required');
    }
    
    if (!data.price || parseFloat(data.price) <= 0) {
        errors.push('Valid price is required');
    }
    
    if (!data.stock || parseInt(data.stock) < 0) {
        errors.push('Valid stock quantity is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
