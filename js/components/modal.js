// Modal component

let currentModal = null;

export function showModal(title, content, options = {}) {
    // Remove existing modal if any
    closeModal();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    currentModal = modal;
    
    // Event listeners
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeModal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return modal;
}

export function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}

export function confirmModal(title, message) {
    return new Promise((resolve) => {
        const content = `
            <p>${message}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
                <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                <button class="btn btn-primary" id="modal-confirm">Confirm</button>
            </div>
        `;
        
        const modal = showModal(title, content);
        
        const confirmBtn = modal.querySelector('#modal-confirm');
        const cancelBtn = modal.querySelector('#modal-cancel');
        
        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(false);
        });
    });
}
