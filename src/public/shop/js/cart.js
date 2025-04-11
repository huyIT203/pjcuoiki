/**
 * Cart JavaScript for VietShop
 * Handles shopping cart functionality
 */

// Base URL for API
let API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Log the API base URL for debugging
console.log('Cart.js using API_BASE_URL:', API_BASE_URL);

// Cart state
let cartItems = [];
let cartSubtotal = 0;
let cartDiscount = 0;
let shippingFee = 0;
let cartTotal = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Update API_BASE_URL from window if available
    if (window.API_BASE_URL) {
        API_BASE_URL = window.API_BASE_URL;
        console.log('Updated API_BASE_URL from window:', API_BASE_URL);
    }
    
    // Load cart data
    loadCart();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup event listeners for cart functionality
 */
function setupEventListeners() {
    // Apply coupon button
    const applyCouponBtn = document.getElementById('applyCoupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            applyCoupon();
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }
}

/**
 * Load cart data from localStorage
 */
function loadCart() {
    try {
        // Get cart from localStorage
        cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Render cart items
        renderCart();
        
        // Calculate and update cart summary
        updateCartSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        showToast('Có lỗi xảy ra khi tải giỏ hàng.', 'danger');
    }
}

/**
 * Render cart items
 */
function renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartSummarySection = document.getElementById('cartSummarySection');
    
    if (!cartContainer) return;
    
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        if (cartSummarySection) cartSummarySection.classList.add('d-none');
        cartContainer.innerHTML = '';
        return;
    }
    
    // Hide empty cart message, show summary
    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    if (cartSummarySection) cartSummarySection.classList.remove('d-none');
    
    // Show loading placeholder
    cartContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2">Đang tải thông tin giỏ hàng...</p>
        </div>
    `;
    
    // Array to store promises for product data
    const productPromises = cartItems.map(item => {
        console.log(`Fetching product with ID: ${item.productId} from: ${API_BASE_URL}/products/${item.productId}`);
        return fetch(`${API_BASE_URL}/products/${item.productId}`)
            .then(response => {
                console.log(`Product ${item.productId} API response status:`, response.status);
                if (!response.ok) {
                    throw new Error(`API error for product ${item.productId}: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Product ${item.productId} API response data:`, data);
                
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
                
                console.error(`Invalid product data format for ID ${item.productId}:`, data);
                return null;
            })
            .catch(error => {
                console.error(`Error fetching product ${item.productId}:`, error);
                return null;
            });
    });
    
    // Wait for all product data to be fetched
    Promise.all(productPromises)
        .then(results => {
            // Filter out null results
            const cartItemsWithProducts = results.filter(item => item !== null);
            
            console.log('Cart items with products:', cartItemsWithProducts);
            
            if (cartItemsWithProducts.length === 0) {
                if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
                if (cartSummarySection) cartSummarySection.classList.add('d-none');
                cartContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Không thể tải thông tin sản phẩm trong giỏ hàng. Các sản phẩm có thể đã bị xóa hoặc không còn tồn tại.
                    </div>
                    <div class="text-center mt-3">
                        <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                        <button class="btn btn-outline-danger ms-2" onclick="clearCart()">Xóa giỏ hàng</button>
                    </div>
                `;
                return;
            }
            
            // Render cart items
            let cartHTML = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" width="100">Hình ảnh</th>
                                <th scope="col">Sản phẩm</th>
                                <th scope="col" width="150">Đơn giá</th>
                                <th scope="col" width="150">Số lượng</th>
                                <th scope="col" width="150">Thành tiền</th>
                                <th scope="col" width="50"></th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            cartItemsWithProducts.forEach(item => {
                const product = item.product;
                const price = product.priceDiscount || product.price;
                const totalPrice = price * item.quantity;
                const image = product.images && product.images.length > 0 
                    ? product.images[0] 
                    : 'img/placeholder.jpg';
                
                cartHTML += `
                    <tr class="cart-item" data-id="${product._id}">
                        <td>
                            <a href="product-detail.html?id=${product._id}">
                                <img src="${image}" alt="${product.name}" class="img-fluid" style="max-height: 80px;">
                            </a>
                        </td>
                        <td>
                            <h6 class="mb-1"><a href="product-detail.html?id=${product._id}" class="text-dark">${product.name}</a></h6>
                            ${product.variants ? `<small class="text-muted">Phân loại: ${item.variant || 'Mặc định'}</small>` : ''}
                        </td>
                        <td class="text-end">${formatCurrency(price)}</td>
                        <td>
                            <div class="quantity d-flex align-items-center">
                                <button type="button" class="btn btn-sm btn-outline-secondary quantity-btn decrement" data-id="${product._id}">-</button>
                                <input type="number" class="form-control form-control-sm mx-2 quantity-input" min="1" max="99" value="${item.quantity}" data-id="${product._id}">
                                <button type="button" class="btn btn-sm btn-outline-secondary quantity-btn increment" data-id="${product._id}">+</button>
                            </div>
                        </td>
                        <td class="text-end fw-bold">${formatCurrency(totalPrice)}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-id="${product._id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            cartHTML += `
                        </tbody>
                    </table>
                </div>
                <div class="d-flex justify-content-between mt-3">
                    <a href="products.html" class="btn btn-outline-primary">
                        <i class="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm
                    </a>
                    <button type="button" class="btn btn-outline-danger" id="clearCartBtn">
                        <i class="fas fa-trash-alt me-2"></i>Xóa giỏ hàng
                    </button>
                </div>
            `;
            
            // Update cart container
            cartContainer.innerHTML = cartHTML;
            
            // Setup event listeners for cart items
            setupCartItemEvents();
        })
        .catch(error => {
            console.error('Error rendering cart:', error);
            cartContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Có lỗi xảy ra khi tải thông tin giỏ hàng. Vui lòng thử lại sau.
                    <div class="small mt-2">Chi tiết lỗi: ${error.message}</div>
                </div>
                <div class="text-center mt-3">
                    <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                    <button class="btn btn-outline-secondary ms-2" onclick="location.reload()">Tải lại trang</button>
                </div>
            `;
        });
}

