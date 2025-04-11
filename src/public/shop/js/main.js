/**
 * Main JavaScript file for VietShop
 * Controls the main functionality for the website
 */

// Base URL for API - Khai báo với window để các script khác có thể sử dụng
window.API_BASE_URL = 'http://localhost:5000/api';

// DOM Element References
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });

    // Initialize modals
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
        keyboard: true
    });
    
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'), {
        keyboard: true
    });

    // Modal trigger buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Modal events
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.show();
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.show();
        });
    }

    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.hide();
            registerModal.show();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.hide();
            loginModal.show();
        });
    }

    // Initialize cart count
    updateCartCount();
    
    // Check if user is logged in
    checkUserLoginStatus();

    // Load categories on homepage
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        loadCategories(categoryList);
    }
    
    // Load categories in footer
    const footerCategoryList = document.querySelector('.footer .category-links');
    if (footerCategoryList) {
        loadFooterCategories(footerCategoryList);
    }

    // Load featured products on homepage
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }

    // Load new products on homepage
    if (document.getElementById('newProducts')) {
        loadNewProducts();
    }

    // Search form
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchQuery = this.querySelector('input').value.trim();
            if (searchQuery.length > 0) {
                window.location.href = `products.html?search=${encodeURIComponent(searchQuery)}`;
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value.trim();
            if (isValidEmail(email)) {
                showToast('Đăng ký nhận tin thành công!', 'success');
                this.reset();
            } else {
                showToast('Vui lòng nhập email hợp lệ!', 'danger');
            }
        });
    }
});

/**
 * Check if user is logged in and update UI accordingly
 */
function checkUserLoginStatus() {
    const token = localStorage.getItem('userToken');
    const userProfileNav = document.getElementById('userProfileNav');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userNameElement = document.querySelector('.user-name');

    if (token && userProfileNav) {
        // User is logged in
        userProfileNav.classList.remove('d-none');
        
        if (loginBtn) loginBtn.parentElement.classList.add('d-none');
        if (registerBtn) registerBtn.parentElement.classList.add('d-none');

        // Get user info
        fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token invalid');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.user && userNameElement) {
                userNameElement.textContent = data.data.user.name;
            }
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            // Token is invalid, logout
            logout();
        });
    } else {
        // User is not logged in
        if (userProfileNav) userProfileNav.classList.add('d-none');
        if (loginBtn) loginBtn.parentElement.classList.remove('d-none');
        if (registerBtn) registerBtn.parentElement.classList.remove('d-none');
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    showToast('Đăng xuất thành công!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Load featured products
 */
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featuredProducts');
    if (!featuredProductsContainer) return;

    // Show loading placeholders
    featuredProductsContainer.innerHTML = getProductPlaceholders(4);

    // Fetch featured products from API
    fetch(`${API_BASE_URL}/products?limit=4&featured=true`)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                if (data.data.length === 0) {
                    featuredProductsContainer.innerHTML = `
                        <div class="col-12 text-center">
                            <p>Chưa có sản phẩm nổi bật.</p>
                        </div>
                    `;
                    return;
                }
                
                // Clear loading placeholders
                featuredProductsContainer.innerHTML = '';
                
                // Add product cards
                data.data.forEach(product => {
                    const productCard = createProductCard(product);
                    featuredProductsContainer.appendChild(productCard);
                });
            }
        })
        .catch(error => {
            console.error('Error loading featured products:', error);
            featuredProductsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Có lỗi xảy ra khi tải sản phẩm nổi bật. Vui lòng thử lại sau.
                    </div>
                </div>
            `;
        });
}

/**
 * Load new products
 */
function loadNewProducts() {
    const newProductsContainer = document.getElementById('newProducts');
    if (!newProductsContainer) return;

    // Show loading placeholders
    newProductsContainer.innerHTML = getProductPlaceholders(4);

    // Fetch new products from API
    fetch(`${API_BASE_URL}/products?limit=4&sort=-createdAt`)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                if (data.data.length === 0) {
                    newProductsContainer.innerHTML = `
                        <div class="col-12 text-center">
                            <p>Chưa có sản phẩm mới.</p>
                        </div>
                    `;
                    return;
                }
                
                // Clear loading placeholders
                newProductsContainer.innerHTML = '';
                
                // Add product cards
                data.data.forEach(product => {
                    const productCard = createProductCard(product);
                    newProductsContainer.appendChild(productCard);
                });
            }
        })
        .catch(error => {
            console.error('Error loading new products:', error);
            newProductsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Có lỗi xảy ra khi tải sản phẩm mới. Vui lòng thử lại sau.
                    </div>
                </div>
            `;
        });
}

