/**
 * Order Confirmation JavaScript for VietShop
 * Handles displaying order details and confirmation information
 */

// Base URL for API
let API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Order data
let orderData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize after templates are loaded
    loadTemplates().then(() => {
        // Check if API_BASE_URL is defined in the window object
        if (window.API_BASE_URL) {
            API_BASE_URL = window.API_BASE_URL;
            console.log('Using API_BASE_URL from window:', API_BASE_URL);
        }
        
        // Get order parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        const orderRef = urlParams.get('ref');
        const isOffline = urlParams.get('offline') === 'true';
        
        // Display order reference
        displayOrderReference(orderRef);
        
        // Check if we have an order ID
        if (orderId) {
            // If offline mode, get order from localStorage
            if (isOffline) {
                handleOfflineOrder(orderId, orderRef);
            } else {
                // Get order from API
                fetchOrderDetails(orderId);
            }
        } else {
            // No order ID found
            showErrorMessage('Không tìm thấy thông tin đơn hàng.');
        }
    });
});

/**
 * Load templates for header and footer
 * @returns {Promise} Promise that resolves when templates are loaded
 */
function loadTemplates() {
    return new Promise((resolve) => {
        // Get header and footer container elements
        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');
        
        // Load header template
        fetch('/shop/templates/header.html')
            .then(response => response.text())
            .then(html => {
                headerContainer.innerHTML = html;
                
                // Load footer template
                return fetch('/shop/templates/footer.html');
            })
            .then(response => response.text())
            .then(html => {
                footerContainer.innerHTML = html;
                resolve();
            })
            .catch(error => {
                console.error('Error loading templates:', error);
                resolve(); // Resolve anyway to continue with page
            });
    });
}

/**
 * Display order reference number
 * @param {string} reference - Order reference number
 */
function displayOrderReference(reference) {
    const referenceElements = document.querySelectorAll('.order-reference');
    referenceElements.forEach(el => {
        el.textContent = reference || 'N/A';
    });
}

/**
 * Fetch order details from API
 * @param {string} orderId - Order ID
 */