/**
 * Setup event listeners for cart items
 */
function setupCartItemEvents() {
    // Quantity increment buttons
    const incrementBtns = document.querySelectorAll('.quantity-btn.increment');
    incrementBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateCartItemQuantity(productId, 1);
        });
    });
    
    // Quantity decrement buttons
    const decrementBtns = document.querySelectorAll('.quantity-btn.decrement');
    decrementBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateCartItemQuantity(productId, -1);
        });
    });
    
    // Quantity input changes
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value) || 1;
            setCartItemQuantity(productId, newQuantity);
        });
    });
    
    // Remove item buttons
    const removeItemBtns = document.querySelectorAll('.remove-item');
    removeItemBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeCartItem(productId);
        });
    });
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            // Confirm before clearing cart
            if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
                clearCart();
            }
        });
    }
}

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} change - Quantity change (positive or negative)
 */
function updateCartItemQuantity(productId, change) {
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex === -1) return;
    
    const newQuantity = cartItems[itemIndex].quantity + change;
    setCartItemQuantity(productId, newQuantity);
}

/**
 * Set cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
function setCartItemQuantity(productId, quantity) {
    // Validate quantity
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    
    // Find item in cart
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex === -1) return;
    
    // Update quantity
    cartItems[itemIndex].quantity = quantity;
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update UI
    const quantityInput = document.querySelector(`.quantity-input[data-id="${productId}"]`);
    if (quantityInput) {
        quantityInput.value = quantity;
    }
    
    // Recalculate and update cart summary
    updateCartSummary();
    
    // Update cart count
    updateCartCount();
}

/**
 * Remove cart item
 * @param {string} productId - Product ID
 */
function removeCartItem(productId) {
    // Remove item from cart
    cartItems = cartItems.filter(item => item.productId !== productId);
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update UI
    const cartItem = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (cartItem) {
        cartItem.classList.add('fade-out');
        setTimeout(() => {
            // Re-render cart
            renderCart();
        }, 300);
    }
    
    // Show toast notification
    showToast('Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
    
    // Update cart count
    updateCartCount();
}

/**
 * Clear all items from cart
 */
function clearCart() {
    console.log('Clearing cart');
    
    // Clear cart items
    cartItems = [];
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update UI
    renderCart();
    
    // Update cart count
    updateCartCount();
    
    // Show message
    showToast('Giỏ hàng đã được xóa!', 'success');
}

/**
 * Apply coupon code
 */
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    if (!couponInput || !couponInput.value.trim()) {
        showToast('Vui lòng nhập mã giảm giá.', 'warning');
        return;
    }
    
    const couponCode = couponInput.value.trim();
    
    // Show loading indicator
    const applyCouponBtn = document.getElementById('applyCoupon');
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
                cartDiscount = Math.round(cartSubtotal * 0.1); // 10% discount
                showToast('Mã giảm giá đã được áp dụng: Giảm 10% tổng đơn hàng.', 'success');
                updateCartSummary();
            } else if (couponCode.toUpperCase() === 'SHIP0') {
                shippingFee = 0; // Free shipping
                showToast('Mã giảm giá đã được áp dụng: Miễn phí vận chuyển.', 'success');
                updateCartSummary();
            } else {
                showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn.', 'danger');
            }
        }, 1000);
    }
}

