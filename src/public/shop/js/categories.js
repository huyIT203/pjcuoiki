
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'http://localhost:5000/api';
}

// DOM ready handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Categories.js loaded');
    
    // Debug image loading
    debugImageLoading();
    
    // Update cart count
    updateCartCount();
    
    // Load categories
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (categoriesContainer) {
        console.log('Found categories container, loading categories');
        loadCategories(categoriesContainer);
    } else {
        console.log('Categories container not found');
    }
    
    // Update footer categories
    const footerCategoryList = document.querySelector('.footer .category-links');
    if (footerCategoryList) {
        console.log('Found footer category list, loading footer categories');
        loadFooterCategories(footerCategoryList);
    } else {
        console.log('Footer category list not found');
    }
});

/**
 * Debug image loading issues
 */
function debugImageLoading() {
    console.log('Debugging image loading');
    
    // Check all images on the page
    document.querySelectorAll('img').forEach((img, index) => {
        console.log(`Image ${index}: src=${img.src}, alt=${img.alt}`);
        
        // Add load and error event listeners
        img.addEventListener('load', function() {
            console.log(`Image loaded successfully: ${img.src}`);
        });
        
        img.addEventListener('error', function() {
            console.error(`Failed to load image: ${img.src}`);
            
            // Try to recover with a different path
            if (img.src.includes('/img/')) {
                console.log(`Attempting to fix broken image with /image/ path: ${img.src}`);
                // Replace /img/ with /image/
                const newSrc = img.src.replace('/img/', '/image/');
                img.src = newSrc;
            }
        });
    });
    
    // Check for specific images that might be missing
    const criticalImages = [
        '/img/brand1.png',
        '/img/brand2.png', 
        '/img/brand3.png',
        '/img/brand4.png',
        '/img/placeholder.jpg',
        '/img/electronics.jpg',
        '/img/payment-methods.png'
    ];
    
    criticalImages.forEach(imagePath => {
        const img = new Image();
        img.onload = function() {
            console.log(`Test image loaded successfully: ${imagePath}`);
        };
        img.onerror = function() {
            console.error(`Test image failed to load: ${imagePath}`);
        };
        img.src = imagePath;
    });
}

/**
 * Load categories from API
 * @param {HTMLElement} container - Container for categories
 */
function loadCategories(container) {
    if (!container) return;
    
    // Show loading placeholder
    container.innerHTML = getCategoryPlaceholders(6);
    
    console.log('Starting to fetch categories from:', `${window.API_BASE_URL}/categories`);
    
    // Fetch categories from API
    fetch(`${window.API_BASE_URL}/categories`)
        .then(response => {
            console.log('Categories API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API not available: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Categories API response data:', data);
            container.innerHTML = '';
            
            let categories = [];
            
            if (Array.isArray(data)) {
                console.log('Data is in MongoDB array format');
                // MongoDB format
                categories = data;
            } else if (data.status === 'success' && data.data && data.data.categories) {
                console.log('Data is in older API format');
                // Display categories from older API format
                categories = data.data.categories;
            }
            
            if (categories && categories.length > 0) {
                console.log(`Found ${categories.length} categories to display`);
                // Display categories
                categories.forEach(category => {
                    container.appendChild(createCategoryCard(category));
                });
                
                // Update category product counts
                categories.forEach(category => {
                    updateCategoryProductCount(category._id);
                });
            } else {
                console.log('No categories found in the response');
                // No categories found
                container.innerHTML = '<div class="col-12 text-center py-5"><h3>Không tìm thấy danh mục nào</h3></div>';
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            container.innerHTML = '<div class="col-12 text-center py-5"><h3>Không thể tải danh mục</h3><p>Vui lòng thử lại sau</p></div>';
        });
}

/**
 * Create a category card element
 * @param {Object} category - Category data
 * @returns {HTMLElement} Category card
 */
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6 mb-4';
    
    // Use category image if available, otherwise use a default image
    const categoryImage = category.image || 'img/placeholder.jpg';
    
    card.innerHTML = `
        <div class="category-card h-100">
            <a href="products.html?category=${category._id}" class="text-decoration-none">
                <div class="category-image">
                    <img src="${categoryImage}" alt="${category.name}" class="img-fluid">
                </div>
                <div class="category-info p-3 text-center">
                    <h3 class="category-title">${category.name}</h3>
                    <p class="category-description text-muted">${category.description || 'Explore our products'}</p>
                    <div class="product-count" id="category-count-${category._id}">
                        <span class="placeholder col-4"></span>
                    </div>
                </div>
            </a>
        </div>
    `;
    
    return card;
}

/**
 * Update product count for a category
 * @param {string} categoryId - Category ID
 */
function updateCategoryProductCount(categoryId) {
    const countElement = document.getElementById(`category-count-${categoryId}`);
    if (!countElement) return;
    
    // Get product count for the category
    getCategoryProductCount(categoryId)
        .then(count => {
            countElement.innerHTML = `<span>${count} sản phẩm</span>`;
        })
        .catch(error => {
            console.error(`Error getting product count for category ${categoryId}:`, error);
            countElement.innerHTML = '<span>Đang cập nhật</span>';
        });
}

/**
 * Get product count for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<number>} Promise resolving to product count
 */
function getCategoryProductCount(categoryId) {
    return fetch(`${window.API_BASE_URL}/products/count?category=${categoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API not available');
            }
            return response.json();
        })
        .then(data => {
            if (data && typeof data.count === 'number') {
                return data.count;
            } else if (data && data.data && typeof data.data.count === 'number') {
                return data.data.count;
            }
            return 0;
        })
        .catch(error => {
            console.error(`Error fetching product count for category ${categoryId}:`, error);
            return 0; // Return 0 instead of random number
        });
}

/**
 * Generate placeholder loading elements for categories
 * @param {number} count - Number of placeholders to generate
 * @returns {string} HTML for category placeholders
 */
function getCategoryPlaceholders(count) {
    let html = '';
    
    for (let i = 0; i < count; i++) {
        html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="category-card h-100 placeholder-glow">
                    <div class="placeholder" style="height: 250px;"></div>
                    <div class="p-3 text-center">
                        <h5 class="placeholder-glow">
                            <span class="placeholder col-6"></span>
                        </h5>
                        <p class="placeholder-glow">
                            <span class="placeholder col-8"></span>
                            <span class="placeholder col-4"></span>
                        </p>
                        <div class="placeholder-glow">
                            <span class="placeholder col-3"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Update cart count in the header
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total items in cart
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        
        // Show/hide based on count
        if (totalItems > 0) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
}

/**
 * Load categories for footer
 * @param {HTMLElement} container - Footer category list container
 */
function loadFooterCategories(container) {
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<li><span class="placeholder col-8"></span></li>'.repeat(5);
    
    console.log('Starting to fetch footer categories from:', `${window.API_BASE_URL}/categories`);
    
    // Sample categories based on provided IDs for fallback
    const hardcodedCategories = [
        { _id: '67f6df81596e1d30c9deed03', name: 'Electronics' },
        { _id: '67f6e27080ee475de484dbea', name: 'Animal' },
        { _id: '67f7e425a114d5eb2d1f0e92', name: 'Clothing' },
        { _id: '67f7e45da114d5eb2d1f0e95', name: 'Household' }
    ];
    
    // Fetch categories from API
    fetch(`${window.API_BASE_URL}/categories`)
        .then(response => {
            console.log('Footer categories API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API not available: ${response.status}`);
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
            
            // Add categories to footer (limit to 5)
            if (categories.length > 0) {
                console.log(`Found ${categories.length} categories for footer`);
                categories.slice(0, 5).forEach(category => {
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