/**
 * Create a product card element
 * @param {Object} product - Product data
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
    const discountPrice = product.price * (1 - (product.discount || 0) / 100);
    
    // Handle image path
    const defaultImage = 'img/product-placeholder.jpg';
    let imagePath = defaultImage;
    
    if (product.image) {
        if (product.image.startsWith('http')) {
            // Nếu là URL đầy đủ
            imagePath = product.image;
        } 
        else if (product.image.startsWith('/uploads')) {
            // Nếu là ảnh upload từ API
            imagePath = `${API_BASE_URL}${product.image}`;
        }
        else {
            // Nếu là tên file
            imagePath = `img/products/${product.image}`;
        }
    }
    
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-6 mb-4';
    
    col.innerHTML = `
        <div class="card product-card h-100">
            <div class="position-relative">
                <img src="${imagePath}" class="card-img-top" alt="${product.name}" 
                    onerror="this.onerror=null; this.src='${defaultImage}';">
                ${product.discount ? `
                    <div class="product-discount badge bg-danger position-absolute top-0 end-0 m-2">
                        -${product.discount}%
                    </div>
                ` : ''}
                <div class="product-actions position-absolute bottom-0 start-50 translate-middle-x mb-2">
                    <button class="btn btn-light btn-sm me-2" onclick="addToCart('${product._id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn btn-light btn-sm" onclick="addToWishlist('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title product-title">
                    <a href="product-detail.html?id=${product._id}" class="text-dark text-decoration-none">
                        ${product.name}
                    </a>
                </h5>
                <div class="product-rating mb-2">
                    ${generateRatingStars(product.rating || 0)}
                </div>
                <div class="product-price mt-auto">
                    ${product.discount ? `
                        <span class="text-decoration-line-through text-muted me-2">
                            ${formatCurrency(product.price)}
                        </span>
                    ` : ''}
                    <span class="text-primary fw-bold">
                        ${formatCurrency(discountPrice)}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

/**
 * Generate HTML for product placeholders
 * @param {number} count - Number of placeholders to generate
 * @returns {string} HTML for product placeholders
 */
