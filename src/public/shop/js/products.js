/**
 * Products JavaScript for VietShop
 * Handles product listing, filtering, and product details
 */

// When API fails, use sample data

// Sử dụng biến API_BASE_URL toàn cục từ window object
const PRODUCTS_API_URL = window.API_BASE_URL || 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    updateCartCount();
    
    // Initialize page functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'products.html') {
        initProductsPage();
        
        // Load filter categories
        loadFilterCategories();
        
        // Update footer categories
        const footerCategoryList = document.querySelector('.footer .category-links');
        if (footerCategoryList) {
            loadFooterCategories(footerCategoryList);
        }
    } else if (currentPage === 'product-detail.html') {
        initProductDetailPage();
        
        // Update footer categories
        const footerCategoryList = document.querySelector('.footer .category-links');
        if (footerCategoryList) {
            loadFooterCategories(footerCategoryList);
        }
    } else if (currentPage === 'index.html' || currentPage === '') {
        // Load featured products on homepage
        const featuredProducts = document.getElementById('featuredProducts');
        if (featuredProducts) {
            loadFeaturedProducts();
        }
        
        // Load new products on homepage
        const newProducts = document.getElementById('newProducts');
        if (newProducts) {
            loadNewProducts();
        }
    }
});

/**
 * Get current page name from URL
 * @returns {string} Current page name
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.split('.')[0];
}

/**
 * Initialize products listing page
 */
