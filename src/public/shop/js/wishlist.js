/**
 * VietShop - Wishlist Page JavaScript
 * Handles wishlist functionality including loading and managing saved products
 */

// Initialize wishlist page
function initWishlistPage() {
    console.log('Initializing wishlist page...');
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || !userData) {
        // Show login required message
        const wishlistContainer = document.getElementById('wishlistContainer');
        const loginRequired = document.getElementById('loginRequired');
        
        if (wishlistContainer) wishlistContainer.classList.add('d-none');
        if (loginRequired) loginRequired.classList.remove('d-none');
        return;
    }
    
    // Load wishlist data
    loadWishlist();
}

/**
 * Load wishlist from API or localStorage
 */
function loadWishlist() {
    const token = localStorage.getItem('userToken');
    const wishlistContainer = document.getElementById('wishlistContainer');
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    const wishlistEmptyMessage = document.getElementById('wishlistEmpty');
    const wishlistLoading = document.getElementById('wishlistLoading');
    
    if (!wishlistContainer || !wishlistItemsContainer) return;
    
    // Show loading spinner
    if (wishlistLoading) wishlistLoading.classList.remove('d-none');
    if (wishlistEmptyMessage) wishlistEmptyMessage.classList.add('d-none');
    
    // Try to load from API first
    if (token) {
        console.log('Fetching wishlist from API...');
        
        fetch(`${API_BASE_URL}/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch wishlist');
            }
            return response.json();
        })
        .then(data => {
            console.log('Wishlist data fetched successfully:', data);
            
            let wishlistItems = [];
            
            // Handle different API response formats
            if (data.data && Array.isArray(data.data)) {
                wishlistItems = data.data;
            } else if (data.wishlist && Array.isArray(data.wishlist)) {
                wishlistItems = data.wishlist;
            } else if (Array.isArray(data)) {
                wishlistItems = data;
            } else {
                console.warn('Unknown API response format:', data);
                wishlistItems = [];
            }
            
            // Update local storage
            localStorage.setItem('userWishlist', JSON.stringify(wishlistItems));
            
            // Render wishlist items
            renderWishlistItems(wishlistItems);
        })
        .catch(error => {
            console.error('Error fetching wishlist:', error);
            
            // Fall back to localStorage
            const localWishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
            renderWishlistItems(localWishlist);
            
            // Show error toast
            showToast('Không thể tải danh sách yêu thích từ máy chủ.', 'warning');
        })
        .finally(() => {
            if (wishlistLoading) wishlistLoading.classList.add('d-none');
        });
    } else {
        // Use localStorage wishlist if not logged in
        const localWishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
        renderWishlistItems(localWishlist);
        
        if (wishlistLoading) wishlistLoading.classList.add('d-none');
    }
}

/**
 * Render wishlist items in the container
 * @param {Array} items - Array of wishlist items
 */
function renderWishlistItems(items) {
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    const wishlistEmptyMessage = document.getElementById('wishlistEmpty');
    const wishlistContainer = document.getElementById('wishlistContainer');
    
    if (!wishlistItemsContainer) return;
    
    // Clear container
    wishlistItemsContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        // Show empty message
        if (wishlistEmptyMessage) wishlistEmptyMessage.classList.remove('d-none');
        return;
    }
    
    // Make wishlist container visible
    if (wishlistContainer) wishlistContainer.classList.remove('d-none');
    
    // Render each item
    items.forEach(item => {
        // Extract product data
        let product;
        if (item.product) {
            product = item.product;
        } else if (item._id) {
            product = item;
        } else {
            console.warn('Unknown wishlist item format:', item);
            return;
        }
        
        const itemElement = createWishlistItemElement(product);
        wishlistItemsContainer.appendChild(itemElement);
    });
    
    // Setup event listeners for newly created elements
    setupWishlistEventListeners();
}

/**
 * Create HTML element for a wishlist item
 * @param {Object} product - Product data
 * @returns {HTMLElement} - Wishlist item element
 */
function createWishlistItemElement(product) {
    // Create wishlist item container
    const itemElement = document.createElement('div');
    itemElement.className = 'col-md-4 col-sm-6 mb-4';
    itemElement.dataset.productId = product._id;
    
    // Get product details
    const productId = product._id;
    const productName = product.name || 'Sản phẩm không tên';
    const productPrice = product.price || 0;
    const productDiscount = product.discount || 0;
    const productImage = product.images && product.images.length > 0 
        ? `${API_BASE_URL}/img/products/${product.images[0]}` 
        : 'img/placeholder.png';
    
    // Format price
    const formattedPrice = formatCurrency(productPrice);
    const finalPrice = productDiscount > 0 
        ? formatCurrency(productPrice * (1 - productDiscount / 100)) 
        : formattedPrice;
    
    // Create HTML structure
    itemElement.innerHTML = `
        <div class="card product-card wishlist-item">
            <div class="product-img position-relative">
                <a href="product-detail.html?id=${productId}" class="img-container">
                    <img class="card-img-top" src="${productImage}" alt="${productName}" 
                        onerror="this.onerror=null; this.src='img/placeholder.png';">
                </a>
                <div class="product-action">
                    <a class="btn btn-dark" href="javascript:void(0)" data-action="move-to-cart">
                        <i class="fa fa-shopping-cart"></i> Thêm vào giỏ
                    </a>
                    <a class="btn btn-dark remove-wishlist-btn" href="javascript:void(0)" 
                       data-product-id="${productId}" data-action="remove-from-wishlist">
                        <i class="far fa-trash-alt"></i>
                    </a>
                </div>
            </div>
            <div class="card-body text-center p-3">
                <h6 class="mb-2 product-name">
                    <a href="product-detail.html?id=${productId}">${productName}</a>
                </h6>
                <div class="d-flex justify-content-center align-items-center mt-2">
                    ${productDiscount > 0 ? 
                        `<h6 class="text-muted mr-2"><del>${formattedPrice}</del></h6>
                         <h6 class="price">${finalPrice}</h6>` : 
                        `<h6 class="price">${formattedPrice}</h6>`
                    }
                </div>
            </div>
        </div>
    `;
    
    return itemElement;
}

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Setup event listeners for wishlist items
 */
function setupWishlistEventListeners() {
    // Remove from wishlist buttons
    document.querySelectorAll('[data-action="remove-from-wishlist"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            removeFromWishlist(productId);
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('[data-action="move-to-cart"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.closest('.wishlist-item').closest('[data-product-id]').dataset.productId;
            moveToCart(productId);
        });
    });
}

/**
 * Remove product from wishlist
 * @param {string} productId - Product ID to remove
 */
function removeFromWishlist(productId) {
    console.log('Removing product from wishlist:', productId);
    
    const token = localStorage.getItem('userToken');
    const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (token) {
        // Show loading state
        if (itemElement) {
            itemElement.style.opacity = '0.5';
        }
        
        // Call API to remove from wishlist
        fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove from wishlist');
            }
            return response.json();
        })
        .then(() => {
            console.log('Product removed from wishlist successfully');
            
            // Update localStorage wishlist
            const localWishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
            const updatedWishlist = localWishlist.filter(item => {
                const itemId = item.product ? item.product._id : item._id;
                return itemId !== productId;
            });
            
            localStorage.setItem('userWishlist', JSON.stringify(updatedWishlist));
            
            // Update UI
            if (itemElement) {
                itemElement.remove();
            }
            
            // Check if wishlist is empty now
            if (updatedWishlist.length === 0) {
                const wishlistEmptyMessage = document.getElementById('wishlistEmpty');
                if (wishlistEmptyMessage) wishlistEmptyMessage.classList.remove('d-none');
            }
            
            // Show toast
            showToast('Đã xóa sản phẩm khỏi danh sách yêu thích!', 'success');
        })
        .catch(error => {
            console.error('Error removing from wishlist:', error);
            
            // Restore UI
            if (itemElement) {
                itemElement.style.opacity = '1';
            }
            
            // Show toast
            showToast('Không thể xóa sản phẩm khỏi danh sách yêu thích.', 'danger');
        });
    } else {
        // Update localStorage wishlist
        const localWishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
        const updatedWishlist = localWishlist.filter(item => {
            const itemId = item.product ? item.product._id : item._id;
            return itemId !== productId;
        });
        
        localStorage.setItem('userWishlist', JSON.stringify(updatedWishlist));
        
        // Update UI
        if (itemElement) {
            itemElement.remove();
        }
        
        // Check if wishlist is empty now
        if (updatedWishlist.length === 0) {
            const wishlistEmptyMessage = document.getElementById('wishlistEmpty');
            if (wishlistEmptyMessage) wishlistEmptyMessage.classList.remove('d-none');
        }
        
        // Show toast
        showToast('Đã xóa sản phẩm khỏi danh sách yêu thích!', 'success');
    }
}

/**
 * Move product to cart
 * @param {string} productId - Product ID to move to cart
 */
function moveToCart(productId) {
    console.log('Moving product to cart:', productId);
    
    // Get product details from wishlist
    const localWishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
    const product = localWishlist.find(item => {
        const itemId = item.product ? item.product._id : item._id;
        return itemId === productId;
    });
    
    if (!product) {
        showToast('Không tìm thấy thông tin sản phẩm.', 'warning');
        return;
    }
    
    // Extract product data
    const productData = product.product || product;
    
    // Add to cart
    addToCart(productData, 1);
    
    // Show toast
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
}

/**
 * Add product to cart
 * @param {Object} product - Product data
 * @param {number} quantity - Quantity to add
 */
function addToCart(product, quantity) {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
    } else {
        // Add new item
        cart.push({
            product: product,
            quantity: quantity
        });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in UI
    updateCartCount();
}

/**
 * Update cart count in UI
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update all cart counters
    document.querySelectorAll('.cart-count').forEach(counter => {
        counter.textContent = cartCount;
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, danger, warning, info)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set background color based on type
    toast.className = toast.className.replace(/bg-\w+/, '');
    toast.classList.add(`bg-${type}`);
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
} 