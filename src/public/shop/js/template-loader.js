/**
 * Template Loader for VietShop
 * 
 * This script handles loading header and footer templates into pages.
 * It also manages authentication state reflection in the header.
 */

// Templates URLs
const TEMPLATES = {
    header: 'templates/header.html',
    footer: 'templates/footer.html'
};

/**
 * Load all templates (header and footer)
 * @returns {Promise} Promise that resolves when all templates are loaded
 */
function loadTemplates() {
    return Promise.all([
        loadTemplate('header', 'header-container'),
        loadTemplate('footer', 'footer-container')
    ]);
}

/**
 * Load a specific template into a container
 * @param {String} templateName - Name of the template to load ('header' or 'footer')
 * @param {String} containerId - ID of the container element where the template will be inserted
 * @returns {Promise} Promise that resolves when the template is loaded
 */
function loadTemplate(templateName, containerId) {
    return new Promise((resolve, reject) => {
        if (!TEMPLATES[templateName]) {
            console.error(`Template ${templateName} not found`);
            reject(`Template ${templateName} not found`);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            reject(`Container ${containerId} not found`);
            return;
        }

        // Add loading indicator
        container.innerHTML = `<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div></div>`;

        // Fetch the template
        fetch(TEMPLATES[templateName])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                
                // After header is loaded, update the authentication state
                if (templateName === 'header') {
                    updateAuthUI();
                    
                    // Setup auth event listeners
                    setupAuthListeners();
                }
                
                // Dispatch event that template was loaded
                const event = new CustomEvent('templateLoaded', {
                    detail: {
                        templateName: templateName,
                        containerId: containerId
                    }
                });
                document.dispatchEvent(event);
                
                resolve();
            })
            .catch(error => {
                console.error(`Error loading template ${templateName}:`, error);
                container.innerHTML = `<div class="alert alert-danger">Failed to load ${templateName}. Please refresh the page.</div>`;
                reject(error);
            });
    });
}

/**
 * Setup authentication listeners for login, register, and logout buttons
 */
function setupAuthListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });
    }
    
    // Logout buttons (top bar and dropdown)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    const navLogoutBtn = document.getElementById('navLogoutBtn');
    if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Switch between login and register
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
            }
            
            setTimeout(() => {
                const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                registerModal.show();
            }, 500);
        });
    }
    
    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) {
                registerModal.hide();
            }
            
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            }, 500);
        });
    }
}

/**
 * Update the authentication UI elements in the header
 * This reflects whether the user is logged in or not
 */
function updateAuthUI() {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');
    const userLoginContainer = document.getElementById('userLoginContainer');
    const userProfileContainer = document.getElementById('userProfileContainer');
    const userProfileNav = document.getElementById('userProfileNav');
    
    if (!userLoginContainer || !userProfileContainer) {
        console.warn('Authentication UI containers not found in the header');
        return;
    }
    
    if (userToken && userName) {
        // User is logged in
        userLoginContainer.classList.add('d-none');
        userProfileContainer.classList.remove('d-none');
        
        if (userProfileNav) {
            userProfileNav.classList.remove('d-none');
        }
        
        // Update user name
        const userNameElement = document.getElementById('headerUserName');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
        
        // Update all user name displays
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = userName;
        });
        
        // Update cart count if function exists
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    } else {
        // User is not logged in
        userLoginContainer.classList.remove('d-none');
        userProfileContainer.classList.add('d-none');
        
        if (userProfileNav) {
            userProfileNav.classList.add('d-none');
        }
    }
}

/**
 * Logout the user
 */
function logout() {
    // Clear auth data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    
    // Update UI
    updateAuthUI();
    
    // Show toast notification
    if (typeof showToast === 'function') {
        showToast('Đăng xuất thành công', 'success');
    } else {
        alert('Đăng xuất thành công');
    }
    
    // Redirect to home page if not already there
    if (window.location.pathname !== '/index.html' && 
        window.location.pathname !== '/' && 
        window.location.pathname !== '/shop/index.html' && 
        window.location.pathname !== '/shop/') {
        window.location.href = 'index.html';
    }
}

/**
 * Template Loader for VietShop
 * Cung cấp các template HTML cơ bản cho header, footer và các phần khác
 * để tái sử dụng trên tất cả các trang
 */