function initProductsPage() {
    // Get DOM elements
    const productsContainer = document.getElementById('productsContainer');
    const filterForm = document.getElementById('filterForm');
    const sortSelect = document.getElementById('sortSelect');
    const paginationContainer = document.getElementById('pagination');
    const productsHeading = document.getElementById('productsHeading');
    
    if (!productsContainer) return;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const brand = urlParams.get('brand');
    const search = urlParams.get('search');
    const page = parseInt(urlParams.get('page')) || 1;
    const sort = urlParams.get('sort') || '-createdAt';
    
    // Update sort select
    if (sortSelect) {
        sortSelect.value = sort;
        
        // Add event listener for sort change
        sortSelect.addEventListener('change', function() {
            // Update URL and reload products
            const newUrl = updateURLParameter(window.location.href, 'sort', this.value);
            window.location.href = updateURLParameter(newUrl, 'page', 1);
        });
    }
    
    // Update filter form if category is selected
    if (filterForm && category) {
        const categoryCheckbox = filterForm.querySelector(`input[name="category"][value="${category}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }
    
    // Update filter form if brand is selected
    if (filterForm && brand) {
        const brandCheckbox = filterForm.querySelector(`input[name="brand"][value="${brand}"]`);
        if (brandCheckbox) {
            brandCheckbox.checked = true;
        }
    }
    
    // Update search input if search query exists
    if (search) {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.value = search;
        }
    }
    
    // Build API URL
    let apiUrl = `${PRODUCTS_API_URL}/products?page=${page}&limit=12&sort=${sort}`;
    
    if (category) {
        apiUrl += `&category=${category}`;
    }
    
    if (brand) {
        apiUrl += `&brand=${brand}`;
    }
    
    if (search) {
        apiUrl += `&search=${search}`;
    }
    
    // Show loading placeholders
    productsContainer.innerHTML = getProductPlaceholders(12);
    
    // Nếu có danh mục hoặc thương hiệu được chọn, cập nhật tiêu đề
    updateProductsHeading(category, brand, productsHeading);
    
    // Fetch products from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('API not available');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading placeholders
            productsContainer.innerHTML = '';
            
            const products = data.success && data.data ? data.data : data;
            
            if (Array.isArray(products) && products.length > 0) {
                // Render products
                products.forEach(product => {
                    productsContainer.appendChild(createProductCard(product));
                });
                
                // Render pagination
                if (paginationContainer) {
                    const totalPages = data.totalPages || Math.ceil(products.length / 12) || 1;
                    renderPagination(paginationContainer, page, totalPages);
                }
            } else {
                // No products found
                productsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            // Load sample products instead
            loadSampleProducts();
            
            // Show simple pagination for sample data
            if (paginationContainer) {
                renderPagination(paginationContainer, 1, 1);
            }
        });
    
    // Handle filter form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            let queryParams = new URLSearchParams();
            
            // Add selected categories
            const selectedCategories = formData.getAll('category');
            if (selectedCategories.length > 0) {
                queryParams.set('category', selectedCategories.join(','));
            }
            
            // Add selected brands
            const selectedBrands = formData.getAll('brand');
            if (selectedBrands.length > 0) {
                queryParams.set('brand', selectedBrands.join(','));
            }
            
            // Add price range
            const minPrice = formData.get('minPrice');
            const maxPrice = formData.get('maxPrice');
            if (minPrice) {
                queryParams.set('price[gte]', minPrice);
            }
            if (maxPrice) {
                queryParams.set('price[lte]', maxPrice);
            }
            
            // Add rating filter
            const minRating = formData.get('rating');
            if (minRating) {
                queryParams.set('ratingsAverage[gte]', minRating);
            }
            
            // Keep existing sort
            if (sort) {
                queryParams.set('sort', sort);
            }
            
            // Keep existing search
            if (search) {
                queryParams.set('search', search);
            }
            
            // Reset page to 1
            queryParams.set('page', 1);
            
            // Redirect to filtered results
            window.location.href = `products.html?${queryParams.toString()}`;
        });
    }
    
    // Load filter categories and brands
    loadFilterCategories();
    loadFilterBrands();
}

/**
 * Update page heading based on selected category and brand
 */
function updateProductsHeading(categoryId, brandId, headingElement) {
    if (!headingElement) return;
    
    if (!categoryId && !brandId) {
        headingElement.textContent = 'Tất cả sản phẩm';
        return;
    }
    
    if (categoryId) {
        fetch(`${PRODUCTS_API_URL}/categories/${categoryId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể tải danh mục');
                }
                return response.json();
            })
            .then(data => {
                const category = data.data ? data.data.category : data;
                if (category && category.name) {
                    headingElement.textContent = `Sản phẩm ${category.name}`;
                    
                    // Nếu có cả thương hiệu, thêm vào tiêu đề
                    if (brandId) {
                        fetch(`${PRODUCTS_API_URL}/brands/${brandId}`)
                            .then(response => response.json())
                            .then(brandData => {
                                const brand = brandData.data ? brandData.data.brand : brandData;
                                if (brand && brand.name) {
                                    headingElement.textContent += ` - ${brand.name}`;
                                }
                            });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading category name:', error);
            });
    } else if (brandId) {
        fetch(`${PRODUCTS_API_URL}/brands/${brandId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể tải thương hiệu');
                }
                return response.json();
            })
            .then(data => {
                const brand = data.data ? data.data.brand : data;
                if (brand && brand.name) {
                    headingElement.textContent = `Thương hiệu ${brand.name}`;
                }
            })
            .catch(error => {
                console.error('Error loading brand name:', error);
            });
    }
}

/**
 * Apply selected filters
 */
function applyFilters() {
    // Get selected categories
    const selectedCategories = [];
    document.querySelectorAll('.filter-category:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });
    
    // Get selected brands
    const selectedBrands = [];
    document.querySelectorAll('.filter-brand:checked').forEach(checkbox => {
        selectedBrands.push(checkbox.value);
    });
    
    // Build query params
    let queryParams = new URLSearchParams(window.location.search);
    
    // Update category parameter - Xử lý từng danh mục riêng biệt nếu có nhiều lựa chọn
    if (selectedCategories.length === 1) {
        queryParams.set('category', selectedCategories[0]);
    } else if (selectedCategories.length > 1) {
        // Nếu có nhiều danh mục, chỉ lấy danh mục đầu tiên để tránh lỗi ObjectId
        queryParams.set('category', selectedCategories[0]);
    } else {
        queryParams.delete('category');
    }
    
    // Update brand parameter - Xử lý từng thương hiệu riêng biệt nếu có nhiều lựa chọn
    if (selectedBrands.length === 1) {
        queryParams.set('brand', selectedBrands[0]);
    } else if (selectedBrands.length > 1) {
        // Nếu có nhiều thương hiệu, chỉ lấy thương hiệu đầu tiên để tránh lỗi ObjectId
        queryParams.set('brand', selectedBrands[0]);
    } else {
        queryParams.delete('brand');
    }
    
    // Reset page to 1
    queryParams.set('page', '1');
    
    // Redirect to filtered results
    window.location.href = `products.html?${queryParams.toString()}`;
}

/**
 * Initialize product detail page
 */
function initProductDetailPage() {
    // Get DOM elements
    const productDetailContainer = document.getElementById('productDetail');
    const relatedProductsContainer = document.getElementById('relatedProducts');
    
    if (!productDetailContainer) return;
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        // No product ID provided
        productDetailContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Không tìm thấy sản phẩm. Vui lòng kiểm tra lại đường dẫn.
                </div>
            </div>
        `;
        return;
    }
    
    // Show loading placeholder
    productDetailContainer.innerHTML = getProductDetailPlaceholder();
    
    console.log(`Fetching product details for ID: ${productId} from ${PRODUCTS_API_URL}/products/${productId}`);
    
    // Fetch product details from API
    fetch(`${PRODUCTS_API_URL}/products/${productId}`)
        .then(response => {
            console.log('Product API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Product API response data:', data);
            
            // Phân tích dữ liệu từ nhiều định dạng API khác nhau
            let product = null;
            
            // Xử lý định dạng MongoDB trực tiếp (chỉ là một đối tượng với _id)
            if (data && data._id) {
                product = data;
            } 
            // Xử lý định dạng API cũ (data.status = success, data.data.product)
            else if (data && data.status === 'success' && data.data && data.data.product) {
                product = data.data.product;
            }
            // Xử lý định dạng khác (data.product hoặc data.data) 
            else if (data && data.product) {
                product = data.product;
            }
            else if (data && data.data) {
                product = data.data;
            }
            // Xử lý định dạng mảng (nếu API trả về mảng, lấy phần tử đầu tiên)
            else if (Array.isArray(data) && data.length > 0) {
                product = data[0];
            }
            
            if (product && product._id) {
                console.log('Product data parsed successfully:', product);
                
                // Update page title
                document.title = `${product.name} - VietShop`;
                
                // Render product detail
                productDetailContainer.innerHTML = renderProductDetail(product);
                
                // Initialize quantity control
                initQuantityControl();
                
                // Initialize add to cart button
                const addToCartBtn = document.getElementById('addToCartBtn');
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', function() {
                        const quantity = parseInt(document.getElementById('quantity').value) || 1;
                        addToCart(product._id, quantity);
                        
                        // Log action for debugging
                        console.log(`Added product to cart: ${product._id}, quantity: ${quantity}`);
                    });
                }
                
                // Initialize add to wishlist button
                const addToWishlistBtn = document.getElementById('addToWishlistBtn');
                if (addToWishlistBtn) {
                    addToWishlistBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        addToWishlist(product._id);
                    });
                }
                
                // Fetch related products
                if (relatedProductsContainer) {
                    const categoryId = typeof product.category === 'object' ? 
                        product.category._id : 
                        (product.category || product.categoryId || '');
                    
                    if (categoryId) {
                        fetchRelatedProducts(categoryId, product._id, relatedProductsContainer);
                    } else {
                        // Nếu không có category, ẩn phần sản phẩm liên quan
                        const relatedSection = relatedProductsContainer.closest('.related-products');
                        if (relatedSection) {
                            relatedSection.style.display = 'none';
                        }
                    }
                }
                
                // Khởi tạo hình ảnh sản phẩm và gallery nếu có
                initProductImages();
            } else {
                console.error('Invalid product data format:', data);
                // Product not found
                productDetailContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong>Không tìm thấy sản phẩm:</strong> Dữ liệu sản phẩm không hợp lệ hoặc sản phẩm không tồn tại.
                            <br>Vui lòng kiểm tra lại ID sản phẩm: ${productId}
                        </div>
                        <div class="text-center mt-4">
                            <a href="products.html" class="btn btn-primary">Xem tất cả sản phẩm</a>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            productDetailContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <strong>Có lỗi xảy ra khi tải thông tin sản phẩm:</strong> ${error.message || 'Không thể kết nối đến API'}
                        <br>Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.
                    </div>
                    <div class="text-center mt-4">
                        <a href="products.html" class="btn btn-primary">Xem tất cả sản phẩm</a>
                        <button class="btn btn-outline-primary ms-2" onclick="location.reload()">
                            <i class="fas fa-sync-alt me-1"></i> Tải lại trang
                        </button>
                    </div>
                </div>
            `;
            
            // Nếu có relatedProductsContainer, ẩn phần sản phẩm liên quan
            if (relatedProductsContainer) {
                const relatedSection = relatedProductsContainer.closest('.related-products');
                if (relatedSection) {
                    relatedSection.style.display = 'none';
                }
            }
        });
}

/**
 * Initialize product images and gallery
 */
function initProductImages() {
    const mainProductImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.product-gallery .thumbnail');
    
    if (mainProductImage && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Xóa lớp active từ tất cả thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Thêm lớp active vào thumbnail đã nhấp
                this.classList.add('active');
                
                // Cập nhật hình ảnh chính
                mainProductImage.src = this.src;
            });
        });
    }
}

/**
 * Initialize quantity control
 */
function initQuantityControl() {
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    
    if (quantityInput && decreaseBtn && increaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value) || 1;
            quantityInput.value = value + 1;
        });
        
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value) || 1;
            if (value < 1) {
                this.value = 1;
            }
        });
    }
}

/**
 * Fetch related products
 * @param {string} categoryId - Category ID
 * @param {string} currentProductId - Current product ID to exclude
 * @param {HTMLElement} container - Container element
 */
function fetchRelatedProducts(categoryId, currentProductId, container) {
    // Show loading placeholders
    container.innerHTML = getProductPlaceholders(4);
    
    // Fetch related products from API
    fetch(`${PRODUCTS_API_URL}/products?category=${categoryId}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
                container.innerHTML = '';
                
                // Filter out current product
                const relatedProducts = data.filter(product => product._id !== currentProductId);
                
                // Display up to 4 related products
                relatedProducts.slice(0, 4).forEach(product => {
                    container.appendChild(createProductCard(product));
                });
                
                // If no related products after filtering
                if (relatedProducts.length === 0) {
                    container.innerHTML = `
                        <div class="col-12">
                            <p class="text-center">Không có sản phẩm liên quan.</p>
                        </div>
                    `;
                }
            } else {
                container.innerHTML = `
                    <div class="col-12">
                        <p class="text-center">Không có sản phẩm liên quan.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading related products:', error);
            container.innerHTML = `
                <div class="col-12">
                    <p class="text-center">Có lỗi xảy ra khi tải sản phẩm liên quan.</p>
                </div>
            `;
        });
}

/**
 * Render product detail
 * @param {Object} product - Product data
 * @returns {string} HTML for product detail
 */
function renderProductDetail(product) {
    // Format product price
    let priceHtml = '';
    
    if (product.priceDiscount && product.priceDiscount < product.price) {
        const discountPercentage = Math.round((1 - product.priceDiscount / product.price) * 100);
        priceHtml = `
            <span class="old-price me-2">${formatCurrency(product.price)}</span>
            <span class="current-price">${formatCurrency(product.priceDiscount)}</span>
            <span class="badge bg-danger ms-2">-${discountPercentage}%</span>
        `;
    } else {
        priceHtml = `<span class="current-price">${formatCurrency(product.price)}</span>`;
    }
    
    // Get product main image
    const mainImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'img/placeholder.jpg';
    
    // Get product gallery images
    let galleryHtml = '';
    if (product.images && product.images.length > 1) {
        product.images.slice(1).forEach(image => {
            galleryHtml += `
                <div class="col-3 mb-3">
                    <img src="${image}" class="img-fluid thumbnail" alt="${product.name}">
                </div>
            `;
        });
    }
    
    // Get product stock status
    const stockStatus = product.stock > 0 
        ? `<span class="text-success"><i class="fas fa-check-circle me-1"></i>Còn hàng (${product.stock})</span>` 
        : '<span class="text-danger"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>';
    
    // Get product attributes
    let attributesHtml = '';
    if (product.attributes && product.attributes.length > 0) {
        attributesHtml = '<div class="product-attributes mb-4">';
        
        product.attributes.forEach(attr => {
            attributesHtml += `
                <div class="mb-3">
                    <h6 class="mb-2">${attr.name}</h6>
                    <div class="d-flex flex-wrap">
                        <span class="badge bg-secondary me-2 mb-2">${attr.value}</span>
                    </div>
                </div>
            `;
        });
        
        attributesHtml += '</div>';
    }
    
    // Handle category (could be object or id reference)
    let categoryName = 'Không phân loại';
    let categoryId = '';
    if (product.category) {
        if (typeof product.category === 'object' && product.category._id) {
            categoryId = product.category._id;
            categoryName = product.category.name;
        } else if (typeof product.category === 'string') {
            categoryId = product.category;
            // If we only have the ID, use a placeholder name
            categoryName = 'Danh mục';
        }
    }
    
    // Handle brand (could be object or id reference)
    let brandName = 'Không có';
    if (product.brand) {
        if (typeof product.brand === 'object' && product.brand.name) {
            brandName = product.brand.name;
        } else if (typeof product.brand === 'string' && product.brandName) {
            brandName = product.brandName;
        }
    }
    
    return `
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="product-image mb-3">
                    <img src="${mainImage}" class="img-fluid" alt="${product.name}" id="mainProductImage">
                </div>
                <div class="row product-gallery">
                    <div class="col-3 mb-3">
                        <img src="${mainImage}" class="img-fluid thumbnail active" alt="${product.name}">
                    </div>
                    ${galleryHtml}
                </div>
            </div>
            <div class="col-md-6">
                <nav aria-label="breadcrumb" class="mb-3">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Trang chủ</a></li>
                        <li class="breadcrumb-item"><a href="products.html">Sản phẩm</a></li>
                        ${categoryId ? `<li class="breadcrumb-item"><a href="products.html?category=${categoryId}">${categoryName}</a></li>` : ''}
                        <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
                    </ol>
                </nav>
                
                <h1 class="product-title mb-2">${product.name}</h1>
                
                <div class="product-rating mb-3">
                    ${generateRatingStars(product.ratingsAverage || 0)}
                    <span class="rating-count ms-2">(${product.ratingsQuantity || 0} đánh giá)</span>
                </div>
                
                <div class="product-price mb-4">
                    ${priceHtml}
                </div>
                
                <div class="product-meta mb-4">
                    <p><strong>Mã sản phẩm:</strong> ${product._id}</p>
                    <p><strong>Danh mục:</strong> ${categoryId ? `<a href="products.html?category=${categoryId}">${categoryName}</a>` : 'Không phân loại'}</p>
                    <p><strong>Thương hiệu:</strong> ${brandName}</p>
                    <p><strong>Tình trạng:</strong> ${stockStatus}</p>
                </div>
                
                <div class="product-description mb-4">
                    <p>${product.description}</p>
                </div>
                
                ${attributesHtml}
                
                <div class="quantity mb-4">
                    <h6 class="mb-2">Số lượng</h6>
                    <div class="d-flex">
                        <button type="button" class="btn btn-outline-secondary" id="decreaseQuantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="quantity" class="form-control mx-2" value="1" min="1" max="${product.stock}">
                        <button type="button" class="btn btn-outline-secondary" id="increaseQuantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="product-actions d-flex mb-4">
                    <button ${product.stock <= 0 ? 'disabled' : ''} id="addToCartBtn" class="btn btn-primary me-2">
                        <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ hàng
                    </button>
                    <button id="addToWishlistBtn" class="btn btn-outline-danger">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <div class="product-share mb-4">
                    <h6 class="mb-2">Chia sẻ:</h6>
                    <div class="d-flex">
                        <a href="#" class="me-2 social-btn facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="me-2 social-btn twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="me-2 social-btn instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="social-btn pinterest">
                            <i class="fab fa-pinterest"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="product-tabs mt-5">
            <ul class="nav nav-tabs" id="productTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-controls="description" aria-selected="true">Mô tả</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="specifications-tab" data-bs-toggle="tab" data-bs-target="#specifications" type="button" role="tab" aria-controls="specifications" aria-selected="false">Thông số kỹ thuật</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">Đánh giá (${product.ratingsQuantity || 0})</button>
                </li>
            </ul>
            <div class="tab-content p-4 border border-top-0 rounded-bottom" id="productTabContent">
                <div class="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                    <p>${product.description}</p>
                </div>
                <div class="tab-pane fade" id="specifications" role="tabpanel" aria-labelledby="specifications-tab">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <th scope="row">Tên sản phẩm</th>
                                <td>${product.name}</td>
                            </tr>
                            <tr>
                                <th scope="row">Danh mục</th>
                                <td>${categoryId ? categoryName : 'Không phân loại'}</td>
                            </tr>
                            <tr>
                                <th scope="row">Thương hiệu</th>
                                <td>${brandName}</td>
                            </tr>
                            <tr>
                                <th scope="row">Tình trạng</th>
                                <td>${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</td>
                            </tr>
                            <tr>
                                <th scope="row">Số lượng trong kho</th>
                                <td>${product.stock}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                    <div class="reviews-container">
                        <div class="row mb-4">
                            <div class="col-md-4">
                                <div class="text-center p-4">
                                    <h4 class="mb-3">${product.ratingsAverage || 0}/5</h4>
                                    <div class="mb-3">
                                        ${generateRatingStars(product.ratingsAverage || 0)}
                                    </div>
                                    <p>${product.ratingsQuantity || 0} đánh giá</p>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="add-review">
                                    <h5 class="mb-3">Thêm đánh giá của bạn</h5>
                                    <form id="reviewForm">
                                        <div class="mb-3">
                                            <label for="reviewRating" class="form-label">Đánh giá</label>
                                            <select class="form-select" id="reviewRating" required>
                                                <option value="">Chọn đánh giá</option>
                                                <option value="5">5 sao - Rất tuyệt vời</option>
                                                <option value="4">4 sao - Tốt</option>
                                                <option value="3">3 sao - Bình thường</option>
                                                <option value="2">2 sao - Kém</option>
                                                <option value="1">1 sao - Rất kém</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="reviewText" class="form-label">Nhận xét</label>
                                            <textarea class="form-control" id="reviewText" rows="3" required></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">Gửi đánh giá</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="user-reviews">
                            <h5 class="mb-4">Đánh giá từ khách hàng</h5>
                            <div class="text-center py-4">
                                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get product detail placeholder
 * @returns {string} HTML for product detail placeholder
 */
function getProductDetailPlaceholder() {
    return `
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="product-image mb-3 placeholder-image" style="height: 400px;"></div>
                <div class="row">
                    <div class="col-3 mb-3">
                        <div class="placeholder-image" style="height: 80px;"></div>
                    </div>
                    <div class="col-3 mb-3">
                        <div class="placeholder-image" style="height: 80px;"></div>
                    </div>
                    <div class="col-3 mb-3">
                        <div class="placeholder-image" style="height: 80px;"></div>
                    </div>
                    <div class="col-3 mb-3">
                        <div class="placeholder-image" style="height: 80px;"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="placeholder-image" style="height: 20px; width: 70%; margin-bottom: 15px;"></div>
                <div class="placeholder-image" style="height: 30px; width: 90%; margin-bottom: 20px;"></div>
                <div class="placeholder-image" style="height: 20px; width: 40%; margin-bottom: 25px;"></div>
                <div class="placeholder-image" style="height: 30px; width: 50%; margin-bottom: 30px;"></div>
                <div class="placeholder-image" style="height: 100px; width: 100%; margin-bottom: 25px;"></div>
                <div class="placeholder-image" style="height: 50px; width: 80%; margin-bottom: 25px;"></div>
                <div class="placeholder-image" style="height: 50px; width: 100%; margin-bottom: 20px;"></div>
                <div class="placeholder-image" style="height: 40px; width: 60%; margin-bottom: 20px;"></div>
            </div>
        </div>
    `;
}

/**
 * Render pagination
 * @param {HTMLElement} container - Container element
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function renderPagination(container, currentPage, totalPages) {
    // Create pagination HTML
    let paginationHtml = '<ul class="pagination justify-content-center">';
    
    // Previous page button
    paginationHtml += `
        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="${updateURLParameter(window.location.href, 'page', currentPage - 1)}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page buttons
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="${updateURLParameter(window.location.href, 'page', i)}">${i}</a>
            </li>
        `;
    }
    
    // Next page button
    paginationHtml += `
        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
            <a class="page-link" href="${updateURLParameter(window.location.href, 'page', currentPage + 1)}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    paginationHtml += '</ul>';
    
    // Set container HTML
    container.innerHTML = paginationHtml;
}

/**
 * Update URL parameter
 * @param {string} url - URL to update
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 * @returns {string} Updated URL
 */
function updateURLParameter(url, key, value) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(key, value);
    return urlObj.toString();
}

/**
 * Create a product card element
 * @param {Object} product - Product data
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6 mb-4';
    
    // Format price display
    let priceHtml = '';
    if (product.priceDiscount && product.priceDiscount < product.price) {
        const discountPercentage = Math.round((1 - product.priceDiscount / product.price) * 100);
        priceHtml = `
            <span class="old-price me-2">${formatCurrency(product.price)}</span>
            <span class="current-price">${formatCurrency(product.priceDiscount)}</span>
            <span class="badge bg-danger ms-2">-${discountPercentage}%</span>
        `;
    } else {
        priceHtml = `<span class="current-price">${formatCurrency(product.price)}</span>`;
    }
    
    // Get product image (fallback to sample image if none provided)
    const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : '/img/electronics.jpg';
    
    // Get category info (handling both API and sample data formats)
    const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
    const categoryName = typeof product.category === 'object' ? product.category?.name : 'Danh mục';
    
    // Set card HTML with appropriate flags
    const isNew = product.new || (new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const isSale = product.sale || (product.priceDiscount && product.priceDiscount < product.price);
    const isHot = product.hot || product.isFeatured || (product.ratingsAverage >= 4.5 && product.ratingsQuantity > 50);
    
    card.innerHTML = `
        <div class="product-card">
            <div class="product-badge">
                ${isNew ? '<span class="badge bg-success me-1">Mới</span>' : ''}
                ${isSale ? '<span class="badge bg-danger me-1">Giảm giá</span>' : ''}
                ${isHot ? '<span class="badge bg-warning">Hot</span>' : ''}
            </div>
            <div class="product-thumb">
                <a href="product-detail.html?id=${product._id}" class="d-block">
                    <img src="${productImage}" alt="${product.name}" class="img-fluid">
                </a>
                <div class="product-actions">
                    <button class="btn btn-sm btn-outline-primary quick-view-btn" data-id="${product._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary add-to-wishlist-btn" data-id="${product._id}">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary add-to-cart-btn" data-id="${product._id}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category mb-1">
                    <a href="products.html?category=${categoryId || ''}" class="text-muted small">
                        ${categoryName || 'Không phân loại'}
                    </a>
                </div>
                <h3 class="product-title mb-1">
                    <a href="product-detail.html?id=${product._id}" class="text-dark">${product.name}</a>
                </h3>
                <div class="product-rating mb-2">
                    ${generateRatingStars(product.ratingsAverage || 0)}
                    <span class="text-muted ms-1 small">(${product.ratingsQuantity || 0})</span>
                </div>
                <div class="product-price">
                    ${priceHtml}
                </div>
                <div class="product-stock mt-2 small">
                    ${product.stock > 0 
                        ? `<span class="text-success">Còn hàng (${product.stock})</span>` 
                        : '<span class="text-danger">Hết hàng</span>'}
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners for buttons
    const quickViewBtn = card.querySelector('.quick-view-btn');
    const addToWishlistBtn = card.querySelector('.add-to-wishlist-btn');
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    
    if (quickViewBtn) {
        quickViewBtn.addEventListener('click', function() {
            openQuickView(product._id);
        });
    }
    
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', function() {
            addToWishlist(product._id);
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart(product._id, 1);
        });
    }
    
    return card;
}

/**
 * Generate HTML for product rating stars
 * @param {number} rating - Product rating (0-5)
 * @returns {string} HTML for rating stars
 */
function generateRatingStars(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Half star
    if (halfStar) {
        html += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star text-warning"></i>';
    }
    
    return html;
}

/**
 * Format currency with VND
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Generate HTML for product placeholders
 * @param {number} count - Number of placeholders to generate
 * @returns {string} HTML for product placeholders
 */
function getProductPlaceholders(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="product-card placeholder-glow">
                    <div class="placeholder" style="height: 220px; width: 100%;"></div>
                    <div class="product-info">
                        <div class="mb-1">
                            <span class="placeholder col-4"></span>
                        </div>
                        <div class="mb-2">
                            <span class="placeholder col-7"></span>
                            <span class="placeholder col-5"></span>
                        </div>
                        <div class="mb-2">
                            <span class="placeholder col-4"></span>
                        </div>
                        <div class="mb-2">
                            <span class="placeholder col-6"></span>
                        </div>
                        <div>
                            <span class="placeholder col-4"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Add a product to the cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, quantity = 1) {
    console.log(`Adding product to cart: ${productId}, quantity: ${quantity}`);
    
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Log the current cart before changes
    console.log('Current cart before adding:', cart);
    
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingProductIndex >= 0) {
        // Update quantity if product exists
        cart[existingProductIndex].quantity += quantity;
        console.log(`Updated quantity for existing product in cart. New quantity: ${cart[existingProductIndex].quantity}`);
    } else {
        // Add new product to cart
        cart.push({
            productId,
            quantity
        });
        console.log('Added new product to cart');
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Log the updated cart
    console.log('Updated cart saved to localStorage:', cart);
    
    // Update cart count in header
    updateCartCount();
    
    // Show success message
    showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
}

/**
 * Add a product to the wishlist
 * @param {string} productId - Product ID
 */
function addToWishlist(productId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'warning');
        return;
    }
    
    // Send API request to add to wishlist
    fetch(`${PRODUCTS_API_URL}/wishlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Sản phẩm đã được thêm vào danh sách yêu thích!', 'success');
        } else {
            showToast(data.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding to wishlist:', error);
        showToast('Có lỗi xảy ra khi thêm vào danh sách yêu thích. Vui lòng thử lại sau.', 'error');
    });
}

/**
 * Open quick view modal for a product
 * @param {string} productId - Product ID
 */
function openQuickView(productId) {
    // Create quick view modal if it doesn't exist
    let quickViewModal = document.getElementById('quickViewModal');
    
    if (!quickViewModal) {
        quickViewModal = document.createElement('div');
        quickViewModal.className = 'modal fade';
        quickViewModal.id = 'quickViewModal';
        quickViewModal.tabIndex = '-1';
        quickViewModal.setAttribute('aria-hidden', 'true');
        
        quickViewModal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Xem nhanh sản phẩm</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="quickViewContent">
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(quickViewModal);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(quickViewModal);
    modal.show();
    
    // Get modal content element
    const quickViewContent = document.getElementById('quickViewContent');
    
    // Fetch product data
    fetch(`${PRODUCTS_API_URL}/products/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.data && data.data.product) {
                const product = data.data.product;
                
                // Format price
                let priceHtml = '';
                if (product.priceDiscount && product.priceDiscount < product.price) {
                    const discountPercentage = Math.round((1 - product.priceDiscount / product.price) * 100);
                    priceHtml = `
                        <span class="old-price me-2">${formatCurrency(product.price)}</span>
                        <span class="current-price">${formatCurrency(product.priceDiscount)}</span>
                        <span class="badge bg-danger ms-2">-${discountPercentage}%</span>
                    `;
                } else {
                    priceHtml = `<span class="current-price">${formatCurrency(product.price)}</span>`;
                }
                
                // Get product main image
                const mainImage = product.images && product.images.length > 0 
                    ? product.images[0] 
                    : '/img/electronics.jpg';
                
                // Update modal content
                quickViewContent.innerHTML = `
                    <div class="row">
                        <div class="col-md-5">
                            <img src="${mainImage}" alt="${product.name}" class="img-fluid">
                        </div>
                        <div class="col-md-7">
                            <h3 class="mb-3">${product.name}</h3>
                            
                            <div class="mb-3">
                                ${generateRatingStars(product.ratingsAverage || 0)}
                                <span class="ms-2">(${product.ratingsQuantity || 0} đánh giá)</span>
                            </div>
                            
                            <div class="product-price mb-3">
                                ${priceHtml}
                            </div>
                            
                            <div class="product-stock mb-3">
                                ${product.stock > 0 
                                    ? `<span class="text-success"><i class="fas fa-check-circle me-1"></i>Còn hàng (${product.stock})</span>` 
                                    : '<span class="text-danger"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>'}
                            </div>
                            
                            <div class="product-description mb-3">
                                <p>${product.description}</p>
                            </div>
                            
                            <div class="d-flex align-items-center mb-3">
                                <div class="input-group me-3" style="width: 130px;">
                                    <button class="btn btn-outline-secondary" type="button" id="quickViewDecreaseQuantity">-</button>
                                    <input type="number" class="form-control text-center" id="quickViewQuantity" value="1" min="1" max="${product.stock}">
                                    <button class="btn btn-outline-secondary" type="button" id="quickViewIncreaseQuantity">+</button>
                                </div>
                                
                                <button ${product.stock <= 0 ? 'disabled' : ''} class="btn btn-primary me-2" id="quickViewAddToCartBtn">
                                    <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ hàng
                                </button>
                                
                                <button class="btn btn-outline-danger" id="quickViewAddToWishlistBtn">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                            
                            <div class="mb-3">
                                <a href="product-detail.html?id=${product._id}" class="btn btn-outline-primary">
                                    Xem chi tiết
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                
                // Initialize quantity control
                const quantityInput = document.getElementById('quickViewQuantity');
                const decreaseBtn = document.getElementById('quickViewDecreaseQuantity');
                const increaseBtn = document.getElementById('quickViewIncreaseQuantity');
                
                if (quantityInput && decreaseBtn && increaseBtn) {
                    decreaseBtn.addEventListener('click', function() {
                        let value = parseInt(quantityInput.value) || 1;
                        if (value > 1) {
                            quantityInput.value = value - 1;
                        }
                    });
                    
                    increaseBtn.addEventListener('click', function() {
                        let value = parseInt(quantityInput.value) || 1;
                        quantityInput.value = value + 1;
                    });
                    
                    quantityInput.addEventListener('change', function() {
                        let value = parseInt(this.value) || 1;
                        if (value < 1) {
                            this.value = 1;
                        }
                    });
                }
                
                // Add event listeners for buttons
                const addToCartBtn = document.getElementById('quickViewAddToCartBtn');
                const addToWishlistBtn = document.getElementById('quickViewAddToWishlistBtn');
                
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', function() {
                        const quantity = parseInt(document.getElementById('quickViewQuantity').value) || 1;
                        addToCart(product._id, quantity);
                    });
                }
                
                if (addToWishlistBtn) {
                    addToWishlistBtn.addEventListener('click', function() {
                        addToWishlist(product._id);
                    });
                }
            } else {
                quickViewContent.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading product details for quick view:', error);
            quickViewContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại sau.
                </div>
            `;
        });
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
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, error)
 */