function fetchOrderDetails(orderId) {
    // Show loading state
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    if (orderDetailsContainer) {
        orderDetailsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
                <p class="mt-2">Đang tải thông tin đơn hàng...</p>
            </div>
        `;
    }
    
    // Get authentication token
    const token = localStorage.getItem('userToken');
    
    // Fetch order details
    fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle different API response formats
        if (data.success && data.data) {
            orderData = data.data.order || data.data;
        } else if (data.status === 'success' && data.data) {
            orderData = data.data.order || data.data;
        } else if (data._id) {
            orderData = data;
        } else {
            throw new Error('Invalid order data format');
        }
        
        // Display order details
        displayOrderDetails(orderData);
    })
    .catch(error => {
        console.error('Error fetching order details:', error);
        showErrorMessage('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
    });
}

/**
 * Handle offline order (get from localStorage)
 * @param {string} orderId - Offline order ID
 * @param {string} reference - Order reference
 */
function handleOfflineOrder(orderId, reference) {
    // Get offline orders from localStorage
    const offlineOrders = JSON.parse(localStorage.getItem('offlineOrders') || '[]');
    
    // Find the order with matching ID
    const order = offlineOrders.find(order => order._id === orderId);
    
    if (order) {
        // Display offline order details
        orderData = order;
        displayOrderDetails(order, true);
    } else {
        // Show error message if order not found
        showErrorMessage('Không tìm thấy thông tin đơn hàng offline.');
    }
}

/**
 * Display order details
 * @param {Object} order - Order data
 * @param {boolean} isOffline - Whether this is an offline order
 */
function displayOrderDetails(order, isOffline = false) {
    // Get containers
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    const customerInfoContainer = document.getElementById('customerInfo');
    const paymentInfoContainer = document.getElementById('paymentInfo');
    const orderItemsContainer = document.getElementById('orderItems');
    const orderSummaryContainer = document.getElementById('orderSummary');
    const offlineNotice = document.getElementById('offlineNotice');
    
    // Show offline notice if applicable
    if (isOffline && offlineNotice) {
        offlineNotice.classList.remove('d-none');
    }
    
    // Update order date
    const orderDateElement = document.getElementById('orderDate');
    if (orderDateElement) {
        const orderDate = order.createdAt 
            ? new Date(order.createdAt).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })
            : 'N/A';
        orderDateElement.textContent = orderDate;
    }
    
    // Display customer info
    if (customerInfoContainer && order.customer) {
        customerInfoContainer.innerHTML = `
            <div class="mb-3">
                <strong>Họ tên:</strong> ${order.customer.fullName || 'N/A'}
            </div>
            <div class="mb-3">
                <strong>Số điện thoại:</strong> ${order.customer.phone || 'N/A'}
            </div>
            <div class="mb-3">
                <strong>Email:</strong> ${order.customer.email || 'N/A'}
            </div>
            <div class="mb-3">
                <strong>Địa chỉ:</strong> ${order.shipping ? order.shipping.address : 'N/A'}
                ${order.shipping ? ', ' + order.shipping.ward : ''}
                ${order.shipping ? ', ' + order.shipping.district : ''}
                ${order.shipping ? ', ' + order.shipping.province : ''}
            </div>
            ${order.shipping && order.shipping.note ? `
                <div class="mb-3">
                    <strong>Ghi chú:</strong> ${order.shipping.note}
                </div>
            ` : ''}
        `;
    }
    
    // Display payment info
    if (paymentInfoContainer && order.payment) {
        const paymentMethod = getPaymentMethodName(order.payment.method);
        const paymentStatus = getPaymentStatusLabel(order.payment.status || 'pending');
        
        paymentInfoContainer.innerHTML = `
            <div class="mb-3">
                <strong>Phương thức thanh toán:</strong> ${paymentMethod}
            </div>
            <div class="mb-3">
                <strong>Trạng thái thanh toán:</strong> ${paymentStatus}
            </div>
        `;
    }
    
    // Display order items
    if (orderItemsContainer && order.items && order.items.length > 0) {
        let itemsHtml = '';
        
        order.items.forEach(item => {
            const productName = item.product ? item.product.name : (item.productName || 'Sản phẩm');
            const productImage = item.product && item.product.images && item.product.images.length > 0 
                ? item.product.images[0] 
                : '/shop/images/product-placeholder.jpg';
            const price = formatCurrency(item.price || 0);
            const total = formatCurrency((item.price || 0) * (item.quantity || 1));
            
            itemsHtml += `
                <div class="d-flex align-items-center mb-3 p-2 border-bottom">
                    <div class="me-3" style="width: 60px; height: 60px;">
                        <img src="${productImage}" alt="${productName}" class="img-fluid rounded">
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${productName}</h6>
                        <div class="small text-muted">
                            <span>${price}</span> × <span>${item.quantity || 1}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        <strong>${total}</strong>
                    </div>
                </div>
            `;
        });
        
        orderItemsContainer.innerHTML = itemsHtml;
    }
    
    // Display order summary
    if (orderSummaryContainer && order.summary) {
        orderSummaryContainer.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>${formatCurrency(order.summary.subtotal || 0)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Giảm giá:</span>
                <span>-${formatCurrency(order.summary.discount || 0)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>${formatCurrency(order.summary.shipping || 0)}</span>
            </div>
            <div class="d-flex justify-content-between fw-bold mt-2 pt-2 border-top">
                <span>Tổng cộng:</span>
                <span class="text-primary">${formatCurrency(order.summary.total || 0)}</span>
            </div>
        `;
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    if (orderDetailsContainer) {
        orderDetailsContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${message}
            </div>
            <div class="text-center mt-4">
                <a href="/shop/products.html" class="btn btn-primary">
                    <i class="bi bi-cart me-1"></i> Tiếp tục mua sắm
                </a>
            </div>
        `;
    }
}

/**
 * Get payment method name
 * @param {string} code - Payment method code
 * @returns {string} Payment method name
 */
function getPaymentMethodName(code) {
    const methods = {
        'cod': 'Thanh toán khi nhận hàng (COD)',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'momo': 'Ví điện tử MoMo',
        'zalopay': 'ZaloPay',
        'credit_card': 'Thẻ tín dụng/ghi nợ'
    };
    
    return methods[code] || code;
}

/**
 * Get payment status label
 * @param {string} status - Payment status
 * @returns {string} Formatted status HTML
 */
function getPaymentStatusLabel(status) {
    const statusMap = {
        'pending': '<span class="badge bg-warning">Chờ thanh toán</span>',
        'paid': '<span class="badge bg-success">Đã thanh toán</span>',
        'failed': '<span class="badge bg-danger">Thanh toán thất bại</span>',
        'refunded': '<span class="badge bg-info">Đã hoàn tiền</span>'
    };
    
    return statusMap[status] || `<span class="badge bg-secondary">${status}</span>`;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, danger)
 */
function showToast(message, type = 'success') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    
    // Create toast container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Generate unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize toast
    const toastInstance = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    
    // Show toast
    toastInstance.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
} 