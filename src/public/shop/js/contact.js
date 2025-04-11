/**
 * Contact JavaScript for VietShop
 * Handles contact form functionality
 */

// Base URL for API

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handling
    initContactForm();
    
    // Check user login status if function exists
    if (typeof checkUserLoginStatus === 'function') {
        checkUserLoginStatus();
    }
});

/**
 * Initialize contact form
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validate form
        if (!validateContactForm(name, email, subject, message)) {
            return;
        }
        
        // Create contact data
        const contactData = {
            name,
            email,
            phone,
            subject,
            message
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang gửi...';
        
        // Send contact request (simulated)
        setTimeout(() => {
            // In a real application, you would send data to an API
            // fetch(`${API_BASE_URL}/contact`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(contactData)
            // })
            // .then(response => response.json())
            // .then(data => { ... })
            
            // For demo purposes, show success message
            showToast('Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể!', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }, 1500);
    });
}

/**
 * Validate contact form
 * @param {string} name - Name value
 * @param {string} email - Email value
 * @param {string} subject - Subject value
 * @param {string} message - Message value
 * @returns {boolean} - Is form valid
 */
function validateContactForm(name, email, subject, message) {
    // Check required fields
    if (!name || !email || !subject || !message) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'warning');
        return false;
    }
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast('Vui lòng nhập email hợp lệ.', 'warning');
        return false;
    }
    
    // Validate message length
    if (message.length < 10) {
        showToast('Nội dung tin nhắn quá ngắn. Vui lòng mô tả chi tiết hơn.', 'warning');
        return false;
    }
    
    return true;
}

/**
 * Show toast notification if function doesn't exist in auth.js
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, danger)
 */
if (typeof showToast !== 'function') {
    function showToast(message, type = 'success') {
        // Check if toast container exists, otherwise create it
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastElement);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();
        
        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }
} 