function showToast(message, type) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set toast content
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
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function isLoggedIn() {
    const token = localStorage.getItem('userToken');
    const userDataString = localStorage.getItem('userData');
    
    if (!token || !userDataString) {
        return false;
    }
    
    try {
        // Kiểm tra xem userData có hợp lệ không
        const userData = JSON.parse(userDataString);
        
        // Nếu đã lưu userData và có token, xem như đã đăng nhập
        if (userData && token) {
            // Kiểm tra thêm role nếu cần
            const userRole = userData.role || 'user';
            
            // Chỉ cho phép người dùng có role là user, customer hoặc member
            if (userRole === 'user' || userRole === 'customer' || userRole === 'member') {
                return true;
            } else {
                console.warn('User has invalid role for shop:', userRole);
                return false;
            }
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        return false;
    }
    
    return false;
}

// Load sample products if API fails
function loadSampleProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    SAMPLE_PRODUCTS.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
    
    // Update heading
    const productsHeader = document.querySelector('.products-header h4');
    if (productsHeader) {
        productsHeader.textContent = 'Sản phẩm mẫu (API không khả dụng)';
    }
}

// Load featured products on homepage
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    // Show loading placeholders
    container.innerHTML = getProductPlaceholders(4);
    
    // Fetch featured products from API
    fetch(`${PRODUCTS_API_URL}/products?limit=4&featured=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API not available');
            }
            return response.json();
        })
        .then(data => {
            container.innerHTML = '';
            
            if (data.success && data.data && data.data.length > 0) {
                // Render products
                data.data.forEach(product => {
                    container.appendChild(createProductCard(product));
                });
            } else {
                // No products found, use sample data
                throw new Error('No featured products');
            }
        })
        .catch(error => {
            console.error('Error loading featured products:', error);
            container.innerHTML = '';
            
            // Use sample data with hot/sale flags
            const featuredSamples = SAMPLE_PRODUCTS.filter(p => p.hot || p.sale).slice(0, 4);
            featuredSamples.forEach(product => {
                container.appendChild(createProductCard(product));
            });
        });
}

// Load new products on homepage
function loadNewProducts() {
    const container = document.getElementById('newProducts');
    if (!container) return;
    
    // Show loading placeholders
    container.innerHTML = getProductPlaceholders(4);
    
    // Fetch new products from API
    fetch(`${PRODUCTS_API_URL}/products?limit=4&sort=-createdAt`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API not available');
            }
            return response.json();
        })
        .then(data => {
            container.innerHTML = '';
            
            if (data.success && data.data && data.data.length > 0) {
                // Render products
                data.data.forEach(product => {
                    container.appendChild(createProductCard(product));
                });
            } else {
                // No products found, use sample data
                throw new Error('No new products');
            }
        })
        .catch(error => {
            console.error('Error loading new products:', error);
            container.innerHTML = '';
            
            // Use sample data with new flag
            const newSamples = SAMPLE_PRODUCTS.filter(p => p.new).concat(
                SAMPLE_PRODUCTS.filter(p => !p.new).slice(0, 4 - SAMPLE_PRODUCTS.filter(p => p.new).length)
            );
            newSamples.slice(0, 4).forEach(product => {
                container.appendChild(createProductCard(product));
            });
        });
}

/**
 * Load categories for filter
 */
function loadFilterCategories() {
    const categoriesContainer = document.getElementById('filter-categories');
    if (!categoriesContainer) return;

    console.log('Starting to fetch filter categories from:', `${PRODUCTS_API_URL}/categories`);

    // Sample categories based on provided IDs
    const hardcodedCategories = [
        { _id: '67f6df81596e1d30c9deed03', name: 'Electronics' },
        { _id: '67f6e27080ee475de484dbea', name: 'Animal' },
        { _id: '67f7e425a114d5eb2d1f0e92', name: 'Clothing' }
    ];

    fetch(`${PRODUCTS_API_URL}/categories`)
        .then(response => {
            console.log('Filter categories API response status:', response.status);
            if (!response.ok) {
                throw new Error(`Không thể tải danh mục: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Filter categories API response data:', data);
            
            // Get current selected category
            const urlParams = new URLSearchParams(window.location.search);
            const selectedCategory = urlParams.get('category');
            
            let categories = [];
            
            if (Array.isArray(data)) {
                console.log('Filter categories data is in MongoDB array format');
                // MongoDB format
                categories = data;
            } else if (data.status === 'success' && data.data && data.data.categories) {
                console.log('Filter categories data is in older API format');
                // Older API format
                categories = data.data.categories;
            }
            
            console.log('Processed filter categories data:', categories);
            
            if (categories.length > 0) {
                // Xóa placeholder
                categoriesContainer.innerHTML = '';
                
                // Tạo danh sách danh mục
                categories.forEach(category => {
                    const categoryId = category._id || category.id;
                    const isChecked = categoryId === selectedCategory ? 'checked' : '';
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input filter-category" type="checkbox" value="${categoryId}" id="category-${categoryId}" ${isChecked}>
                            <label class="form-check-label" for="category-${categoryId}">
                                ${category.name}
                            </label>
                        </div>
                    `;
                    categoriesContainer.appendChild(li);
                });
            } else {
                console.log('No filter categories found in API response, using hardcoded categories');
                // Sử dụng danh mục cứng khi API không trả về dữ liệu
                categoriesContainer.innerHTML = '';
                
                hardcodedCategories.forEach(category => {
                    const isChecked = category._id === selectedCategory ? 'checked' : '';
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input filter-category" type="checkbox" value="${category._id}" id="category-${category._id}" ${isChecked}>
                            <label class="form-check-label" for="category-${category._id}">
                                ${category.name}
                            </label>
                        </div>
                    `;
                    categoriesContainer.appendChild(li);
                });
            }

            // Thêm event listener cho các checkbox danh mục
            document.querySelectorAll('.filter-category').forEach(checkbox => {
                checkbox.addEventListener('change', applyFilters);
            });
        })
        .catch(error => {
            console.error('Error loading filter categories:', error);
            
            // Sử dụng danh mục cứng khi có lỗi
            console.log('Using hardcoded categories due to error');
            categoriesContainer.innerHTML = '';
            
            const urlParams = new URLSearchParams(window.location.search);
            const selectedCategory = urlParams.get('category');
            
            hardcodedCategories.forEach(category => {
                const isChecked = category._id === selectedCategory ? 'checked' : '';
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input filter-category" type="checkbox" value="${category._id}" id="category-${category._id}" ${isChecked}>
                        <label class="form-check-label" for="category-${category._id}">
                            ${category.name}
                        </label>
                    </div>
                `;
                categoriesContainer.appendChild(li);
            });

            // Thêm event listener cho các checkbox danh mục
            document.querySelectorAll('.filter-category').forEach(checkbox => {
                checkbox.addEventListener('change', applyFilters);
            });
        });
}

/**
 * Load brands for filter
 */
function loadFilterBrands() {
    const brandsContainer = document.getElementById('filter-brands');
    if (!brandsContainer) return;

    console.log('Starting to fetch filter brands from:', `${PRODUCTS_API_URL}/brands`);

    // Sample brands based on provided IDs
    const hardcodedBrands = [
        { _id: '67f6e6d25ccae9e75b9d1cab', name: 'Apple Inc.' },
        { _id: '67f6f3b4782a285d83d3f5e6', name: 'Apple' },
        { _id: '67f7e45da114d5eb2d1f0e95', name: 'Uniqlo' },
        { _id: '67f7e4b5a114d5eb2d1f0e98', name: 'Nike' }
    ];

    fetch(`${PRODUCTS_API_URL}/brands`)
        .then(response => {
            console.log('Brands API response status:', response.status);
            if (!response.ok) {
                throw new Error(`Không thể tải thương hiệu: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Brands API response data:', data);
            
            // Get current selected brand
            const urlParams = new URLSearchParams(window.location.search);
            const selectedBrand = urlParams.get('brand');
            
            let brands = [];
            
            if (Array.isArray(data)) {
                console.log('Brands data is in MongoDB array format');
                // MongoDB format
                brands = data;
            } else if (data.success && data.data && Array.isArray(data.data)) {
                console.log('Brands data is in older API format');
                // Older API format
                brands = data.data;
            }
            
            console.log('Processed brands data:', brands);
            
            if (brands.length > 0) {
                // Xóa placeholder
                brandsContainer.innerHTML = '';
                
                // Tạo danh sách thương hiệu
                brands.forEach(brand => {
                    const brandId = brand._id || brand.id;
                    const isChecked = brandId === selectedBrand ? 'checked' : '';
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input filter-brand" type="checkbox" value="${brandId}" id="brand-${brandId}" ${isChecked}>
                            <label class="form-check-label" for="brand-${brandId}">
                                ${brand.name}
                            </label>
                        </div>
                    `;
                    brandsContainer.appendChild(li);
                });
            } else {
                console.log('No brands found in API response, using hardcoded brands');
                // Sử dụng thương hiệu cứng khi API không trả về dữ liệu
                brandsContainer.innerHTML = '';
                
                hardcodedBrands.forEach(brand => {
                    const isChecked = brand._id === selectedBrand ? 'checked' : '';
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input filter-brand" type="checkbox" value="${brand._id}" id="brand-${brand._id}" ${isChecked}>
                            <label class="form-check-label" for="brand-${brand._id}">
                                ${brand.name}
                            </label>
                        </div>
                    `;
                    brandsContainer.appendChild(li);
                });
            }

            // Thêm event listener cho các checkbox thương hiệu
            document.querySelectorAll('.filter-brand').forEach(checkbox => {
                checkbox.addEventListener('change', applyFilters);
            });
        })
        .catch(error => {
            console.error('Error loading brands:', error);
            
            // Sử dụng thương hiệu cứng khi có lỗi
            console.log('Using hardcoded brands due to error');
            brandsContainer.innerHTML = '';
            
            const urlParams = new URLSearchParams(window.location.search);
            const selectedBrand = urlParams.get('brand');
            
            hardcodedBrands.forEach(brand => {
                const isChecked = brand._id === selectedBrand ? 'checked' : '';
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input filter-brand" type="checkbox" value="${brand._id}" id="brand-${brand._id}" ${isChecked}>
                        <label class="form-check-label" for="brand-${brand._id}">
                            ${brand.name}
                        </label>
                    </div>
                `;
                brandsContainer.appendChild(li);
            });

            // Thêm event listener cho các checkbox thương hiệu
            document.querySelectorAll('.filter-brand').forEach(checkbox => {
                checkbox.addEventListener('change', applyFilters);
            });
        });
}

/**
 * Load footer categories
 * @param {HTMLElement} container - Container element for footer categories
 */
function loadFooterCategories(container) {
    if (!container) return;
    
    console.log('Starting to fetch footer categories from:', `${PRODUCTS_API_URL}/categories`);
    
    // Sample categories based on provided IDs for fallback
    const hardcodedCategories = [
        { _id: '67f6df81596e1d30c9deed03', name: 'Electronics' },
        { _id: '67f6e27080ee475de484dbea', name: 'Animal' },
        { _id: '67f7e425a114d5eb2d1f0e92', name: 'Clothing' },
        { _id: '67f7e45da114d5eb2d1f0e95', name: 'Household' }
    ];
    
    // Load categories from API
    fetch(`${PRODUCTS_API_URL}/categories`)
        .then(response => {
            console.log('Footer categories API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API không khả dụng: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Footer categories API response data:', data);
            
            let categories = [];
            
            if (Array.isArray(data)) {
                console.log('Footer categories data is in MongoDB array format');
                // MongoDB format
                categories = data;
            } else if (data.status === 'success' && data.data && data.data.categories) {
                console.log('Footer categories data is in older API format');
                // Older API format
                categories = data.data.categories;
            }
            
            console.log('Processed footer categories data:', categories);
            
            if (categories.length > 0) {
                // Clear container
                container.innerHTML = '';
                
                // Add categories to footer (limit to 4)
                const categoriesToShow = categories.slice(0, 4);
                console.log(`Displaying ${categoriesToShow.length} footer categories`);
                
                categoriesToShow.forEach(category => {
                    const categoryId = category._id || category.id;
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="products.html?category=${categoryId}" class="text-white">${category.name}</a>`;
                    container.appendChild(li);
                });
            } else {
                console.log('No footer categories found in API response, using hardcoded categories');
                // If API returns no data, use sample categories
                container.innerHTML = '';
                
                hardcodedCategories.forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="products.html?category=${category._id}" class="text-white">${category.name}</a>`;
                    container.appendChild(li);
                });
            }
        })
        .catch(error => {
            console.error('Error loading footer categories:', error);
            
            console.log('Using hardcoded categories due to error');
            // If API fails, use sample categories
            container.innerHTML = '';
            
            hardcodedCategories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="products.html?category=${category._id}" class="text-white">${category.name}</a>`;
                container.appendChild(li);
            });
        });
} 