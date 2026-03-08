// EditProduct.js - Edit product modal form
import { getProductById, updateProduct } from '../services/products.js';
import { showSuccess, showError } from '../components/toast.js';
import { closeModal } from '../components/modal.js';

const CATEGORIES = [
    'Pain Relief', 'Vitamins', 'First Aid', 'Antibiotics',
    'Cold & Flu', 'Digestive Health', 'Skin Care', 'Other'
];

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function categoryOptions(selected) {
    return CATEGORIES.map(cat =>
        `<option value="${cat}" ${selected === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');
}

export function renderEditProductForm(product) {
    return `
        <form id="editProductForm">
            <div class="form-group">
                <label class="form-label">Product Name *</label>
                <input type="text" name="name" class="form-control" value="${escapeHtml(product.name)}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Category *</label>
                <select name="category" class="form-control" required>
                    <option value="">Select Category</option>
                    ${categoryOptions(product.category)}
                </select>
            </div>
            <div class="form-group" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div>
                    <label class="form-label">Price *</label>
                    <input type="number" name="price" class="form-control" step="0.01" min="0" value="${product.price}" required>
                </div>
                <div>
                    <label class="form-label">Stock *</label>
                    <input type="number" name="stock" class="form-control" min="0" value="${product.stock}" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea name="description" class="form-control" rows="3" required>${escapeHtml(product.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Image URL</label>
                <input type="url" name="image_url" class="form-control" value="${escapeHtml(product.image_url || '')}" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                    <input type="checkbox" name="requires_prescription" ${product.requires_prescription ? 'checked' : ''}>
                    Requires Prescription
                </label>
            </div>
            <div style="display:flex;gap:1rem;justify-content:flex-end;margin-top:1rem;">
                <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Product</button>
            </div>
        </form>
    `;
}

export async function initEditProductModal(productId, onSuccess) {
    const product = await getProductById(productId);
    if (!product) {
        showError('Product not found');
        return null;
    }

    const html = renderEditProductForm(product);

    // Attach handlers after modal renders (use setTimeout to wait for DOM)
    setTimeout(() => {
        const form = document.getElementById('editProductForm');
        const cancelBtn = document.getElementById('cancelEditBtn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';

                try {
                    const fd = new FormData(form);
                    const updates = {
                        name: fd.get('name')?.trim(),
                        category: fd.get('category')?.trim(),
                        price: parseFloat(fd.get('price')),
                        stock: parseInt(fd.get('stock')),
                        description: fd.get('description')?.trim(),
                        image_url: fd.get('image_url')?.trim() || null,
                        requires_prescription: fd.get('requires_prescription') === 'on',
                    };

                    if (!updates.name || !updates.category || !updates.description) {
                        throw new Error('Please fill in all required fields');
                    }
                    if (isNaN(updates.price) || updates.price <= 0) {
                        throw new Error('Price must be greater than 0');
                    }
                    if (isNaN(updates.stock) || updates.stock < 0) {
                        throw new Error('Stock cannot be negative');
                    }

                    const updatedProduct = await updateProduct(productId, updates);
                    if (updatedProduct) {
                        showSuccess('Product updated successfully!');
                        closeModal();
                        if (onSuccess) onSuccess();
                    } else {
                        throw new Error('Failed to update product: Product not found');
                    }
                } catch (error) {
                    console.error('Error updating product:', error);
                    showError(error.message || 'Failed to update product');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Product';
                }
            });
        }
    }, 0);

    return html;
}

export default initEditProductModal;