function getProductPlaceholders(count) {
    let placeholders = '';
    for (let i = 0; i < count; i++) {
        placeholders += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="product-card">
                    <div class="product-img placeholder-image" style="height: 250px;"></div>
                    <div class="product-info">
                        <div class="placeholder-image" style="height: 15px; width: 100px; margin-bottom: 10px;"></div>
                        <div class="placeholder-image" style="height: 20px; width: 80%; margin-bottom: 10px;"></div>
                        <div class="placeholder-image" style="height: 15px; width: 120px; margin-bottom: 10px;"></div>
                        <div class="placeholder-image" style="height: 24px; width: 100px;"></div>
                    </div>
                </div>
            </div>
        `;
    }
    return placeholders;
}

/**
 * Generate rating stars based on rating value
 * @param {number} rating - Rating value (0-5)
 * @returns {string} HTML for rating stars
 */
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let stars = '';
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Add product to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, quantity = 1) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            productId,
            quantity
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in UI
    updateCartCount();
    
    // Show success message
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
}

/**
 * Add product to wishlist
 * @param {string} productId - Product ID
 */
function addToWishlist(productId) {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'warning');
        return;
    }

    // Get current wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Check if product already exists in wishlist
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showToast('Đã thêm sản phẩm vào danh sách yêu thích!', 'success');
    } else {
        showToast('Sản phẩm đã có trong danh sách yêu thích!', 'info');
    }
}

/**
 * Update cart count in UI
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, danger, warning, info)
 */
function showToast(message, type = 'success') {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('id', toastId);
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Load categories for homepage
 * @param {HTMLElement} container - Container element
 */
function loadCategories(container) {
    if (!container) return;
    
    // Hiển thị loading placeholders
    container.innerHTML = `
        <div class="col-md-4 mb-4">
            <div class="category-card placeholder-glow">
                <div class="placeholder" style="height: 200px;"></div>
                <div class="p-3 text-center">
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-3 mt-2"></span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="category-card placeholder-glow">
                <div class="placeholder" style="height: 200px;"></div>
                <div class="p-3 text-center">
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-3 mt-2"></span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="category-card placeholder-glow">
                <div class="placeholder" style="height: 200px;"></div>
                <div class="p-3 text-center">
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-3 mt-2"></span>
                </div>
            </div>
        </div>
    `;
    
    // Sample categories based on provided IDs for fallback
    const hardcodedCategories = [
        { _id: '67f6df81596e1d30c9deed03', name: 'Electronics', image: '/image/electronics.jpg', productCount: 20 },
        { _id: '67f6e27080ee475de484dbea', name: 'Animal', image: '/image/b1.jpg', productCount: 15 },
        { _id: '67f7e425a114d5eb2d1f0e92', name: 'Clothing', image: '/image/b2.jpg', productCount: 10 }
    ];
    
    // Tải danh mục từ API
    fetch(`${API_BASE_URL}/categories`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API không khả dụng');
            }
            return response.json();
        })
        .then(data => {
            // Xóa placeholders
            container.innerHTML = '';
            
            let categories = [];
            
            if (Array.isArray(data)) {
                // MongoDB format
                categories = data;
            } else if (data.status === 'success' && data.data && data.data.categories) {
                // Older API format
                categories = data.data.categories;
            }
            
            if (categories.length > 0) {
                // Hiển thị danh mục từ API
                categories.forEach(category => {
                    container.appendChild(createCategoryCard(category));
                });
            } else {
                // Sử dụng dữ liệu mẫu nếu không có dữ liệu
                hardcodedCategories.forEach(category => {
                    container.appendChild(createCategoryCard(category));
                });
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            // Sử dụng dữ liệu mẫu nếu API lỗi
            hardcodedCategories.forEach(category => {
                container.appendChild(createCategoryCard(category));
            });
        });
}

/**
 * Create category card element
 * @param {Object} category - Category data from MongoDB
 * @returns {HTMLElement} Category card element
 */
function createCategoryCard(category) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    // Sử dụng hình ảnh từ danh mục nếu có, hoặc sử dụng hình ảnh mặc định
    const image = category.image || '/img/electronics.jpg';
    const categoryId = category._id || '';
    const productCount = category.productCount || 0;
    
    col.innerHTML = `
        <div class="category-card">
            <div class="category-img">
                <img src="${image}" alt="${category.name}" class="img-fluid">
                <div class="overlay">
                    <a href="products.html?category=${categoryId}" class="btn btn-primary">Xem sản phẩm</a>
                </div>
            </div>
            <div class="category-info p-3 text-center">
                <h3>${category.name}</h3>
                <p>${productCount} sản phẩm</p>
            </div>
        </div>
    `;
    
    return col;
}

/**
 * Load categories in footer
 * @param {HTMLElement} container - Container element for footer categories
 */
function loadFooterCategories(container) {
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<li><span class="placeholder col-8"></span></li>'.repeat(5);
    
    console.log('Starting to fetch footer categories from:', `${API_BASE_URL}/categories`);
    
    // Sample categories based on provided IDs for fallback
    const hardcodedCategories = [
        { _id: '67f6df81596e1d30c9deed03', name: 'Electronics' },
        { _id: '67f6e27080ee475de484dbea', name: 'Animal' },
        { _id: '67f7e425a114d5eb2d1f0e92', name: 'Clothing' },
        { _id: '67f7e45da114d5eb2d1f0e95', name: 'Household' }
    ];
    
    // Fetch categories from API
    fetch(`${API_BASE_URL}/categories`)
        .then(response => {
            console.log('Footer categories API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API không khả dụng: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Footer categories API response data:', data);
            container.innerHTML = '';
            
            let categories = [];
            
            if (Array.isArray(data)) {
                console.log('Footer data is in MongoDB array format');
                // MongoDB format
                categories = data;
            } else if (data.status === 'success' && data.data && data.data.categories) {
                console.log('Footer data is in older API format');
                // Older API format
                categories = data.data.categories;
            }
            
            // Add categories to footer (limit to 4)
            if (categories.length > 0) {
                console.log(`Found ${categories.length} categories for footer`);
                categories.slice(0, 4).forEach(category => {
                    const categoryId = category._id || category.id;
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="products.html?category=${categoryId}" class="text-white">${category.name}</a>`;
                    container.appendChild(li);
                });
            } else {
                console.log('No categories for footer, using hardcoded ones');
                hardcodedCategories.forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="products.html?category=${category._id}" class="text-white">${category.name}</a>`;
                    container.appendChild(li);
                });
            }
            
            if (categories.length === 0 && !hardcodedCategories.length) {
                container.innerHTML = '<li class="text-white">Chưa có danh mục</li>';
            }
        })
        .catch(error => {
            console.error('Error loading footer categories:', error);
            
            // Use hardcoded categories on error
            console.log('Using hardcoded categories due to error');
            container.innerHTML = '';
            
            hardcodedCategories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="products.html?category=${category._id}" class="text-white">${category.name}</a>`;
                container.appendChild(li);
            });
        });
} 