const TemplateLoader = {
    // Template cho phần header (phần đầu của trang)
    headerHTML: `
        <!-- Top Bar -->
        <div class="top-bar bg-primary text-white py-2">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <ul class="list-inline mb-0">
                            <li class="list-inline-item me-3"><i class="fas fa-phone-alt me-2"></i>+84 123 456 789</li>
                            <li class="list-inline-item"><i class="fas fa-envelope me-2"></i>info@vietshop.com</li>
                        </ul>
                    </div>
                    <div class="col-md-6 text-end">
                        <ul class="list-inline mb-0">
                            <li class="list-inline-item me-3"><a href="#" class="text-white" id="loginBtn"><i class="fas fa-user me-2"></i>Đăng nhập</a></li>
                            <li class="list-inline-item"><a href="#" class="text-white" id="registerBtn"><i class="fas fa-user-plus me-2"></i>Đăng ký</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Navigation -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <h1 class="h3 mb-0 text-primary">VietShop</h1>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Trang chủ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="products.html">Sản phẩm</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="categories.html">Danh mục</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="about.html">Giới thiệu</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="contact.html">Liên hệ</a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <div class="search-box me-3">
                            <form class="d-flex">
                                <input class="form-control me-2" type="search" placeholder="Tìm kiếm sản phẩm..." aria-label="Search">
                                <button class="btn btn-outline-primary" type="submit"><i class="fas fa-search"></i></button>
                            </form>
                        </div>
                        <div class="cart position-relative me-3">
                            <a href="cart.html" class="text-decoration-none">
                                <i class="fas fa-shopping-cart fs-5 text-dark"></i>
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">0</span>
                            </a>
                        </div>
                        <div class="user-profile d-none" id="userProfileNav">
                            <div class="dropdown">
                                <a href="#" class="text-decoration-none text-dark dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">
                                    <i class="fas fa-user-circle fs-5 me-1"></i>
                                    <span class="user-name">Tài khoản</span>
                                </a>
                                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Hồ sơ</a></li>
                                    <li><a class="dropdown-item" href="orders.html"><i class="fas fa-shopping-bag me-2"></i>Đơn hàng</a></li>
                                    <li><a class="dropdown-item" href="wishlist.html"><i class="fas fa-heart me-2"></i>Yêu thích</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `,

    // Template cho phần footer (phần cuối của trang)
    footerHTML: `
        <div class="container">
            <div class="row">
                <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                    <h5 class="text-uppercase">VietShop</h5>
                    <p>Cửa hàng trực tuyến hàng đầu Việt Nam. Cung cấp sản phẩm chất lượng với giá cả hợp lý.</p>
                    <ul class="list-inline social-links">
                        <li class="list-inline-item"><a href="#" class="text-white"><i class="fab fa-facebook-f"></i></a></li>
                        <li class="list-inline-item"><a href="#" class="text-white"><i class="fab fa-twitter"></i></a></li>
                        <li class="list-inline-item"><a href="#" class="text-white"><i class="fab fa-instagram"></i></a></li>
                        <li class="list-inline-item"><a href="#" class="text-white"><i class="fab fa-youtube"></i></a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                    <h5 class="text-uppercase">Danh mục</h5>
                    <ul class="list-unstyled category-links">
                        <!-- Categories will be loaded dynamically -->
                        <li><a href="products.html?category=electronics" class="text-white">Điện tử</a></li>
                        <li><a href="products.html?category=clothing" class="text-white">Thời trang</a></li>
                        <li><a href="products.html?category=home" class="text-white">Đồ gia dụng</a></li>
                        <li><a href="products.html?category=beauty" class="text-white">Làm đẹp</a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                    <h5 class="text-uppercase">Thông tin</h5>
                    <ul class="list-unstyled">
                        <li><a href="about.html" class="text-white">Giới thiệu</a></li>
                        <li><a href="#" class="text-white">Chính sách bảo mật</a></li>
                        <li><a href="#" class="text-white">Điều khoản & Điều kiện</a></li>
                        <li><a href="contact.html" class="text-white">Liên hệ</a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                    <h5 class="text-uppercase">Liên hệ</h5>
                    <ul class="list-unstyled contact-info">
                        <li><i class="fas fa-map-marker-alt me-2"></i>123 Đường ABC, Quận 1, TP.HCM</li>
                        <li><i class="fas fa-phone-alt me-2"></i>+84 123 456 789</li>
                        <li><i class="fas fa-envelope me-2"></i>info@vietshop.com</li>
                        <li><i class="fas fa-clock me-2"></i>Thứ Hai - Chủ Nhật: 9:00 - 21:00</li>
                    </ul>
                </div>
            </div>
            <hr class="my-4">
            <div class="row">
                <div class="col-md-6">
                    <p class="mb-0">&copy; 2025 VietShop. Tất cả quyền được bảo lưu.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <img src="img/payment-methods.png" alt="Phương thức thanh toán" class="payment-methods">
                </div>
            </div>
        </div>
    `,

    // Khởi tạo templates
    init: function() {
        // Tải header nếu sử dụng cấu trúc trang truyền thống (không sử dụng template loader mới)
        const headerContainer = document.querySelector('header');
        if (headerContainer) {
            headerContainer.innerHTML = this.headerHTML;
        }

        // Tải footer nếu sử dụng cấu trúc trang truyền thống (không sử dụng template loader mới)
        const footerContainer = document.querySelector('footer');
        if (footerContainer && footerContainer.classList.contains('footer')) {
            footerContainer.innerHTML = this.footerHTML;
        }

        // Đánh dấu trang hiện tại trong menu
        this.highlightCurrentPage();
        
        console.log('Templates loaded');
    },

    // Đánh dấu trang hiện tại trong menu
    highlightCurrentPage: function() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            if (currentPath.endsWith(linkPath) || 
                (currentPath.includes('/shop/') && linkPath === 'index.html' && currentPath.endsWith('/shop/'))) {
                link.classList.add('active');
            }
        });
    }
};

// Khởi tạo templates khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo templates
    TemplateLoader.init();
    
    // Tìm kiếm các containers đặc biệt nếu có
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    // Tải template tự động nếu containers tồn tại (hỗ trợ trang đã được cập nhật sang định dạng mới)
    if (headerContainer) {
        loadTemplate('header', 'header-container');
    }
    
    if (footerContainer) {
        loadTemplate('footer', 'footer-container');
    }
}); 