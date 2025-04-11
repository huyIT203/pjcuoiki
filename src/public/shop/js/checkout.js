/**
 * Checkout JavaScript for VietShop
 * Handles the checkout process
 */

// Base URL for API
let API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Cart and order state
let cartItems = [];
let orderSummary = {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0
};
let orderReference = generateOrderReference();

document.addEventListener('DOMContentLoaded', function() {
    // Check if API_BASE_URL is defined in the window object
    if (window.API_BASE_URL) {
        API_BASE_URL = window.API_BASE_URL;
        console.log('Using API_BASE_URL from window:', API_BASE_URL);
    }
    
    // Load cart data
    loadCart();
    
    // Initialize form
    initForm();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Generate a unique order reference
 * @returns {string} Order reference
 */
function generateOrderReference() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VS${timestamp}${random}`;
}

/**
 * Check if user is authenticated
 */
function checkAuthentication() {
    // Always show checkout form without token check
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.classList.remove('d-none');
    
    // Hide authentication warning
    const authCheck = document.getElementById('authenticationCheck');
    if (authCheck) authCheck.classList.add('d-none');
    
    return true;
}

/**
 * Prefill form with user data
 * @param {Object} userData User data
 */
function prefillFormWithUserData(userData) {
    // If we have email, prefill it
    if (userData.email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = userData.email;
    }
    
    // If we have name, prefill it
    if (userData.name) {
        const nameInput = document.getElementById('fullName');
        if (nameInput) nameInput.value = userData.name;
    }
    
    // If we have phone, prefill it
    if (userData.phone) {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) phoneInput.value = userData.phone;
    }
    
    // If we have address data, prefill it
    if (userData.address) {
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = userData.address;
        
        // Try to prefill province/district/ward if available
        if (userData.province) {
            const provinceSelect = document.getElementById('province');
            if (provinceSelect) {
                provinceSelect.value = userData.province;
                
                // Trigger change event to load districts
                const event = new Event('change');
                provinceSelect.dispatchEvent(event);
                
                // Try to prefill district
                if (userData.district) {
                    setTimeout(() => {
                        const districtSelect = document.getElementById('district');
                        if (districtSelect) {
                            districtSelect.value = userData.district;
                            
                            // Trigger change event to load wards
                            districtSelect.dispatchEvent(event);
                            
                            // Try to prefill ward
                            if (userData.ward) {
                                setTimeout(() => {
                                    const wardSelect = document.getElementById('ward');
                                    if (wardSelect) wardSelect.value = userData.ward;
                                }, 500);
                            }
                        }
                    }, 500);
                }
            }
        }
    }
}

/**
 * Load cart data
 */
function loadCart() {
    try {
        // Get cart from localStorage
        cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            handleEmptyCart();
            return;
        }
        
        // Try to get cart summary from sessionStorage (set in cart.js)
        const cartSummary = JSON.parse(sessionStorage.getItem('cartSummary') || '{}');
        if (cartSummary.subtotal) {
            orderSummary = cartSummary;
        }
        
        // Load order items
        loadOrderItems();
        
        // Update order summary
        updateOrderSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        showToast('Có lỗi xảy ra khi tải giỏ hàng.', 'danger');
    }
}

/**
 * Handle empty cart
 */
function handleEmptyCart() {
    console.log('Cart is empty');
    
    const emptyCartCheck = document.getElementById('emptyCartCheck');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Show empty cart warning
    if (emptyCartCheck) emptyCartCheck.classList.remove('d-none');
    
    // Hide checkout form
    if (checkoutForm) checkoutForm.classList.add('d-none');
}

/**
 * Load order items
 */
function loadOrderItems() {
    const orderItemsContainer = document.getElementById('orderItemsContainer');
    if (!orderItemsContainer) return;
    
    // Show loading spinner
    orderItemsContainer.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <span class="ms-2">Đang tải sản phẩm...</span>
        </div>
    `;
    
    // Create array of promises to fetch product details
    const productPromises = cartItems.map(item => {
        return fetch(`${API_BASE_URL}/products/${item.productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching product: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle different API response formats
                let product = null;
                
                // MongoDB response format: { success: true, data: product }
                if (data.success && data.data) {
                    product = data.data;
                }
                // Alternative format: { status: 'success', data: { product } }
                else if (data.status === 'success' && data.data && data.data.product) {
                    product = data.data.product;
                }
                // Direct product data format (data is the product)
                else if (data._id) {
                    product = data;
                }
                
                if (product && product._id) {
                    return {
                        ...item,
                        product: product
                    };
                }
                
                return null;
            })
            .catch(error => {
                console.error(`Error fetching product ${item.productId}:`, error);
                return null;
            });
    });
    
    // Process all product promises
    Promise.all(productPromises)
        .then(results => {
            // Filter out null results
            const itemsWithProducts = results.filter(item => item !== null);
            
            if (itemsWithProducts.length === 0) {
                orderItemsContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Không thể tải thông tin sản phẩm. Vui lòng quay lại giỏ hàng và thử lại.
                    </div>
                `;
                return;
            }
            
            // Render order items
            let orderItemsHTML = '<div class="order-items">';
            
            itemsWithProducts.forEach(item => {
                const product = item.product;
                const price = product.priceDiscount || product.price;
                const totalPrice = price * item.quantity;
                
                orderItemsHTML += `
                    <div class="order-item d-flex mb-3">
                        <div class="item-image me-2">
                            <img src="${product.images && product.images.length > 0 ? product.images[0] : 'img/placeholder.jpg'}" 
                                alt="${product.name}" class="img-fluid rounded" style="width: 60px; height: 60px; object-fit: cover;">
                        </div>
                        <div class="item-details flex-grow-1">
                            <h6 class="mb-0">${product.name}</h6>
                            <div class="d-flex justify-content-between mt-1">
                                <small class="text-muted">SL: ${item.quantity}</small>
                                <span>${formatCurrency(totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Calculate subtotal if not available from sessionStorage
                if (!orderSummary.subtotal) {
                    orderSummary.subtotal += totalPrice;
                }
            });
            
            orderItemsHTML += '</div>';
            
            // Update container
            orderItemsContainer.innerHTML = orderItemsHTML;
            
            // If we didn't have summary from sessionStorage, calculate shipping and total
            if (!orderSummary.shipping) {
                calculateShipping();
            }
            
            // Update order summary display
            updateOrderSummary();
        })
        .catch(error => {
            console.error('Error loading order items:', error);
            orderItemsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Có lỗi xảy ra khi tải thông tin sản phẩm.
                </div>
            `;
        });
}

/**
 * Calculate shipping cost
 */
function calculateShipping() {
    // Default shipping fee
    orderSummary.shipping = 30000;
    
    // Free shipping for orders over 500,000 VND
    if (orderSummary.subtotal >= 500000) {
        orderSummary.shipping = 0;
    }
    
    // Calculate total
    orderSummary.total = orderSummary.subtotal - orderSummary.discount + orderSummary.shipping;
}

/**
 * Update order summary display
 */
function updateOrderSummary() {
    // Update display
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(orderSummary.subtotal);
    if (discountElement) discountElement.textContent = formatCurrency(orderSummary.discount);
    if (shippingElement) {
        if (orderSummary.shipping === 0 && orderSummary.subtotal > 0) {
            shippingElement.textContent = 'Miễn phí';
            // Add a note about free shipping
            const shippingNoteElement = document.getElementById('shipping-note');
            if (shippingNoteElement) {
                shippingNoteElement.textContent = '(Đơn hàng trên 500.000₫)';
            }
        } else {
            shippingElement.textContent = formatCurrency(orderSummary.shipping);
        }
    }
    if (totalElement) totalElement.textContent = formatCurrency(orderSummary.total);
    
    // Update transfer reference
    const transferReferenceElement = document.getElementById('transferReference');
    if (transferReferenceElement) {
        transferReferenceElement.textContent = orderReference;
    }
}

/**
 * Initialize form and location selectors
 */
function initForm() {
    // Initialize province/district/ward selectors
    initLocationSelectors();
    
    // Show/hide bank info based on payment method
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const bankInfo = document.getElementById('bankInfo');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'bank_transfer' && bankInfo) {
                bankInfo.classList.remove('d-none');
            } else if (bankInfo) {
                bankInfo.classList.add('d-none');
            }
        });
    });
}

