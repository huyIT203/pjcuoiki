/**
 * Auth Components for VietShop
 * Chứa các component đăng nhập/đăng ký có thể tái sử dụng trên tất cả các trang
 */

// Đảm bảo rằng API_BASE_URL đã được khai báo
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'http://localhost:5000/api';
}

// Component đăng nhập/đăng ký
const AuthComponents = {
    // HTML cho modal đăng nhập
    loginModalHTML: `
        <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Đăng nhập</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="loginEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="loginEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="loginPassword" class="form-label">Mật khẩu</label>
                                <input type="password" class="form-control" id="loginPassword" required>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="rememberMe">
                                    <label class="form-check-label" for="rememberMe">Ghi nhớ đăng nhập</label>
                                </div>
                                <a href="#" class="text-primary">Quên mật khẩu?</a>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
                        </form>
                        <div class="mt-3 text-center">
                            <p>Chưa có tài khoản? <a href="#" id="switchToRegister">Đăng ký ngay</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    // HTML cho modal đăng ký
    registerModalHTML: `
        <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Đăng ký</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm">
                            <div class="mb-3">
                                <label for="registerName" class="form-label">Họ và tên</label>
                                <input type="text" class="form-control" id="registerName" required>
                            </div>
                            <div class="mb-3">
                                <label for="registerEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="registerEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="registerPassword" class="form-label">Mật khẩu</label>
                                <input type="password" class="form-control" id="registerPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                                <input type="password" class="form-control" id="confirmPassword" required>
                            </div>
                            <div class="form-check mb-3">
                                <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                <label class="form-check-label" for="agreeTerms">Tôi đồng ý với <a href="#">Điều khoản & Điều kiện</a></label>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Đăng ký</button>
                        </form>
                        <div class="mt-3 text-center">
                            <p>Đã có tài khoản? <a href="#" id="switchToLogin">Đăng nhập</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    // Phương thức khởi tạo các modal và thêm vào trang
    init: function() {
        // Kiểm tra xem các modal đã tồn tại chưa trước khi thêm mới
        if (!document.getElementById('loginModal')) {
            // Thêm các modal vào body
            const authModalsContainer = document.createElement('div');
            authModalsContainer.innerHTML = this.loginModalHTML + this.registerModalHTML;
            document.body.appendChild(authModalsContainer);
            
            // Khởi tạo sự kiện cho các modal
            this.initEvents();
            
            console.log('Auth components initialized');
        }
    },

    // Khởi tạo sự kiện cho các modal
    initEvents: function() {
        // Đảm bảo auth.js đã được tải
        if (typeof checkUserLoginStatus === 'function') {
            // Kiểm tra trạng thái đăng nhập ngay khi khởi tạo
            checkUserLoginStatus();
        } else {
            console.warn('Auth.js chưa được tải hoặc checkUserLoginStatus chưa được định nghĩa');
        }
        
        // Lấy các phần tử từ DOM
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        
        // Xử lý sự kiện cho nút đăng nhập
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            });
        }
        
        // Xử lý sự kiện cho nút đăng ký
        if (registerBtn) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                registerModal.show();
            });
        }
        
        // Chuyển từ đăng nhập sang đăng ký
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
        
        // Chuyển từ đăng ký sang đăng nhập
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
        
        // Kiểm tra tham số URL để hiển thị modal đăng nhập nếu cần
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('showLogin') === 'true') {
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            }, 500);
        }
    }
};

// Khởi tạo components khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo auth components
    AuthComponents.init();
}); 