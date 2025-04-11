/**
 * Authentication JavaScript for VietShop
 * Handles user login, registration, and authentication
 */

// Sử dụng biến API_BASE_URL từ window object (được khai báo trong main.js)
// Nếu chưa được khai báo, khởi tạo với giá trị mặc định
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'http://localhost:5000/api';
}

// Khai báo hàm kiểm tra trạng thái đăng nhập toàn cục
// Để các file khác có thể gọi hàm này mà không cần đợi DOM load xong
window.checkUserLoginStatus = function() {
    const token = localStorage.getItem('userToken');
    const userDataString = localStorage.getItem('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    
    console.log('Checking login status:', 
        token ? 'Token exists' : 'No token', 
        userData ? `User data: ${userData.name || 'unnamed'}` : 'No user data'
    );
    
    // Nếu có token nhưng không có dữ liệu người dùng, cố gắng tải lại dữ liệu
    if (token && !userData) {
        console.log('Token exists but no user data, attempting to fetch user data');
        fetchUserData(token);
        return; // Dừng việc kiểm tra ở đây, sẽ được gọi lại sau khi lấy dữ liệu người dùng
    }
    
    // Get UI elements
    const userProfileNav = document.getElementById('userProfileNav');
    const topBarAuthSection = document.querySelector('.col-md-6.text-end');
    const userNameElements = document.querySelectorAll('.user-name');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userLoginContainer = document.getElementById('userLoginContainer');
    const userProfileContainer = document.getElementById('userProfileContainer');
    const cartCountBadge = document.querySelector('.cart-count');
    
    if (token && userData) {
        // User is logged in
        console.log('User is logged in, updating UI elements');
        
        // Update user navigation visibility
        if (userProfileNav) {
            userProfileNav.classList.remove('d-none');
        }
        
        // Hide login/register buttons
        if (loginBtn && loginBtn.parentElement) {
            loginBtn.parentElement.classList.add('d-none');
        }
        
        if (registerBtn && registerBtn.parentElement) {
            registerBtn.parentElement.classList.add('d-none');
        }
        
        // Show user profile container if exists
        if (userProfileContainer) {
            userProfileContainer.classList.remove('d-none');
        }
        
        // Hide login container if exists
        if (userLoginContainer) {
            userLoginContainer.classList.add('d-none');
        }
        
        // Update all user name displays
        if (userNameElements && userNameElements.length > 0) {
            userNameElements.forEach(element => {
                element.textContent = userData.name || 'User';
            });
        }
        
        // Save user name in localStorage for other scripts
        localStorage.setItem('userName', userData.name || 'User');
        
        // Update cart count if function exists
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        } else if (cartCountBadge) {
            // Try to get cart from localStorage
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
                const cartCount = cart.items ? cart.items.length : 0;
                cartCountBadge.textContent = cartCount.toString();
                cartCountBadge.style.display = cartCount > 0 ? 'inline-block' : 'none';
            } catch (e) {
                console.error('Error updating cart count:', e);
                cartCountBadge.style.display = 'none';
            }
        }
    } else {
        // User is not logged in
        console.log('User is not logged in, updating UI elements');
        
        // Hide user navigation
        if (userProfileNav) {
            userProfileNav.classList.add('d-none');
        }
        
        // Show login/register buttons
        if (loginBtn && loginBtn.parentElement) {
            loginBtn.parentElement.classList.remove('d-none');
        }
        
        if (registerBtn && registerBtn.parentElement) {
            registerBtn.parentElement.classList.remove('d-none');
        }
        
        // Hide user profile container if exists
        if (userProfileContainer) {
            userProfileContainer.classList.add('d-none');
        }
        
        // Show login container if exists
        if (userLoginContainer) {
            userLoginContainer.classList.remove('d-none');
        }
        
        // Clear user name in localStorage
        localStorage.removeItem('userName');
    }
    
    // Add event listener to logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // Remove any existing listeners to prevent duplicates
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
};

/**
 * Logout the user and clear stored data
 */