/**
 * Initialize location selectors
 */
function initLocationSelectors() {
    // This is a simplified version. In a real app, you'd load provinces/districts/wards from an API
    const provinces = [
        { code: 'HCM', name: 'Hồ Chí Minh' },
        { code: 'HN', name: 'Hà Nội' },
        { code: 'DN', name: 'Đà Nẵng' },
        { code: 'HP', name: 'Hải Phòng' },
        { code: 'CT', name: 'Cần Thơ' }
    ];
    
    // Load provinces
    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        // Clear options
        provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        
        // Add province options
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.code;
            option.textContent = province.name;
            provinceSelect.appendChild(option);
        });
        
        // Province change event
        provinceSelect.addEventListener('change', function() {
            // Here you would load districts based on selected province
            // For demo purposes, we'll add dummy districts
            const districtSelect = document.getElementById('district');
            if (districtSelect) {
                districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
                
                if (this.value) {
                    for (let i = 1; i <= 5; i++) {
                        const option = document.createElement('option');
                        option.value = `${this.value}_D${i}`;
                        option.textContent = `Quận/Huyện ${i}`;
                        districtSelect.appendChild(option);
                    }
                    
                    // Enable district select
                    districtSelect.disabled = false;
                } else {
                    districtSelect.disabled = true;
                }
                
                // Clear and disable ward select
                const wardSelect = document.getElementById('ward');
                if (wardSelect) {
                    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                    wardSelect.disabled = true;
                }
            }
        });
        
        // District change event
        const districtSelect = document.getElementById('district');
        if (districtSelect) {
            districtSelect.addEventListener('change', function() {
                // Here you would load wards based on selected district
                // For demo purposes, we'll add dummy wards
                const wardSelect = document.getElementById('ward');
                if (wardSelect) {
                    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                    
                    if (this.value) {
                        for (let i = 1; i <= 5; i++) {
                            const option = document.createElement('option');
                            option.value = `${this.value}_W${i}`;
                            option.textContent = `Phường/Xã ${i}`;
                            wardSelect.appendChild(option);
                        }
                        
                        // Enable ward select
                        wardSelect.disabled = false;
                    } else {
                        wardSelect.disabled = true;
                    }
                }
            });
        }
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Checkout login button
    const checkoutLoginBtn = document.getElementById('checkoutLoginBtn');
    if (checkoutLoginBtn) {
        checkoutLoginBtn.addEventListener('click', function() {
            // Save redirect URL
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            
            // Redirect to login page
            window.location.href = 'index.html?showLogin=true';
        });
    }
    
    // Apply coupon button
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            applyCoupon();
        });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            placeOrder();
        });
    }
}