/**
 * Update cart summary
 */
function updateCartSummary() {
    // Calculate subtotal
    cartSubtotal = 0;
    
    // Get all cart items with their prices from the DOM
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        const priceText = item.querySelector('td:nth-child(3)').textContent;
        const price = parseCurrency(priceText);
        cartSubtotal += price * quantity;
    });
    
    // If no items found in DOM (e.g. when first adding items), calculate from cartItems array
    if (cartItems.length === 0 && window.cartItems && window.cartItems.length > 0) {
        const productPromises = window.cartItems.map(item => 
            fetch(`${API_BASE_URL}/products/${item.productId}`)
                .then(response => response.json())
                .then(data => {
                    const product = data.data || data;
                    const price = product.priceDiscount || product.price;
                    return price * item.quantity;
                })
                .catch(error => {
                    console.error('Error fetching product price:', error);
                    return 0;
                })
        );

        Promise.all(productPromises)
            .then(prices => {
                cartSubtotal = prices.reduce((total, price) => total + price, 0);
                updateSummaryDisplay();
            })
            .catch(error => {
                console.error('Error calculating cart total:', error);
                showToast('Có lỗi xảy ra khi tính tổng giá trị giỏ hàng.', 'danger');
            });
    } else {
        updateSummaryDisplay();
    }
}

/**
 * Update the summary display with calculated values
 */
function updateSummaryDisplay() {
    // Update shipping fee based on subtotal
    if (cartSubtotal >= 500000) {
        shippingFee = 0; // Free shipping for orders over 500,000 VND
    } else if (cartSubtotal > 0) {
        shippingFee = 30000; // Default shipping fee
    } else {
        shippingFee = 0;
    }
    
    // Calculate total
    cartTotal = cartSubtotal - cartDiscount + shippingFee;
    
    // Update UI
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(cartSubtotal);
    if (discountElement) discountElement.textContent = formatCurrency(cartDiscount);
    if (shippingElement) {
        if (shippingFee === 0 && cartSubtotal > 0) {
            shippingElement.textContent = 'Miễn phí';
        } else {
            shippingElement.textContent = formatCurrency(shippingFee);
        }
    }
    if (totalElement) totalElement.textContent = formatCurrency(cartTotal);
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
        showToast('Giỏ hàng của bạn đang trống.', 'warning');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
        // Save current page as redirect after login
        sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
        
        // Show login modal
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.show();
            showToast('Vui lòng đăng nhập để tiếp tục thanh toán.', 'info');
        } else {
            // Fallback if modal is not available
            window.location.href = 'index.html?showLogin=true';
        }
        return;
    }
    
    // Save cart summary information for checkout page
    sessionStorage.setItem('cartSummary', JSON.stringify({
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: shippingFee,
        total: cartTotal
    }));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string (e.g. "123.456 ₫")
 * @returns {number} Value as number
 */
function parseCurrency(currencyString) {
    // Remove currency symbol and thousands separators, then parse
    return parseInt(currencyString.replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * Format number as currency
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
 * Add product to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {string} variant - Product variant (optional)
 */
function addToCart(productId, quantity = 1, variant = null) {
    try {
        // Get current cart
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.productId === productId && 
            (!variant || item.variant === variant)
        );
        
        if (existingItemIndex > -1) {
            // Update quantity if product exists
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if product doesn't exist
            cart.push({
                productId,
                quantity,
                variant
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        cartItems = cart;
        
        // Update UI
        updateCartCount();
        renderCart();
        updateCartSummary(); // Add this line to update cart summary immediately
        
        // Show success message
        showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Có lỗi xảy ra khi thêm vào giỏ hàng.', 'danger');
    }
} 