window.logout = function() {
    console.log('Logging out user');
    
    // Clear authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    
    // Optionally clear shopping cart data
    // localStorage.removeItem('cart');
    
    // Show logout success message
    showToast('Đã đăng xuất thành công', 'success');
    
    // Update UI to reflect logged-out state
    window.checkUserLoginStatus();
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
};

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Switch between login and register modals
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
                setTimeout(() => {
                    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                    registerModal.show();
                }, 500);
            }
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) {
                registerModal.hide();
                setTimeout(() => {
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                }, 500);
            }
        });
    }
    
    // Handle login button click
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }
    
    // Handle register button click
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Validate inputs
            if (!email || !password) {
                showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
                return;
            }
            
            // Create login request
            const loginData = {
                email,
                password
            };
            
            // Show loading indicator
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
            
            // Kiểm tra xem có nên dùng chế độ test login không
            const useTestLogin = !window.API_BASE_URL || window.API_BASE_URL.includes('localhost');
            
            if (useTestLogin) {
                console.log('API server not available, using test login');
                // Sử dụng test login khi API không khả dụng
                testLogin(email, password)
                    .then(data => {
                        console.log('Test login response:', data);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        
                        if (data.token) {
                            // Lưu token và dữ liệu người dùng
                            localStorage.setItem('userToken', data.token);
                            localStorage.setItem('userData', JSON.stringify(data.data.user));
                            console.log('Test user data saved:', data.data.user);
                            
                            // Hiển thị thông báo
                            showToast('Đăng nhập thành công (Chế độ dùng thử)!', 'success');
                            
                            // Đóng modal
                            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                            if (loginModal) {
                                loginModal.hide();
                            }
                            
                            // Cập nhật giao diện
                            window.checkUserLoginStatus();
                            
                            // QUAN TRỌNG: Không tải lại trang
                            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                            if (redirectUrl && redirectUrl !== window.location.href) {
                                sessionStorage.removeItem('redirectAfterLogin');
                                setTimeout(() => {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            }
                        }
                    })
                    .catch(error => {
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        
                        console.error('Test login error:', error);
                        showToast(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'danger');
                    });
            } else {
                // Sử dụng API thực tế
                // Show global loader
                showLoadingSpinner();
                
                // Send login request to MongoDB API
                console.log('Logging in with MongoDB API at:', `${window.API_BASE_URL}/users/login`);
                
                fetch(`${window.API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                })
                .then(response => {
                    console.log('Login API response status:', response.status);
                    
                    // Always hide loading spinner after receiving response
                    hideLoadingSpinner();
                    
                    // Handle common HTTP error codes
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Email hoặc mật khẩu không chính xác');
                        } else if (response.status === 404) {
                            throw new Error('Không tìm thấy tài khoản với email này');
                        } else if (response.status === 429) {
                            throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút');
                        } else if (response.status >= 500) {
                            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
                        } else {
                            throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
                        }
                    }
                    
                    return response.json();
                })
                .then(data => {
                    console.log('Login API response data:', data);
                    
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    
                    // Check for error in response data
                    if (data.error || data.success === false) {
                        const errorMessage = data.message || data.error || 'Đăng nhập thất bại';
                        showToast(errorMessage, 'danger');
                        throw new Error(errorMessage);
                    }
                    
                    // MongoDB API response format: { success: true, token, data: { user } }
                    if (data.success && data.token && data.data && data.data.user) {
                        const token = data.token;
                        const userData = data.data.user;
                        
                        // Store token and user data in localStorage
                        localStorage.setItem('userToken', token);
                        localStorage.setItem('userData', JSON.stringify(userData));
                        
                        console.log('MongoDB user logged in successfully:', userData);
                        
                        // Check user role - restrict admin access to shop
                        if (userData.role === 'admin') {
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('userData');
                            showToast('Tài khoản admin không thể truy cập giao diện cửa hàng', 'danger');
                            return;
                        }
                        
                        // Show success message
                        showToast('Đăng nhập thành công!', 'success');
                        
                        // Close login modal
                        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                        if (loginModal) {
                            loginModal.hide();
                        }
                        
                        // Update UI based on login state
                        window.checkUserLoginStatus();
                        
                        // Handle redirect if necessary
                        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                        if (redirectUrl && redirectUrl !== window.location.href) {
                            sessionStorage.removeItem('redirectAfterLogin');
                            setTimeout(() => {
                                window.location.href = redirectUrl;
                            }, 1000);
                        } else {
                            // Reload the current page to reflect logged-in state
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    } else {
                        console.error('Invalid response format from MongoDB API');
                        showToast('Định dạng phản hồi không hợp lệ từ máy chủ', 'danger');
                        showLoginFailureDialog(email);
                    }
                })
                .catch(error => {
                    console.error('Login error:', error);
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    
                    // Hide loading spinner if still visible
                    hideLoadingSpinner();
                    
                    // Show error message
                    showToast(error.message || 'Đăng nhập thất bại', 'danger');
                    
                    // Show login failure dialog
                    showLoginFailureDialog(email);
                });
            }
        });
    }
    
    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Mật khẩu xác nhận không khớp!', 'warning');
                return;
            }
            
            if (!agreeTerms) {
                showToast('Vui lòng đồng ý với điều khoản & điều kiện!', 'warning');
                return;
            }
            
            // Create registration request - Cập nhật định dạng dữ liệu để phù hợp với MongoDB
            const registerData = {
                name,
                email,
                password,
                passwordConfirm: confirmPassword,
                role: 'user'  // Tự động gán role là 'user' cho người dùng mới đăng ký
            };
            
            console.log('Đang đăng ký tài khoản với dữ liệu:', {...registerData, password: '***', passwordConfirm: '***'});
            
            // Show loading indicator
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
            
            // Kiểm tra xem có nên dùng chế độ test register không
            const useTestRegister = !window.API_BASE_URL || window.API_BASE_URL.includes('localhost') && false; // Tắt test register để gọi API thực
            
            if (useTestRegister) {
                console.log('API server not available, using test register');
                // Sử dụng test register khi API không khả dụng
                testRegister(registerData)
                    .then(data => {
                        console.log('Test register response:', data);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        
                        if (data.token) {
                            // Lưu token và dữ liệu người dùng
                            localStorage.setItem('userToken', data.token);
                            localStorage.setItem('userData', JSON.stringify(data.data.user));
                            console.log('Test user data saved:', data.data.user);
                            
                            // Hiển thị thông báo
                            showToast('Đăng ký thành công (Chế độ dùng thử)!', 'success');
                            
                            // Đóng modal
                            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                            if (registerModal) {
                                registerModal.hide();
                            }
                            
                            // Cập nhật giao diện
                            window.checkUserLoginStatus();
                            
                            // QUAN TRỌNG: Không tải lại trang
                            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                            if (redirectUrl && redirectUrl !== window.location.href) {
                                sessionStorage.removeItem('redirectAfterLogin');
                                setTimeout(() => {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            }
                        }
                    })
                    .catch(error => {
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        
                        console.error('Test register error:', error);
                        showToast(error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!', 'danger');
                    });
            } else {
                // Sử dụng API thực tế để đăng ký tài khoản mới
                console.log('Đang gửi yêu cầu đăng ký đến API:', window.API_BASE_URL);
                
                // Hiển thị thông báo đang xử lý
                showToast('Đang đăng ký tài khoản...', 'info');
                
                // Send registration request
                tryDirectSignup(registerData);
            }
        });
    }
    
    // Kiểm tra đường dẫn URL để show login nếu cần
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showLogin') === 'true') {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.show();
        }
    }
    
    // Fetch user data from API
    function fetchUserData(token) {
        console.log('Fetching user data with token:', token);
        fetch(`${window.API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('User data API response status:', response.status);
            if (!response.ok) {
                throw new Error(`Token invalid or API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('User data API response:', data);
            let userData = null;
            
            // Handle MongoDB API response format
            if (data.success && data.data) {
                // Standard MongoDB API format
                userData = data.data;
                console.log('User data in MongoDB API format (success + data)');
            } else if (data.data && data.data.user) {
                // Alternative format with nested user object
                userData = data.data.user;
                console.log('User data in nested format (data.data.user)');
            } else if (data.user) {
                // Simple format with direct user object
                userData = data.user;
                console.log('User data in simple format (data.user)');
            } else if (data._id) {
                // Direct user object format
                userData = data;
                console.log('User data is direct user object');
            } else {
                console.error('Unknown API response format:', data);
                throw new Error('Invalid user data format');
            }
            
            // Verify that we have valid user data
            if (userData && (userData._id || userData.id)) {
                console.log('User data fetched successfully:', userData);
                
                // Check user role
                const userRole = userData.role || 'user';
                console.log('User role:', userRole);
                
                // Don't allow admin users in the shop interface
                if (userRole === 'admin') {
                    console.error('Admin users cannot access the shop interface');
                    showToast('Tài khoản admin không thể truy cập cửa hàng', 'danger');
                    logout();
                    return;
                }
                
                // Ensure we have a name field
                if (!userData.name) {
                    if (userData.username) {
                        userData.name = userData.username;
                    } else if (userData.email) {
                        userData.name = userData.email.split('@')[0];
                    } else {
                        userData.name = 'User';
                    }
                }
                
                // Store user data in localStorage
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Update UI to reflect logged-in state
                window.checkUserLoginStatus();
            } else {
                console.error('Invalid user data format:', data);
                showToast('Không thể tải thông tin người dùng', 'warning');
                logout();
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            showToast('Lỗi xác thực: ' + error.message, 'danger');
            // Clear invalid token and update UI
            logout();
        });
    }
    
    // Kiểm tra ngay khi trang tải xong
    window.checkUserLoginStatus();
    
    // Thêm code để tự động hiển thị hộp thoại đăng nhập thủ công nếu debug_login=true trong URL
    const debugUrlParams = new URLSearchParams(window.location.search);
    if (debugUrlParams.get('debug_login') === 'true') {
        setTimeout(() => {
            if (typeof bootstrap !== 'undefined') {
                const manualLoginModal = new bootstrap.Modal(document.getElementById('manualLoginModal'));
                if (manualLoginModal) {
                    manualLoginModal.show();
                    // Nếu có sẵn data trong URL, tự động điền vào
                    const jsonData = debugUrlParams.get('data');
                    if (jsonData) {
                        try {
                            const decodedData = decodeURIComponent(jsonData);
                            const mongodbData = document.getElementById('mongodbData');
                            if (mongodbData) {
                                mongodbData.value = decodedData;
                            }
                        } catch (error) {
                            console.error('Error decoding JSON data from URL:', error);
                        }
                    }
                }
            }
        }, 1000);
    }
    
    // Nếu đã đăng nhập (có token) nhưng chưa có dữ liệu người dùng, thử lấy thông tin
    const token = localStorage.getItem('userToken');
    const userDataString = localStorage.getItem('userData');
    if (token && !userDataString) {
        fetchUserData(token);
    }
});

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, danger)
 */
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

/**
 * Update cart count in UI
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Calculate total quantity
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = totalQuantity;
        
        // Show/hide based on count
        if (totalQuantity > 0) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
}

/**
 * Test login function to use when API is not available
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise with user data
 */
function testLogin(email, password) {
    console.log('Using test login with credentials:', email);
    
    return new Promise((resolve, reject) => {
        // Tài khoản mẫu để dùng thử
        const testAccounts = [
            { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
            { email: 'user@example.com', password: 'user123', name: 'Normal User', role: 'user' },
            { email: 'test@example.com', password: 'test123', name: 'Test Account', role: 'user' }
        ];
        
        // Kiểm tra các tài khoản đã đăng ký tạm thời
        const tempAccounts = JSON.parse(localStorage.getItem('testAccounts') || '[]');
        
        // Kiểm tra các tài khoản cục bộ đã đăng ký qua API mock
        const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
        
        // Kết hợp tất cả các loại tài khoản
        const allAccounts = [...testAccounts, ...tempAccounts, ...localAccounts];
        
        // Kiểm tra xem tài khoản có tồn tại không
        const foundUser = allAccounts.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        );
        
        if (foundUser) {
            // Create fake user data and token
            const userData = {
                _id: foundUser._id || `user_${Date.now()}`,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role || 'user',
                createdAt: foundUser.createdAt || new Date().toISOString()
            };
            
            const token = `test_token_${Date.now()}`;
            const response = {
                status: 'success',
                token: token,
                data: {
                    user: userData
                }
            };
            
            // Simulate network delay
            setTimeout(() => {
                console.log('Test login successful:', userData);
                resolve(response);
            }, 800);
        } else {
            // Simulate network delay for error
            setTimeout(() => {
                console.log('Test login failed: Invalid credentials');
                reject({
                    status: 'fail',
                    message: 'Email hoặc mật khẩu không chính xác'
                });
            }, 800);
        }
    });
}

/**
 * Test register function to use when API is not available
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise with user data
 */
function testRegister(userData) {
    console.log('Using test register with data:', userData);
    
    return new Promise((resolve, reject) => {
        // Tài khoản mẫu để kiểm tra trùng lặp
        const testAccounts = [
            { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
            { email: 'user@example.com', password: 'user123', name: 'Normal User', role: 'user' },
            { email: 'test@example.com', password: 'test123', name: 'Test Account', role: 'user' }
        ];
        
        // Kiểm tra các tài khoản đã đăng ký tạm thời
        const tempAccounts = JSON.parse(localStorage.getItem('testAccounts') || '[]');
        const allAccounts = [...testAccounts, ...tempAccounts];
        
        // Kiểm tra email đã tồn tại chưa
        const emailExists = allAccounts.some(account => 
            account.email.toLowerCase() === userData.email.toLowerCase()
        );
        
        if (emailExists) {
            // Simulate network delay for error
            setTimeout(() => {
                console.log('Test register failed: Email already exists');
                reject({
                    status: 'fail',
                    message: 'Email đã được sử dụng. Vui lòng chọn email khác!'
                });
            }, 800);
            return;
        }
        
        // Tạo dữ liệu người dùng mới
        const newUser = {
            _id: `user_${Date.now()}`,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        // Lưu vào danh sách tài khoản tạm thời
        tempAccounts.push(newUser);
        localStorage.setItem('testAccounts', JSON.stringify(tempAccounts));
        
        // Tạo token mới
        const token = `test_token_${Date.now()}`;
        const response = {
            status: 'success',
            token: token,
            data: {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                }
            }
        };
        
        // Simulate network delay
        setTimeout(() => {
            console.log('Test register successful:', newUser);
            resolve(response);
        }, 800);
    });
}

// Thêm hàm để phục hồi token đăng nhập từ dữ liệu MongoDB
window.validateAndRecoverUserData = function(mongoUserData) {
    try {
        console.log('Validating MongoDB user data:', mongoUserData);
        
        // Thử phân tích dữ liệu JSON nếu nó là string
        let data = mongoUserData;
        if (typeof mongoUserData === 'string') {
            try {
                data = JSON.parse(mongoUserData);
            } catch (e) {
                console.error('Error parsing JSON string:', e);
                showToast('Dữ liệu JSON không hợp lệ', 'danger');
                return false;
            }
        }
        
        // Kiểm tra các định dạng phản hồi khác nhau từ MongoDB
        let token = null;
        let userData = null;
        
        // Tìm token
        if (data.token) {
            token = data.token;
        } else if (data.data && data.data.token) {
            token = data.data.token;
        }
        
        // Tìm dữ liệu người dùng
        if (data.data && data.data.user) {
            userData = data.data.user;
        } else if (data.user) {
            userData = data.user;
        } else if (data.data) {
            userData = data.data;
        } else if (data._id) {
            userData = data;
        }
        
        if (userData && token) {
            console.log('Valid MongoDB user data found, saving to localStorage');
            localStorage.setItem('userToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            window.checkUserLoginStatus();
            return true;
        } else if (userData) {
            // Trường hợp chỉ có userData nhưng không có token
            console.log('Creating mock token for valid user data');
            const mockToken = `mock_token_${Date.now()}`;
            localStorage.setItem('userToken', mockToken);
            localStorage.setItem('userData', JSON.stringify(userData));
            window.checkUserLoginStatus();
            return true;
        }
        
        console.warn('Invalid MongoDB data format. No token or user data found:', data);
        return false;
    } catch (error) {
        console.error('Error validating MongoDB user data:', error);
        return false;
    }
};

// Thêm chức năng đăng nhập thủ công
window.manualLoginWithData = function(jsonData) {
    try {
        console.log('Attempting manual login with provided data');
        
        // Parse dữ liệu JSON nếu nó là string
        let data = jsonData;
        if (typeof jsonData === 'string') {
            try {
                data = JSON.parse(jsonData);
            } catch (e) {
                console.error('Error parsing JSON string:', e);
                showToast('Dữ liệu JSON không hợp lệ', 'danger');
                return false;
            }
        }
        
        console.log('Parsed login data:', data);
        
        // Xác định token và userData từ nhiều định dạng có thể có
        let token = null;
        let userData = null;
        
        // Tìm token từ cấu trúc dữ liệu
        if (data.token) {
            token = data.token;
        } else if (data.data && data.data.token) {
            token = data.data.token;
        }
        
        // Tìm userData từ cấu trúc dữ liệu
        if (data.data && data.data.user) {
            userData = data.data.user;
        } else if (data.user) {
            userData = data.user;
        } else if (data._id) {
            userData = data;
        } else if (data.data) {
            userData = data.data;
        }
        
        // Nếu không tìm thấy dữ liệu người dùng nhưng có ID trong URL
        if (!userData && data.id) {
            userData = {
                _id: data.id,
                name: data.name || 'Người dùng',
                email: data.email || 'user@example.com',
                role: data.role || 'user'
            };
        }
        
        if (!token && userData) {
            // Tạo token giả lập nếu có userData nhưng không có token
            console.log('Creating mock token for authenticated user');
            token = `mock_token_${Date.now()}`;
        }
        
        if (!token || !userData) {
            console.error('No valid token or user data found in the provided data');
            showToast('Không tìm thấy token hoặc dữ liệu người dùng hợp lệ', 'danger');
            return false;
        }
        
        // Kiểm tra role người dùng
        const userRole = userData.role || 'user';
        if (userRole !== 'user' && userRole !== 'customer' && userRole !== 'member') {
            console.error('User role not allowed:', userRole);
            showToast(`Vai trò "${userRole}" không được phép truy cập shop`, 'danger');
            return false;
        }
        
        // Đảm bảo _id tồn tại
        if (!userData._id) {
            userData._id = `user_${Date.now()}`;
        }
        
        // Đảm bảo name tồn tại
        if (!userData.name) {
            if (userData.email) {
                userData.name = userData.email.split('@')[0];
            } else {
                userData.name = 'Người dùng';
            }
        }
        
        // Lưu token và dữ liệu người dùng
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Cập nhật UI
        window.checkUserLoginStatus();
        
        // Đóng modal nếu đang mở
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
        
        const manualLoginModal = bootstrap.Modal.getInstance(document.getElementById('manualLoginModal'));
        if (manualLoginModal) {
            manualLoginModal.hide();
        }
        
        // Hiển thị thông báo thành công
        showToast('Đăng nhập thủ công thành công!', 'success');
        return true;
    } catch (error) {
        console.error('Error during manual login:', error);
        showToast('Có lỗi xảy ra khi đăng nhập thủ công', 'danger');
        return false;
    }
};

// Thêm hàm để kiểm tra quá trình đăng ký với MongoDB
window.checkMongoDBSignup = function(formData) {
    console.log('Kiểm tra đăng ký trực tiếp với MongoDB...');
    showLoadingSpinner();
    
    // Kiểm tra kết nối đến MongoDB
    fetch(`${API_BASE_URL}/status/mongodb`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        hideLoadingSpinner();
        
        if (!response.ok) {
            return response.json().then(data => {
                console.error('Không thể kiểm tra trạng thái MongoDB:', data);
                showToast('Không thể kết nối đến MongoDB: ' + (data.message || 'Lỗi không xác định'), 'danger');
                throw new Error('Không thể kết nối MongoDB');
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('Kết quả kiểm tra MongoDB:', data);
        
        if (data.status === 'connected') {
            showToast('Kết nối MongoDB hoạt động bình thường. Đang tiến hành đăng ký...', 'success');
            tryDirectSignup(formData);
        } else {
            showToast('MongoDB không hoạt động: ' + (data.message || 'Không xác định được lý do'), 'warning');
            
            // Hiển thị thông tin lỗi
            const errorDialog = document.createElement('div');
            errorDialog.className = 'modal fade';
            errorDialog.id = 'mongoErrorModal';
            errorDialog.setAttribute('tabindex', '-1');
            errorDialog.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">MongoDB không khả dụng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <p>Không thể kết nối đến MongoDB hoặc dịch vụ không hoạt động.</p>
                            </div>
                            <div class="mt-3">
                                <h6>Lỗi:</h6>
                                <pre class="bg-light p-2">${JSON.stringify(data, null, 2)}</pre>
                            </div>
                            <div class="mt-3">
                                <p>Đề xuất:</p>
                                <ul>
                                    <li>Kiểm tra kết nối mạng</li>
                                    <li>Kiểm tra trạng thái server MongoDB</li>
                                    <li>Thử đăng ký thông thường</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="tryRegularSignupBtn">Thử đăng ký thường</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(errorDialog);
            
            const modal = new bootstrap.Modal(errorDialog);
            modal.show();
            
            document.getElementById('tryRegularSignupBtn').addEventListener('click', function() {
                modal.hide();
                setTimeout(() => {
                    tryDirectSignup(formData);
                    errorDialog.addEventListener('hidden.bs.modal', function() {
                        document.body.removeChild(errorDialog);
                    });
                }, 500);
            });
        }
    })
    .catch(error => {
        console.error('Lỗi kiểm tra MongoDB:', error);
        hideLoadingSpinner();
        showToast('Không thể kiểm tra trạng thái MongoDB', 'danger');
    });
};

/**
 * Thử đăng ký trực tiếp (không qua Admin token)
 * @param {Object} registerData - Dữ liệu đăng ký
 */
function tryDirectSignup(registerData) {
    console.log('Thử đăng ký trực tiếp:', registerData.email);
    showLoadingSpinner();

    // Gửi yêu cầu đăng ký
    fetch(`${window.API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => {
        if (!response.ok) {
            // Kiểm tra trường hợp email đã tồn tại (409)
            if (response.status === 409) {
                hideLoadingSpinner();
                showToast('Email đã được sử dụng. Vui lòng chọn email khác!', 'warning');
                throw new Error('Email already in use');
            }
            
            // Kiểm tra lỗi xác thực (401) - có thể cần endpoint khác
            if (response.status === 401) {
                console.log('Endpoint /users/signup trả về 401. Thử endpoint thay thế...');
                return tryAlternativeEndpoint(registerData);
            }
            
            return response.json().then(data => {
                console.error('Lỗi đăng ký:', data);
                let errorMessage = data.message || 'Đăng ký thất bại';
                
                // Nếu lỗi không nghiêm trọng, thử endpoint thay thế
                if (response.status >= 400 && response.status < 500) {
                    console.log(`Lỗi ${response.status} từ API: ${errorMessage}. Thử phương thức khác...`);
                    return tryAlternativeEndpoint(registerData);
                }
                
                hideLoadingSpinner();
                showToast(errorMessage, 'danger');
                throw new Error(errorMessage);
            });
        }
        return response.json();
    })
    .then(data => {
        hideLoadingSpinner();
        console.log('Phản hồi đăng ký từ API:', data);

        // Kiểm tra các định dạng phản hồi khác nhau
        if (data.success === true || data.status === 'success') {
            // Lưu token
            let token = null;
            if (data.token) {
                token = data.token;
            } else if (data.data && data.data.token) {
                token = data.data.token;
            }
            
            if (token) {
                localStorage.setItem('userToken', token);
            }
            
            // Lưu dữ liệu người dùng theo các định dạng khác nhau
            let userData = null;
            
            if (data.data && data.data.user) {
                userData = data.data.user;
            } else if (data.user) {
                userData = data.user;
            } else if (data.data) {
                userData = data.data;
            }
            
            if (userData) {
                localStorage.setItem('userData', JSON.stringify(userData));
                showToast('Đăng ký thành công!', 'success');
                
                // Đóng modal đăng ký nếu đang mở
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (registerModal) {
                    registerModal.hide();
                }
                
                // Cập nhật UI
                window.checkUserLoginStatus();
                
                return data;
            } else {
                console.warn('Không tìm thấy dữ liệu người dùng trong phản hồi:', data);
                showToast('Đăng ký thành công nhưng không tìm thấy dữ liệu người dùng', 'warning');
            }
        } else {
            console.warn('Phản hồi không có trường success hoặc status:', data);
            showToast(data.message || 'Định dạng phản hồi không được hỗ trợ', 'warning');
            
            // Thử phương thức thay thế
            return tryAlternativeEndpoint(registerData);
        }
    })
    .catch(error => {
        if (error.message === 'Email already in use') {
            // Đã hiển thị thông báo ở trên
            return;
        }
        
        console.error('Lỗi trong quá trình đăng ký:', error);
        hideLoadingSpinner();
        
        // Hiện hộp thoại với các lựa chọn
        showRegistrationFailureDialog(error.message, registerData);
    });
}

/**
 * Creates a mock response for registration when API fails or is unavailable
 * @param {Object} registerData - User registration data
 * @returns {Object} - Mock response object
 */
function createMockRegistrationResponse(registerData) {
    console.log('Creating mock registration response for:', registerData.email);
    
    // Generate mock user ID and token
    const userId = `user_${Date.now()}`;
    const token = `mock_token_${Date.now()}`;
    
    // Create user data object
    const userData = {
        _id: userId,
        name: registerData.name,
        email: registerData.email,
        password: registerData.password, // Lưu mật khẩu để có thể đăng nhập sau này
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    // Save the mock account to localStorage for future logins
    const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
    localAccounts.push(userData);
    localStorage.setItem('localAccounts', JSON.stringify(localAccounts));
    
    console.log('Local account saved:', userData);
    
    // Return a mock response similar to what the API would return
    return {
        status: 'success',
        token: token,
        data: {
            user: {
                _id: userId,
                name: registerData.name,
                email: registerData.email,
                role: 'user',
                createdAt: new Date().toISOString()
            }
        }
    };
}

/**
 * Tạo tài khoản cục bộ khi API trả về lỗi
 * @param {Object} registerData - Dữ liệu đăng ký người dùng
 */
function createLocalAccount(registerData) {
    console.log('Tạo tài khoản cục bộ cho:', registerData.email);
    
    // Hiển thị thông báo
    showToast('Đang tạo tài khoản cục bộ...', 'info');
    
    // Tạo phản hồi mô phỏng
    const mockResponse = createMockRegistrationResponse(registerData);
    const token = mockResponse.token;
    const userData = mockResponse.data.user;
    
    // Lưu token và dữ liệu người dùng
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Hiển thị thông báo
    showToast('Đăng ký thành công! Tài khoản đã được tạo.', 'success');
    showToast('Lưu ý: Đây là tài khoản cục bộ, không có trên máy chủ.', 'info');
    
    // Đóng modal đăng ký
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (registerModal) {
        registerModal.hide();
    }
    
    // Cập nhật UI
    window.checkUserLoginStatus();
}

/**
 * Hiển thị spinner tải dữ liệu
 */
function showLoadingSpinner() {
    // Kiểm tra xem spinner đã tồn tại chưa
    if (document.getElementById('globalLoadingSpinner')) {
        document.getElementById('globalLoadingSpinner').style.display = 'flex';
        return;
    }
    
    // Tạo spinner mới
    const spinnerElement = document.createElement('div');
    spinnerElement.id = 'globalLoadingSpinner';
    spinnerElement.className = 'position-fixed w-100 h-100 d-flex justify-content-center align-items-center';
    spinnerElement.style.top = '0';
    spinnerElement.style.left = '0';
    spinnerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    spinnerElement.style.zIndex = '9999';
    
    // Nội dung spinner
    spinnerElement.innerHTML = `
        <div class="bg-white p-4 rounded shadow-lg text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <div>Đang xử lý...</div>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(spinnerElement);
}

/**
 * Ẩn spinner tải dữ liệu
 */
function hideLoadingSpinner() {
    const spinnerElement = document.getElementById('globalLoadingSpinner');
    if (spinnerElement) {
        spinnerElement.style.display = 'none';
    }
    
    // Xóa spinner nếu đã hiển thị quá lâu (30 giây)
    setTimeout(() => {
        const spinnerCheck = document.getElementById('globalLoadingSpinner');
        if (spinnerCheck && spinnerCheck.style.display !== 'none') {
            spinnerCheck.style.display = 'none';
            console.warn('Force hiding spinner after timeout');
        }
    }, 30000);
}

// Force hide spinner on page load and before showing any dialogs
document.addEventListener('DOMContentLoaded', function() {
    // Nếu có spinner nào đó đang hiển thị, ẩn nó
    hideLoadingSpinner();
    
    // Hook vào tất cả các hàm modal để đảm bảo spinner bị ẩn
    const originalModalShow = bootstrap.Modal.prototype.show;
    if (originalModalShow) {
        bootstrap.Modal.prototype.show = function() {
            hideLoadingSpinner();
            originalModalShow.apply(this, arguments);
        };
    }
});

/**
 * Thử đăng ký với endpoint thay thế khi endpoint chính thất bại
 * @param {Object} registerData - Dữ liệu đăng ký của người dùng
 * @param {Function} onSuccess - Callback khi đăng ký thành công
 * @param {Function} onError - Callback khi đăng ký thất bại
 */
function tryAlternativeEndpoint(registerData, onSuccess, onError) {
    console.log("Đang thử endpoint thay thế cho đăng ký");
    
    // Danh sách các endpoint thay thế để thử
    const alternativeEndpoints = [
        `${API_BASE_URL}/users/signup`,
        `${API_BASE_URL}/api/users/signup`,
        `${API_BASE_URL}/auth/signup`,
        `${API_BASE_URL}/api/auth/register`
    ];
    
    // Hiển thị toast thông báo
    showToast("Đang thử các phương thức đăng ký thay thế...", "info");
    
    // Thử từng endpoint
    let currentEndpointIndex = 0;
    
    function tryNextEndpoint() {
        if (currentEndpointIndex >= alternativeEndpoints.length) {
            console.log("Đã thử tất cả các endpoint thay thế nhưng không thành công");
            showToast("Không thể đăng ký tài khoản. Vui lòng thử lại sau.", "error");
            
            // Hiển thị dialog với các tùy chọn khác
            showRegistrationFailureDialog(registerData.email);
            
            if (onError && typeof onError === 'function') {
                onError("Không thể kết nối đến máy chủ đăng ký.");
            }
            return;
        }
        
        const endpoint = alternativeEndpoints[currentEndpointIndex];
        console.log(`Đang thử đăng ký với endpoint: ${endpoint}`);
        
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            console.log(`Kết quả từ ${endpoint}:`, response.status);
            
            if (response.ok) {
                return response.json().then(data => {
                    console.log("Đăng ký thành công với endpoint thay thế:", endpoint);
                    showToast("Đăng ký thành công!", "success");
                    
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                });
            } else if (response.status === 409) {
                // Email đã tồn tại - có thể thử đăng nhập
                console.log("Email đã tồn tại. Đề xuất đăng nhập.");
                showToast("Email này đã đăng ký. Vui lòng đăng nhập.", "warning");
                
                // Hiển thị dialog để người dùng chọn đăng nhập
                showEmailExistsDialog(registerData.email);
                
                if (onError && typeof onError === 'function') {
                    onError("Email đã tồn tại");
                }
            } else {
                // Thử endpoint tiếp theo
                currentEndpointIndex++;
                tryNextEndpoint();
            }
        })
        .catch(error => {
            console.error(`Lỗi khi thử endpoint ${endpoint}:`, error);
            // Thử endpoint tiếp theo
            currentEndpointIndex++;
            tryNextEndpoint();
        });
    }
    
    // Bắt đầu thử các endpoint
    tryNextEndpoint();
}

/**
 * Hiển thị dialog khi email đã tồn tại trong hệ thống
 * @param {string} email - Email người dùng đã nhập
 */
function showEmailExistsDialog(email) {
    console.log("Hiển thị dialog email đã tồn tại:", email);
    
    // Kiểm tra xem modal đã tồn tại chưa, nếu chưa thì tạo mới
    let emailExistsDialog = document.getElementById('emailExistsDialog');
    if (!emailExistsDialog) {
        // Tạo modal mới
        const modalHTML = `
        <div class="modal fade" id="emailExistsDialog" tabindex="-1" aria-labelledby="emailExistsDialogLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="emailExistsDialogLabel">Email đã được sử dụng</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Email <strong id="existingEmail"></strong> đã được đăng ký trước đó.</p>
                        <p>Bạn có thể:</p>
                        <ul>
                            <li>Đăng nhập nếu đây là tài khoản của bạn</li>
                            <li>Sử dụng email khác để đăng ký</li>
                            <li>Yêu cầu đặt lại mật khẩu nếu bạn quên mật khẩu</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="goToLoginBtn">Đăng nhập</button>
                        <button type="button" class="btn btn-info" id="registerNewEmailBtn">Dùng email khác</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Thêm modal vào body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        existsDialog = document.getElementById('emailExistsDialog');
        
        // Thêm sự kiện cho nút đăng nhập
        document.getElementById('goToLoginBtn').addEventListener('click', function() {
            // Đóng modal hiện tại
            const existsModal = bootstrap.Modal.getInstance(existsDialog);
            if (existsModal) {
                existsModal.hide();
            }
            
            // Đóng modal đăng ký nếu đang mở
            const registerModal = document.getElementById('registerModal');
            const registerModalInstance = bootstrap.Modal.getInstance(registerModal);
            if (registerModalInstance) {
                registerModalInstance.hide();
            }
            
            // Mở modal đăng nhập và điền sẵn email
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                if (email) {
                    document.getElementById('loginEmail').value = email;
                }
            }, 500);
        });
        
        // Thêm sự kiện cho nút dùng email khác
        document.getElementById('registerNewEmailBtn').addEventListener('click', function() {
            // Đóng modal hiện tại
            const existsModal = bootstrap.Modal.getInstance(existsDialog);
            if (existsModal) {
                existsModal.hide();
            }
            
            // Làm nổi bật trường email trong form đăng ký
            setTimeout(() => {
                const emailField = document.getElementById('registerEmail');
                if (emailField) {
                    emailField.focus();
                    emailField.select();
                }
            }, 500);
        });
    }
    
    // Cập nhật email trong modal
    document.getElementById('dialogExistingEmail').textContent = email || 'đã nhập';
    
    // Hiển thị modal
    const existsModal = new bootstrap.Modal(existsDialog);
    existsModal.show();
}

/**
 * Hiển thị dialog khi đăng nhập thất bại
 * @param {string} email - Email người dùng đã nhập
 */
function showLoginFailureDialog(email) {
    console.log('Showing login failure dialog for:', email);
    
    // Kiểm tra xem modal đã tồn tại chưa
    let loginFailureDialog = document.getElementById('loginFailureDialog');
    
    if (!loginFailureDialog) {
        // Tạo modal mới
        const modalHTML = `
        <div class="modal fade" id="loginFailureDialog" tabindex="-1" aria-labelledby="loginFailureDialogLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-white">
                        <h5 class="modal-title" id="loginFailureDialogLabel">Đăng nhập thất bại</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Không thể đăng nhập với tài khoản <strong id="failedLoginEmail"></strong>.</p>
                        <p>Bạn có thể:</p>
                        <ul>
                            <li>Kiểm tra lại mật khẩu và thử lại</li>
                            <li>Sử dụng một trong các tài khoản dùng thử dưới đây:</li>
                        </ul>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Mật khẩu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>user@example.com</td>
                                        <td>user123</td>
                                    </tr>
                                    <tr>
                                        <td>test@example.com</td>
                                        <td>test123</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p>Hoặc bạn có thể sử dụng dữ liệu MongoDB thủ công nếu có:</p>
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="showManualLoginBtn">
                            <i class="fas fa-code me-1"></i> Đăng nhập thủ công
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-success" id="tryTestAccountBtn">Dùng tài khoản test</button>
                        <button type="button" class="btn btn-primary" id="tryAgainBtn">Thử lại</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Thêm modal vào body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        loginFailureDialog = document.getElementById('loginFailureDialog');
        
        // Thêm sự kiện cho các nút
        const showManualLoginBtn = document.getElementById('showManualLoginBtn');
        if (showManualLoginBtn) {
            showManualLoginBtn.addEventListener('click', function() {
                // Đóng dialog hiện tại
                const failureModal = bootstrap.Modal.getInstance(loginFailureDialog);
                if (failureModal) {
                    failureModal.hide();
                }
                
                // Mở modal đăng nhập thủ công
                setTimeout(() => {
                    const manualLoginModal = new bootstrap.Modal(document.getElementById('manualLoginModal'));
                    if (manualLoginModal) {
                        manualLoginModal.show();
                    }
                }, 500);
            });
        }
        
        const tryTestAccountBtn = document.getElementById('tryTestAccountBtn');
        if (tryTestAccountBtn) {
            tryTestAccountBtn.addEventListener('click', function() {
                // Đóng dialog hiện tại
                const failureModal = bootstrap.Modal.getInstance(loginFailureDialog);
                if (failureModal) {
                    failureModal.hide();
                }
                
                // Tự động điền thông tin tài khoản test
                setTimeout(() => {
                    document.getElementById('loginEmail').value = 'user@example.com';
                    document.getElementById('loginPassword').value = 'user123';
                    
                    // Kích hoạt nút submit
                    document.querySelector('#loginForm button[type="submit"]').click();
                }, 500);
            });
        }
        
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', function() {
                // Đóng dialog hiện tại
                const failureModal = bootstrap.Modal.getInstance(loginFailureDialog);
                if (failureModal) {
                    failureModal.hide();
                }
            });
        }
    }
    
    // Cập nhật email trong dialog
    const failedLoginEmail = document.getElementById('failedLoginEmail');
    if (failedLoginEmail) {
        failedLoginEmail.textContent = email || 'không xác định';
    }
    
    // Hiển thị dialog
    const loginFailureModal = new bootstrap.Modal(loginFailureDialog);
    loginFailureModal.show();
}

/**
 * Xử lý đăng ký tài khoản với token admin
 * @param {Object} registerData - Dữ liệu đăng ký
 * @param {String} adminToken - Token admin xác thực
 */
function processAdminSignup(registerData, adminToken) {
    console.log('Xử lý đăng ký với Admin Token:', registerData.email);
    showLoadingSpinner();
    
    fetch(`${API_BASE_URL}/users/admin/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(registerData)
    })
    .then(response => {
        hideLoadingSpinner();
        
        if (response.status === 401) {
            console.log('Admin token không hợp lệ. Thử endpoint thay thế...');
            return tryAlternativeEndpoint(registerData);
        }
        
        if (response.status === 409) {
            showToast('Email đã được sử dụng', 'warning');
            throw new Error('Email already in use');
        }
        
        if (!response.ok) {
            return response.json().then(data => {
                console.error('Lỗi đăng ký admin:', data);
                let errorMessage = data.message || 'Đăng ký thất bại';
                
                // Kiểm tra nếu lỗi 401, thử phương thức khác
                if (response.status === 401) {
                    return tryAlternativeEndpoint(registerData);
                }
                
                showToast(errorMessage, 'danger');
                throw new Error(errorMessage);
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('Đăng ký admin thành công:', data);
        
        // Xử lý dữ liệu theo định dạng MongoDB
        if (data && data.success === true) {
            // Hiển thị thông báo thành công
            showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            
            // Đóng modal đăng ký
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) {
                registerModal.hide();
            }
            
            // Mở modal đăng nhập
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                
                // Pre-fill email field
                const loginEmail = document.getElementById('loginEmail');
                if (loginEmail) {
                    loginEmail.value = registerData.email;
                }
            }, 1000);
        } else {
            console.warn('Phản hồi không có trường success:', data);
            tryAlternativeEndpoint(registerData);
        }
    })
    .catch(error => {
        console.error('Lỗi trong quá trình đăng ký admin:', error);
        hideLoadingSpinner();
        
        // Hiển thị hộp thoại với lựa chọn
        showRegistrationFailureDialog(error.message, registerData);
    });
}

/**
 * Hiển thị hộp thoại thông báo thất bại đăng ký với các lựa chọn
 * @param {String} errorMessage - Thông báo lỗi
 * @param {Object} registerData - Dữ liệu đăng ký để sử dụng với các lựa chọn khác
 */
function showRegistrationFailureDialog(errorMessage, registerData) {
    hideLoadingSpinner();
    
    // Tạo dialog
    const errorDialog = document.createElement('div');
    errorDialog.className = 'modal fade';
    errorDialog.id = 'registrationErrorModal';
    errorDialog.setAttribute('tabindex', '-1');
    errorDialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Đăng ký không thành công</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger">
                        <p><strong>Lỗi:</strong> ${errorMessage || 'Không thể đăng ký tài khoản'}</p>
                    </div>
                    <div class="mt-3">
                        <p>Bạn có thể:</p>
                        <ul>
                            <li>Thử lại với một email khác</li>
                            <li>Sử dụng tài khoản test có sẵn (email: test@example.com, mật khẩu: test123)</li>
                            <li>Tạo tài khoản cục bộ (chỉ hoạt động trên thiết bị này)</li>
                            <li>Liên hệ quản trị viên để được hỗ trợ</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button type="button" class="btn btn-outline-success" id="useTestAccountBtn">Dùng tài khoản test</button>
                    <button type="button" class="btn btn-primary" id="createLocalAccountBtn">Tạo tài khoản cục bộ</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDialog);
    
    const modal = new bootstrap.Modal(errorDialog);
    modal.show();
    
    // Sự kiện cho nút tạo tài khoản cục bộ
    document.getElementById('createLocalAccountBtn').addEventListener('click', function() {
        modal.hide();
        setTimeout(() => {
            createLocalAccount(registerData);
            errorDialog.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(errorDialog);
            });
        }, 500);
    });
    
    // Sự kiện cho nút sử dụng tài khoản test
    document.getElementById('useTestAccountBtn').addEventListener('click', function() {
        modal.hide();
        setTimeout(() => {
            // Đóng modal đăng ký nếu đang mở
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) {
                registerModal.hide();
            }
            
            // Mở modal đăng nhập và điền thông tin tài khoản test
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            
            // Pre-fill email field
            const loginEmail = document.getElementById('loginEmail');
            const loginPassword = document.getElementById('loginPassword');
            
            if (loginEmail && loginPassword) {
                loginEmail.value = 'test@example.com';
                loginPassword.value = 'test123';
            }
            
            // Xóa dialog
            errorDialog.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(errorDialog);
            });
        }, 500);
    });
}