/**
 * Apply coupon
 */
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    if (!couponInput || !couponInput.value.trim()) {
        showToast('Vui lòng nhập mã giảm giá.', 'warning');
        return;
    }
    
    const couponCode = couponInput.value.trim();
    
    // Show loading state
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        const originalText = applyCouponBtn.innerHTML;
        applyCouponBtn.disabled = true;
        applyCouponBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        
        // Simulate API call to validate coupon
        setTimeout(() => {
            // Reset button
            applyCouponBtn.disabled = false;
            applyCouponBtn.innerHTML = originalText;
            
            // For demo purposes, check for some sample coupon codes
            if (couponCode.toUpperCase() === 'WELCOME10') {
                orderSummary.discount = Math.round(orderSummary.subtotal * 0.1); // 10% discount
                showToast('Mã giảm giá đã được áp dụng: Giảm 10% tổng đơn hàng.', 'success');
                updateOrderSummary();
            } else if (couponCode.toUpperCase() === 'SHIP0') {
                orderSummary.shipping = 0; // Free shipping
                showToast('Mã giảm giá đã được áp dụng: Miễn phí vận chuyển.', 'success');
                updateOrderSummary();
            } else {
                showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn.', 'danger');
            }
        }, 1000);
    }
}

/**
 * Place order
 */
function placeOrder() {
    // Get form data
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const province = document.getElementById('province').value;
    const district = document.getElementById('district').value;
    const ward = document.getElementById('ward').value;
    const note = document.getElementById('note').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    // Validate required fields
    if (!fullName || !phone || !email || !address || !province || !district || !ward || !paymentMethod) {
        alert('Vui lòng điền đầy đủ thông tin đặt hàng.');
        return;
    }

    // Get cart items
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cartData || cartData.length === 0) {
        alert('Giỏ hàng của bạn đang trống.');
        return;
    }

    // Clear cart data
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cartSummary');
    
    // Show success message
    alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn qua số điện thoại ' + phone);
    
    // Redirect to home page
    window.location.href = 'index.html';
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