/**
 * Hiển thị dialog khi đăng ký thất bại hoàn toàn
 * @param {string} email - Email người dùng đã nhập
 */
function showRegistrationFailureDialog(email) {
    console.log("Hiển thị dialog đăng ký thất bại cho email:", email);
    
    // Kiểm tra xem modal đã tồn tại chưa, nếu chưa thì tạo mới
    let failureDialog = document.getElementById('registrationFailureDialog');
    if (!failureDialog) {
        // Tạo modal mới
        const modalHTML = `
        <div class="modal fade" id="registrationFailureDialog" tabindex="-1" aria-labelledby="registrationFailureDialogLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="registrationFailureDialogLabel">Không thể đăng ký</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Không thể đăng ký tài khoản với email <strong id="dialogRegEmail"></strong>.</p>
                        <p>Nguyên nhân có thể do:</p>
                        <ul>
                            <li>Máy chủ đăng ký tạm thời không khả dụng</li>
                            <li>Kết nối mạng của bạn có vấn đề</li>
                            <li>API đăng ký đang được bảo trì</li>
                        </ul>
                        <p>Bạn có thể:</p>
                        <ul>
                            <li>Thử đăng nhập nếu bạn đã có tài khoản</li>
                            <li>Sử dụng tài khoản test để trải nghiệm</li>
                            <li>Thử lại sau</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="tryLoginBtn">Thử đăng nhập</button>
                        <button type="button" class="btn btn-success" id="useTestAccountRegBtn">Sử dụng tài khoản test</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Thêm modal vào body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        failureDialog = document.getElementById('registrationFailureDialog');
        
        // Thêm sự kiện cho nút thử đăng nhập
        document.getElementById('tryLoginBtn').addEventListener('click', function() {
            // Đóng modal hiện tại
            const failureModal = bootstrap.Modal.getInstance(failureDialog);
            if (failureModal) {
                failureModal.hide();
            }
            
            // Đóng modal đăng ký nếu đang mở
            const registerModal = document.getElementById('registerModal');
            const registerModalInstance = bootstrap.Modal.getInstance(registerModal);
            if (registerModalInstance) {
                registerModalInstance.hide();
            }
            
            // Mở modal đăng nhập và điền sẵn email
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                if (email) {
                    document.getElementById('loginEmail').value = email;
                }
            }, 500);
        });
        
        // Thêm sự kiện cho nút sử dụng tài khoản test
        document.getElementById('useTestAccountRegBtn').addEventListener('click', function() {
            // Đóng modal hiện tại
            const failureModal = bootstrap.Modal.getInstance(failureDialog);
            if (failureModal) {
                failureModal.hide();
            }
            
            // Đóng modal đăng ký nếu đang mở
            const registerModal = document.getElementById('registerModal');
            const registerModalInstance = bootstrap.Modal.getInstance(registerModal);
            if (registerModalInstance) {
                registerModalInstance.hide();
            }
            
            // Mở modal đăng nhập thủ công
            setTimeout(() => {
                const manualLoginModal = new bootstrap.Modal(document.getElementById('manualLoginModal'));
                manualLoginModal.show();
            }, 500);
        });
    }
    
    // Cập nhật email trong modal
    document.getElementById('dialogRegEmail').textContent = email || 'đã nhập';
    
    // Hiển thị modal
    const failureModal = new bootstrap.Modal(failureDialog);
    failureModal.show();
}

/**
 * Xử lý đăng ký tài khoản với token admin
 * @param {Object} registerData - Dữ liệu đăng ký
 * @param {String} adminToken - Token admin xác thực
 */
function processRegistration(registerData) {
    // Hiển thị loading
    showLoading();
    
    // Gửi request đăng ký
    fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => {
        console.log(`Registration response status: ${response.status}`);
        
        if (response.status === 409) {
            // Email đã tồn tại
            hideLoading();
            showEmailExistsDialog(registerData.email);
            return null;
        } else if (response.status === 401) {
            // Unauthorized - thử endpoint khác
            return tryAlternativeEndpoint(registerData);
        } else if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Đăng ký thất bại');
            });
        }
        return response.json();
    })
    .then(data => {
        hideLoading();
        if (!data) return; // Đã xử lý ở các case trên
        
        console.log('Registration successful:', data);
        
        // Hiển thị thông báo thành công
        showToast('success', 'Đăng ký thành công!');
        
        // Đóng modal đăng ký
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (registerModal) {
            registerModal.hide();
        }
        
        // Lưu thông tin người dùng
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || {}));
            updateUIAfterLogin();
        } else {
            // Nếu không có token, mở modal đăng nhập sau 1 giây
            setTimeout(() => {
                // Mở modal đăng nhập và điền sẵn email
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                document.getElementById('loginEmail').value = registerData.email;
            }, 1000);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Registration error:', error);
        showToast('error', `Đăng ký thất bại: ${error.message}`);
        
        // Nếu có lỗi nghiêm trọng, hiển thị dialog thất bại
        if (error.message && (
            error.message.includes('network') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('timeout')
        )) {
            showRegistrationFailureDialog(registerData.email);
        }
    });
} 