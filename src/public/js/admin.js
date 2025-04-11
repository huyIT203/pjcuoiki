/**
 * E-commerce Admin Panel JavaScript
 * Provides functionality for the admin interface
 */

// Base URL for API
const BASE_URL = 'http://localhost:5000/api';
let adminToken = localStorage.getItem('adminToken') || '';

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Navigation
    const sidebarLinks = document.querySelectorAll('.nav-link');
    const formSections = document.querySelectorAll('.form-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const responseArea = document.querySelector('.json-response');
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const createProductForm = document.getElementById('createProductForm');
    
    // Buttons
    const getAllUsersBtn = document.getElementById('getAllUsers');
    const getAllProductsBtn = document.getElementById('getAllProducts');
    const getAllOrdersBtn = document.getElementById('getAllOrders');
    const clearResponseBtn = document.getElementById('clearResponse');

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            console.log(`Clicked on section: ${section}`);
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update visible section
            formSections.forEach(s => s.classList.remove('active'));
            document.getElementById(section + 'Section').classList.add('active');
            
            // Update section title
            sectionTitle.textContent = link.textContent.trim();
            
            // Load data based on section
            if (section === 'users' && getAllUsersBtn) {
                console.log('Loading users data...');
                getAllUsersBtn.click();
            } else if (section === 'products' && getAllProductsBtn) {
                console.log('Loading products data...');
                getAllProductsBtn.click();
            } else if (section === 'brands' && getAllBrandsBtn) {
                console.log('Loading brands data...');
                getAllBrandsBtn.click();
            } else if (section === 'orders' && getAllOrdersBtn) {
                console.log('Loading orders data...');
                getAllOrdersBtn.click();
            } else if (section === 'suppliers' && getAllSuppliersBtn) {
                console.log('Loading suppliers data...');
                getAllSuppliersBtn.click();
            } else if (section === 'attributes' && getAllAttributesBtn) {
                console.log('Loading attributes data...');
                getAllAttributesBtn.click();
            }
        });
    });

    // Display API Response
    function displayResponse(data) {
        responseArea.textContent = JSON.stringify(data, null, 2);
    }

    // Clear Response
    if (clearResponseBtn) {
        clearResponseBtn.addEventListener('click', () => {
            responseArea.textContent = '// Kết quả API sẽ hiển thị ở đây';
        });
    }

    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.token) {
                    adminToken = data.token;
                    localStorage.setItem('adminToken', adminToken);
                    showNotification('Đăng nhập thành công!', 'success');
                    
                    // Update UI for logged in user
                    updateAuthUI(true);
                } else {
                    showNotification('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    // Get All Users
    if (getAllUsersBtn) {
        getAllUsersBtn.addEventListener('click', async () => {
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            try {
                console.log('Fetching users data...');
                const response = await fetch(`${BASE_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                console.log('Users data received:', data);
                displayResponse(data);
                
                if (data.data && Array.isArray(data.data)) {
                    console.log(`Setting up users table with ${data.data.length} items`);
                    setupSearchAndPagination('usersTable', data.data, tableConfigs.usersTable);
                    attachUserActionListeners();
                } else if (data.data && data.data.users && Array.isArray(data.data.users)) {
                    console.log(`Setting up users table with ${data.data.users.length} items`);
                    setupSearchAndPagination('usersTable', data.data.users, tableConfigs.usersTable);
                    attachUserActionListeners();
                } else {
                    console.error('No users data found in response:', data);
                    showNotification('Không tìm thấy dữ liệu người dùng', 'warning');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    } else {
        console.error('getAllUsersBtn not found');
    }

    // Create Product
    if (createProductForm) {
        createProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const price = document.getElementById('productPrice').value;
            const stock = document.getElementById('productStock').value;
            const category = document.getElementById('productCategory').value;
            
            try {
                const response = await fetch(`${BASE_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        price: Number(price),
                        stock: Number(stock),
                        category,
                        seller: 'admin' // This might need to be the actual user ID
                    })
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Sản phẩm đã được tạo thành công!', 'success');
                    createProductForm.reset();
                } else {
                    showNotification('Tạo sản phẩm thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    // Get All Products
    if (getAllProductsBtn) {
        getAllProductsBtn.addEventListener('click', async () => {
            try {
                console.log('Fetching products data...');
                const response = await fetch(`${BASE_URL}/products`);
                const data = await response.json();
                console.log('Products data received:', data);
                displayResponse(data);
                
                if (data.data && Array.isArray(data.data)) {
                    console.log(`Setting up products table with ${data.data.length} items`);
                    setupSearchAndPagination('productsTable', data.data, tableConfigs.productsTable);
                    attachProductActionListeners();
                } else if (data.data && data.data.products && Array.isArray(data.data.products)) {
                    console.log(`Setting up products table with ${data.data.products.length} items`);
                    setupSearchAndPagination('productsTable', data.data.products, tableConfigs.productsTable);
                    attachProductActionListeners();
                } else {
                    console.error('No products data found in response:', data);
                    showNotification('Không tìm thấy dữ liệu sản phẩm', 'warning');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    } else {
        console.error('getAllProductsBtn not found');
    }

    // Get All Orders
    if (getAllOrdersBtn) {
        getAllOrdersBtn.addEventListener('click', async () => {
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            try {
                const response = await fetch(`${BASE_URL}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.data && data.data.orders) {
                    setupSearchAndPagination('ordersTable', data.data.orders, tableConfigs.ordersTable);
                    attachOrderActionListeners();
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    // Attach event listeners for user actions
    function attachUserActionListeners() {
        console.log('Attaching user action listeners');
        document.querySelectorAll('.view-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                console.log('Viewing user:', userId);
                viewUserDetail(userId);
            });
        });
        
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                console.log('Editing user:', userId);
                editUser(userId);
            });
        });
        
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                console.log('Deleting user:', userId);
                if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
                    deleteUser(userId);
                }
            });
        });
    }
    
    // Attach event listeners for order actions
    function attachOrderActionListeners() {
        // View order detail
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-id');
                viewOrderDetail(orderId);
            });
        });
        
        // Update order status
        document.querySelectorAll('.update-status').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-id');
                showUpdateOrderStatusModal(orderId);
            });
        });
        
        // Generate invoice
        document.querySelectorAll('.generate-invoice').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-id');
                generateOrderInvoice(orderId);
            });
        });
    }
    
    // View user detail
    async function viewUserDetail(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            const data = await response.json();
            displayResponse(data);
            
            if (data.data && data.data.user) {
                const user = data.data.user;
                
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'viewUserModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi tiết người dùng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="user-details">
                                <p><strong>ID:</strong> ${user._id}</p>
                                <p><strong>Tên:</strong> ${user.name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Vai trò:</strong> ${user.role}</p>
                                <p><strong>Trạng thái:</strong> <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">${user.status}</span></p>
                                <p><strong>Ngày tạo:</strong> ${new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-warning" onclick="editUser('${user._id}')">Chỉnh sửa</button>
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            } else {
                showNotification('Không tìm thấy thông tin người dùng!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }
    
    // Delete user
    async function deleteUser(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            const data = await response.json();
            displayResponse(data);
            
            if (data.status === 'success') {
                showNotification('Người dùng đã được xóa thành công!', 'success');
                // Refresh user list
                document.getElementById('getAllUsers').click();
            } else {
                showNotification('Xóa người dùng thất bại: ' + data.message, 'danger');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }
    
    // View order detail
    async function viewOrderDetail(orderId) {
        try {
            const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            const data = await response.json();
            displayResponse(data);
        } catch (error) {
            displayResponse({ error: error.message });
        }
    }
    
    // Show update order status modal
    function showUpdateOrderStatusModal(orderId) {
        // This would typically show a modal with status options
        const newStatus = prompt('Nhập trạng thái mới (pending, processing, shipped, delivered, cancelled):');
        if (newStatus) {
            updateOrderStatus(orderId, newStatus);
        }
    }
    
    // Update order status
    async function updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            displayResponse(data);
            
            if (data.status === 'success') {
                showNotification('Trạng thái đơn hàng đã được cập nhật!', 'success');
                // Refresh order list
                document.getElementById('getAllOrders').click();
            } else {
                showNotification('Cập nhật trạng thái thất bại: ' + data.message, 'danger');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }
    
    // Generate order invoice
    async function generateOrderInvoice(orderId) {
        try {
            const response = await fetch(`${BASE_URL}/orders/${orderId}/invoice`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            const data = await response.json();
            displayResponse(data);
            
            showNotification('Hóa đơn đã được tạo!', 'success');
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Position the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Update UI based on auth state
    function updateAuthUI(isLoggedIn) {
        const authSection = document.getElementById('authSection');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (isLoggedIn) {
            // Hide login form if logged in
            if (authSection) {
                authSection.innerHTML = `
                    <div class="alert alert-success">
                        <h4>Đã đăng nhập thành công!</h4>
                        <p>Bạn có thể sử dụng các chức năng quản trị.</p>
                        <button id="logoutBtn" class="btn btn-danger">Đăng xuất</button>
                    </div>
                `;
                
                // Add logout handler
                document.getElementById('logoutBtn').addEventListener('click', logout);
            }
        } else {
            // Show login form if not logged in
            if (authSection) {
                authSection.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">Đăng nhập Admin</div>
                                <div class="card-body">
                                    <form id="loginForm">
                                        <div class="mb-3">
                                            <label for="email" class="form-label">Email</label>
                                            <input type="email" class="form-control" id="email" value="admin@example.com">
                                        </div>
                                        <div class="mb-3">
                                            <label for="password" class="form-label">Mật khẩu</label>
                                            <input type="password" class="form-control" id="password" value="adminpassword123">
                                        </div>
                                        <button type="submit" class="btn btn-primary">Đăng nhập</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Re-attach login form handler
                document.getElementById('loginForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    try {
                        const response = await fetch(`${BASE_URL}/users/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email, password })
                        });
                        
                        const data = await response.json();
                        displayResponse(data);
                        
                        if (data.token) {
                            adminToken = data.token;
                            localStorage.setItem('adminToken', adminToken);
                            showNotification('Đăng nhập thành công!', 'success');
                            updateAuthUI(true);
                        } else {
                            showNotification('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'danger');
                        }
                    } catch (error) {
                        displayResponse({ error: error.message });
                        showNotification('Lỗi: ' + error.message, 'danger');
                    }
                });
            }
        }
    }
    
    // Logout function
    function logout() {
        adminToken = '';
        localStorage.removeItem('adminToken');
        updateAuthUI(false);
        showNotification('Đã đăng xuất thành công!', 'success');
    }
    
    // Check if user is already logged in
    if (adminToken) {
        updateAuthUI(true);
    }

    // Brands Management
    const createBrandForm = document.getElementById('createBrandForm');
    const getAllBrandsBtn = document.getElementById('getAllBrands');

    if (createBrandForm) {
        createBrandForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            const name = document.getElementById('brandName').value;
            const description = document.getElementById('brandDescription').value;
            const website = document.getElementById('brandWebsite').value;
            const logo = document.getElementById('brandLogo').value;
            
            try {
                const response = await fetch(`${BASE_URL}/brands`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        website,
                        logo
                    })
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.success) {
                    showNotification('Thương hiệu đã được tạo thành công!', 'success');
                    createBrandForm.reset();
                    getAllBrandsBtn.click(); // Refresh the list
                } else {
                    showNotification('Tạo thương hiệu thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    if (getAllBrandsBtn) {
        getAllBrandsBtn.addEventListener('click', async () => {
            try {
                console.log('Fetching brands data...');
                const response = await fetch(`${BASE_URL}/brands`);
                const data = await response.json();
                console.log('Brands data received:', data);
                displayResponse(data);
                
                if (data.data && Array.isArray(data.data)) {
                    console.log(`Setting up brands table with ${data.data.length} items`);
                    setupSearchAndPagination('brandsTable', data.data, tableConfigs.brandsTable);
                    attachBrandActionListeners();
                } else if (data.data && data.data.brands && Array.isArray(data.data.brands)) {
                    console.log(`Setting up brands table with ${data.data.brands.length} items`);
                    setupSearchAndPagination('brandsTable', data.data.brands, tableConfigs.brandsTable);
                    attachBrandActionListeners();
                } else {
                    console.error('No brands data found in response:', data);
                    showNotification('Không tìm thấy dữ liệu thương hiệu', 'warning');
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    } else {
        console.error('getAllBrandsBtn not found');
    }

    // Suppliers Management
    const createSupplierForm = document.getElementById('createSupplierForm');
    const getAllSuppliersBtn = document.getElementById('getAllSuppliers');

    if (createSupplierForm) {
        createSupplierForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            const supplierData = {
                name: document.getElementById('supplierName').value,
                description: document.getElementById('supplierDescription').value,
                contactInfo: {
                    email: document.getElementById('supplierEmail').value,
                    phone: document.getElementById('supplierPhone').value,
                    contactPerson: document.getElementById('supplierContactPerson').value,
                    website: document.getElementById('supplierWebsite').value
                },
                address: {
                    street: document.getElementById('supplierStreet').value,
                    city: document.getElementById('supplierCity').value,
                    state: document.getElementById('supplierState').value,
                    postalCode: document.getElementById('supplierPostalCode').value,
                    country: document.getElementById('supplierCountry').value
                },
                paymentTerms: document.getElementById('supplierPaymentTerms').value
            };
            
            try {
                const response = await fetch(`${BASE_URL}/suppliers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(supplierData)
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Nhà cung cấp đã được tạo thành công!', 'success');
                    createSupplierForm.reset();
                    getAllSuppliersBtn.click(); // Refresh the list
                } else {
                    showNotification('Tạo nhà cung cấp thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    if (getAllSuppliersBtn) {
        getAllSuppliersBtn.addEventListener('click', async () => {
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            try {
                const response = await fetch(`${BASE_URL}/suppliers`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.data && data.data.suppliers) {
                    setupSearchAndPagination('suppliersTable', data.data.suppliers, tableConfigs.suppliersTable);
                    attachSupplierActionListeners();
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    // Attributes Management
    const createAttributeForm = document.getElementById('createAttributeForm');
    const addAttributeValueForm = document.getElementById('addAttributeValueForm');
    const getAllAttributesBtn = document.getElementById('getAllAttributes');
    const attributeSelect = document.getElementById('attributeSelect');

    if (createAttributeForm) {
        createAttributeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            const name = document.getElementById('attributeName').value;
            const description = document.getElementById('attributeDescription').value;
            
            try {
                const response = await fetch(`${BASE_URL}/attributes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        name,
                        description
                    })
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Thuộc tính đã được tạo thành công!', 'success');
                    createAttributeForm.reset();
                    getAllAttributesBtn.click(); // Refresh the list
                    updateAttributeSelect(); // Update the attribute select dropdown
                } else {
                    showNotification('Tạo thuộc tính thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    if (addAttributeValueForm) {
        addAttributeValueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!adminToken) {
                showNotification('Vui lòng đăng nhập trước!', 'warning');
                return;
            }
            
            const attributeId = attributeSelect.value;
            const value = document.getElementById('attributeValue').value;
            const displayName = document.getElementById('attributeDisplayName').value;
            
            if (!attributeId) {
                showNotification('Vui lòng chọn thuộc tính!', 'warning');
                return;
            }
            
            try {
                const response = await fetch(`${BASE_URL}/attributes/${attributeId}/values`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        value,
                        displayName
                    })
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Giá trị thuộc tính đã được thêm thành công!', 'success');
                    addAttributeValueForm.reset();
                    getAllAttributesBtn.click(); // Refresh the list
                } else {
                    showNotification('Thêm giá trị thuộc tính thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    if (getAllAttributesBtn) {
        getAllAttributesBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${BASE_URL}/attributes`);
                const data = await response.json();
                displayResponse(data);
                
                if (data.data && data.data.attributes) {
                    setupSearchAndPagination('attributesTable', data.data.attributes, tableConfigs.attributesTable);
                    attachAttributeActionListeners();
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });
    }

    // Helper Functions for New Sections
    async function updateAttributeSelect() {
        try {
            const response = await fetch(`${BASE_URL}/attributes`);
            const data = await response.json();
            
            if (data.data && data.data.attributes) {
                attributeSelect.innerHTML = '<option value="">Chọn thuộc tính...</option>';
                data.data.attributes.forEach(attribute => {
                    const option = document.createElement('option');
                    option.value = attribute._id;
                    option.textContent = attribute.name;
                    attributeSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error updating attribute select:', error);
        }
    }

    function attachBrandActionListeners() {
        console.log('Attaching brand action listeners');
        document.querySelectorAll('.view-brand').forEach(btn => {
            btn.addEventListener('click', () => {
                const brandId = btn.getAttribute('data-id');
                console.log('Viewing brand:', brandId);
                viewBrandDetail(brandId);
            });
        });
        
        document.querySelectorAll('.edit-brand').forEach(btn => {
            btn.addEventListener('click', () => {
                const brandId = btn.getAttribute('data-id');
                console.log('Editing brand:', brandId);
                editBrand(brandId);
            });
        });
        
        document.querySelectorAll('.delete-brand').forEach(btn => {
            btn.addEventListener('click', () => {
                const brandId = btn.getAttribute('data-id');
                console.log('Deleting brand:', brandId);
                if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
                    deleteBrand(brandId);
                }
            });
        });
    }

    function attachSupplierActionListeners() {
        document.querySelectorAll('.edit-supplier').forEach(btn => {
            btn.addEventListener('click', () => editSupplier(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-supplier').forEach(btn => {
            btn.addEventListener('click', () => deleteSupplier(btn.dataset.id));
        });
    }

    function attachAttributeActionListeners() {
        document.querySelectorAll('.view-attribute-values').forEach(btn => {
            btn.addEventListener('click', () => viewAttributeValues(btn.dataset.id));
        });
        
        document.querySelectorAll('.edit-attribute').forEach(btn => {
            btn.addEventListener('click', () => editAttribute(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-attribute').forEach(btn => {
            btn.addEventListener('click', () => deleteAttribute(btn.dataset.id));
        });
    }

    async function editBrand(brandId) {
        try {
            // First fetch the brand details
            const response = await fetch(`${BASE_URL}/brands/${brandId}`);
            const data = await response.json();
            
            if (data.data && data.data.brand) {
                const brand = data.data.brand;
                
                // Build a form for editing
                const formHTML = `
                <form id="editBrandForm">
                    <div class="mb-3">
                        <label for="editBrandName" class="form-label">Tên thương hiệu</label>
                        <input type="text" class="form-control" id="editBrandName" value="${brand.name}">
                    </div>
                    <div class="mb-3">
                        <label for="editBrandDescription" class="form-label">Mô tả</label>
                        <textarea class="form-control" id="editBrandDescription">${brand.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="editBrandWebsite" class="form-label">Website</label>
                        <input type="text" class="form-control" id="editBrandWebsite" value="${brand.website || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editBrandLogo" class="form-label">Logo URL</label>
                        <input type="text" class="form-control" id="editBrandLogo" value="${brand.logo || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editBrandStatus" class="form-label">Trạng thái</label>
                        <select class="form-select" id="editBrandStatus">
                            <option value="active" ${brand.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                            <option value="inactive" ${brand.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </form>
                `;
                
                // Create and show modal
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'editBrandModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chỉnh sửa thương hiệu</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${formHTML}
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                // Handle form submission
                document.getElementById('editBrandForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const updatedBrand = {
                        name: document.getElementById('editBrandName').value,
                        description: document.getElementById('editBrandDescription').value,
                        website: document.getElementById('editBrandWebsite').value,
                        logo: document.getElementById('editBrandLogo').value,
                        status: document.getElementById('editBrandStatus').value
                    };
                    
                    try {
                        const updateResponse = await fetch(`${BASE_URL}/brands/${brandId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(updatedBrand)
                        });
                        
                        const updateData = await updateResponse.json();
                        displayResponse(updateData);
                        
                        modalInstance.hide();
                        modal.addEventListener('hidden.bs.modal', () => {
                            modal.remove();
                        });
                        
                        if (updateData.status === 'success') {
                            showNotification('Thương hiệu đã được cập nhật thành công!', 'success');
                            getAllBrandsBtn.click(); // Refresh the list
                        } else {
                            showNotification('Cập nhật thương hiệu thất bại: ' + updateData.message, 'danger');
                        }
                    } catch (error) {
                        displayResponse({ error: error.message });
                        showNotification('Lỗi: ' + error.message, 'danger');
                    }
                });
            } else {
                showNotification('Không tìm thấy thông tin thương hiệu!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    async function deleteBrand(brandId) {
        if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
            try {
                const response = await fetch(`${BASE_URL}/brands/${brandId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.success) {
                    showNotification('Thương hiệu đã được xóa thành công!', 'success');
                    getAllBrandsBtn.click(); // Refresh the list
                } else {
                    showNotification('Xóa thương hiệu thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        }
    }

    async function editSupplier(supplierId) {
        try {
            // First fetch the supplier details
            const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            const data = await response.json();
            
            if (data.data && data.data.supplier) {
                const supplier = data.data.supplier;
                
                // Build a form for editing
                const formHTML = `
                <form id="editSupplierForm">
                    <div class="mb-3">
                        <label for="editSupplierName" class="form-label">Tên nhà cung cấp</label>
                        <input type="text" class="form-control" id="editSupplierName" value="${supplier.name}">
                    </div>
                    <div class="mb-3">
                        <label for="editSupplierEmail" class="form-label">Email</label>
                        <input type="email" class="form-control" id="editSupplierEmail" value="${supplier.contactInfo?.email || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editSupplierPhone" class="form-label">Số điện thoại</label>
                        <input type="text" class="form-control" id="editSupplierPhone" value="${supplier.contactInfo?.phone || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editSupplierAddress" class="form-label">Địa chỉ</label>
                        <input type="text" class="form-control" id="editSupplierAddress" value="${supplier.address || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editSupplierStatus" class="form-label">Trạng thái</label>
                        <select class="form-select" id="editSupplierStatus">
                            <option value="active" ${supplier.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                            <option value="inactive" ${supplier.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </form>
                `;
                
                // Create and show modal
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'editSupplierModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chỉnh sửa nhà cung cấp</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${formHTML}
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                // Handle form submission
                document.getElementById('editSupplierForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const updatedSupplier = {
                        name: document.getElementById('editSupplierName').value,
                        contactInfo: {
                            email: document.getElementById('editSupplierEmail').value,
                            phone: document.getElementById('editSupplierPhone').value
                        },
                        address: document.getElementById('editSupplierAddress').value,
                        status: document.getElementById('editSupplierStatus').value
                    };
                    
                    try {
                        const updateResponse = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(updatedSupplier)
                        });
                        
                        const updateData = await updateResponse.json();
                        displayResponse(updateData);
                        
                        modalInstance.hide();
                        modal.addEventListener('hidden.bs.modal', () => {
                            modal.remove();
                        });
                        
                        if (updateData.status === 'success') {
                            showNotification('Nhà cung cấp đã được cập nhật thành công!', 'success');
                            getAllSuppliersBtn.click(); // Refresh the list
                        } else {
                            showNotification('Cập nhật nhà cung cấp thất bại: ' + updateData.message, 'danger');
                        }
                    } catch (error) {
                        displayResponse({ error: error.message });
                        showNotification('Lỗi: ' + error.message, 'danger');
                    }
                });
            } else {
                showNotification('Không tìm thấy thông tin nhà cung cấp!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Delete supplier
    async function deleteSupplier(supplierId) {
        if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            try {
                const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Nhà cung cấp đã được xóa thành công!', 'success');
                    getAllSuppliersBtn.click(); // Refresh the list
                } else {
                    showNotification('Xóa nhà cung cấp thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        }
    }

    // View attribute values
    async function viewAttributeValues(attributeId) {
        try {
            const response = await fetch(`${BASE_URL}/attributes/${attributeId}/values`);
            const data = await response.json();
            displayResponse(data);
            
            // Show values in a modal
            if (data.data && data.data.values) {
                const values = data.data.values;
                
                // Create a table to display values
                let valuesHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Giá trị</th>
                            <th>Tên hiển thị</th>
                        </tr>
                    </thead>
                    <tbody>
                `;
                
                values.forEach(value => {
                    valuesHTML += `
                        <tr>
                            <td>${value._id}</td>
                            <td>${value.value}</td>
                            <td>${value.displayName || value.value}</td>
                        </tr>
                    `;
                });
                
                valuesHTML += `
                    </tbody>
                </table>
                `;
                
                // Create and show modal
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'viewAttributeValuesModal';
                modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Giá trị thuộc tính</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${valuesHTML}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            } else {
                showNotification('Không tìm thấy giá trị nào cho thuộc tính này!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Delete attribute
    async function deleteAttribute(attributeId) {
        if (confirm('Bạn có chắc chắn muốn xóa thuộc tính này?')) {
            try {
                const response = await fetch(`${BASE_URL}/attributes/${attributeId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Thuộc tính đã được xóa thành công!', 'success');
                    getAllAttributesBtn.click(); // Refresh the list
                    updateAttributeSelect(); // Update the attribute select dropdown
                } else {
                    showNotification('Xóa thuộc tính thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        }
    }

    // Initialize attribute select if it exists
    if (attributeSelect) {
        updateAttributeSelect();
    }

    async function editAttribute(attributeId) {
        try {
            // First fetch the attribute details
            const response = await fetch(`${BASE_URL}/attributes/${attributeId}`);
            const data = await response.json();
            
            if (data.data && data.data.attribute) {
                const attribute = data.data.attribute;
                
                // Build a form for editing
                const formHTML = `
                <form id="editAttributeForm">
                    <div class="mb-3">
                        <label for="editAttributeName" class="form-label">Tên thuộc tính</label>
                        <input type="text" class="form-control" id="editAttributeName" value="${attribute.name}">
                    </div>
                    <div class="mb-3">
                        <label for="editAttributeDescription" class="form-label">Mô tả</label>
                        <textarea class="form-control" id="editAttributeDescription">${attribute.description || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </form>
                `;
                
                // Create and show modal
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'editAttributeModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chỉnh sửa thuộc tính</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${formHTML}
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                // Handle form submission
                document.getElementById('editAttributeForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const updatedAttribute = {
                        name: document.getElementById('editAttributeName').value,
                        description: document.getElementById('editAttributeDescription').value
                    };
                    
                    try {
                        const updateResponse = await fetch(`${BASE_URL}/attributes/${attributeId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(updatedAttribute)
                        });
                        
                        const updateData = await updateResponse.json();
                        displayResponse(updateData);
                        
                        modalInstance.hide();
                        modal.addEventListener('hidden.bs.modal', () => {
                            modal.remove();
                        });
                        
                        if (updateData.status === 'success') {
                            showNotification('Thuộc tính đã được cập nhật thành công!', 'success');
                            getAllAttributesBtn.click(); // Refresh the list
                        } else {
                            showNotification('Cập nhật thuộc tính thất bại: ' + updateData.message, 'danger');
                        }
                    } catch (error) {
                        displayResponse({ error: error.message });
                        showNotification('Lỗi: ' + error.message, 'danger');
                    }
                });
            } else {
                showNotification('Không tìm thấy thông tin thuộc tính!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Load data initially when page is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded');
        
        setTimeout(() => {
            console.log('Loading initial data');
            
            // Initial data load (moved from the end of the file)
            if (adminToken) {
                // Load all data that requires authentication
                if (getAllUsersBtn) {
                    console.log('Auto-loading users data');
                    getAllUsersBtn.click();
                }
                if (getAllOrdersBtn) {
                    console.log('Auto-loading orders data');
                    getAllOrdersBtn.click();
                }
                if (getAllSuppliersBtn) {
                    console.log('Auto-loading suppliers data');
                    getAllSuppliersBtn.click();
                }
            }
            
            // Load data that doesn't require authentication
            if (getAllProductsBtn) {
                console.log('Auto-loading products data');
                getAllProductsBtn.click();
            }
            if (getAllBrandsBtn) {
                console.log('Auto-loading brands data');
                getAllBrandsBtn.click();
            }
            if (getAllAttributesBtn) {
                console.log('Auto-loading attributes data');
                getAllAttributesBtn.click();
            }
        }, 1000); // Short delay to ensure all elements are ready
    });

    // Update function to attach product action listeners
    function attachProductActionListeners() {
        document.querySelectorAll('.view-product').forEach(btn => {
            btn.addEventListener('click', () => viewProductDetail(btn.dataset.id));
        });
        
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

    // View product detail
    async function viewProductDetail(productId) {
        try {
            const response = await fetch(`${BASE_URL}/products/${productId}`);
            const data = await response.json();
            displayResponse(data);
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Edit product
    async function editProduct(productId) {
        try {
            // First fetch the product details
            const response = await fetch(`${BASE_URL}/products/${productId}`);
            const data = await response.json();
            
            if (data.data && data.data.product) {
                const product = data.data.product;
                
                // Build a form for editing
                const formHTML = `
                <form id="editProductForm">
                    <div class="mb-3">
                        <label for="editProductName" class="form-label">Tên sản phẩm</label>
                        <input type="text" class="form-control" id="editProductName" value="${product.name}">
                    </div>
                    <div class="mb-3">
                        <label for="editProductDescription" class="form-label">Mô tả</label>
                        <textarea class="form-control" id="editProductDescription">${product.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="editProductPrice" class="form-label">Giá</label>
                        <input type="number" class="form-control" id="editProductPrice" value="${product.price}">
                    </div>
                    <div class="mb-3">
                        <label for="editProductStock" class="form-label">Tồn kho</label>
                        <input type="number" class="form-control" id="editProductStock" value="${product.stock}">
                    </div>
                    <div class="mb-3">
                        <label for="editProductCategory" class="form-label">Danh mục</label>
                        <input type="text" class="form-control" id="editProductCategory" value="${product.category || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editProductStatus" class="form-label">Trạng thái</label>
                        <select class="form-select" id="editProductStatus">
                            <option value="active" ${product.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                            <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </form>
                `;
                
                // Create and show modal
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'editProductModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chỉnh sửa sản phẩm</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${formHTML}
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                // Handle form submission
                document.getElementById('editProductForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const updatedProduct = {
                        name: document.getElementById('editProductName').value,
                        description: document.getElementById('editProductDescription').value,
                        price: Number(document.getElementById('editProductPrice').value),
                        stock: Number(document.getElementById('editProductStock').value),
                        category: document.getElementById('editProductCategory').value,
                        status: document.getElementById('editProductStatus').value
                    };
                    
                    try {
                        const updateResponse = await fetch(`${BASE_URL}/products/${productId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify(updatedProduct)
                        });
                        
                        const updateData = await updateResponse.json();
                        displayResponse(updateData);
                        
                        modalInstance.hide();
                        modal.addEventListener('hidden.bs.modal', () => {
                            modal.remove();
                        });
                        
                        if (updateData.status === 'success') {
                            showNotification('Sản phẩm đã được cập nhật thành công!', 'success');
                            getAllProductsBtn.click(); // Refresh the list
                        } else {
                            showNotification('Cập nhật sản phẩm thất bại: ' + updateData.message, 'danger');
                        }
                    } catch (error) {
                        displayResponse({ error: error.message });
                        showNotification('Lỗi: ' + error.message, 'danger');
                    }
                });
            } else {
                showNotification('Không tìm thấy thông tin sản phẩm!', 'warning');
            }
        } catch (error) {
            displayResponse({ error: error.message });
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Delete product
    async function deleteProduct(productId) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const response = await fetch(`${BASE_URL}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const data = await response.json();
                displayResponse(data);
                
                if (data.status === 'success') {
                    showNotification('Sản phẩm đã được xóa thành công!', 'success');
                    getAllProductsBtn.click(); // Refresh the list
                } else {
                    showNotification('Xóa sản phẩm thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                displayResponse({ error: error.message });
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        }
    }

    // Search and Pagination
    function setupSearchAndPagination(tableId, data, columns) {
        console.log(`Setting up table: ${tableId} with ${data.length} items`);
        
        const tableBody = document.querySelector(`#${tableId} tbody`);
        if (!tableBody) {
            console.error(`Table body not found for ${tableId}`);
            return;
        }
        console.log(`Table body found:`, tableBody);
        
        const searchInput = document.getElementById(`${tableId}Search`);
        console.log(`Search input for ${tableId}:`, searchInput);
        
        const pagination = document.getElementById(`${tableId}Pagination`);
        console.log(`Pagination for ${tableId}:`, pagination);
        
        let currentPage = 1;
        const rowsPerPage = 10;
        let filteredData = [...data];

        function filterData() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            filteredData = data.filter(item => {
                return Object.values(item).some(value => 
                    value && value.toString().toLowerCase().includes(searchTerm)
                );
            });

            displayTableData(1);
        }

        function displayTableData(page) {
            console.log(`Displaying page ${page} for ${tableId}`);
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedData = filteredData.slice(start, end);
            console.log(`Items for this page: ${paginatedData.length}`);

            tableBody.innerHTML = '';

            paginatedData.forEach(item => {
                console.log(`Adding item to ${tableId}:`, item);
                const row = document.createElement('tr');
                let html = '';

                columns.forEach(column => {
                    try {
                        if (column.type === 'image') {
                            html += `<td><img src="${item[column.field] || '/images/placeholder.png'}" alt="${column.alt || ''}" class="img-thumbnail" style="max-width: 50px;"></td>`;
                        } else if (column.type === 'status') {
                            const statusClass = item[column.field] === 'active' ? 'bg-success' : 'bg-danger';
                            html += `<td><span class="badge ${statusClass}">${item[column.field] || 'N/A'}</span></td>`;
                        } else if (column.type === 'currency') {
                            const currencyValue = item[column.field] ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item[column.field]) : 'N/A';
                            html += `<td>${currencyValue}</td>`;
                        } else if (column.type === 'actions') {
                            html += `
                                <td>
                                    <button class="btn btn-sm btn-info view-${column.entity}" data-id="${item._id}" title="Xem chi tiết">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-warning edit-${column.entity}" data-id="${item._id}" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-${column.entity}" data-id="${item._id}" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            `;
                        } else {
                            let value = item[column.field];
                            html += `<td>${value || 'N/A'}</td>`;
                        }
                    } catch (error) {
                        console.error(`Error rendering column ${column.field}:`, error);
                        html += '<td>Error</td>';
                    }
                });

                row.innerHTML = html;
                tableBody.appendChild(row);
            });

            if (pagination) {
                setupPagination(filteredData.length, page);
            }
        }

        function setupPagination(totalItems, currentPage) {
            pagination.innerHTML = '';
            const totalPages = Math.ceil(totalItems / rowsPerPage);

            // Previous button
            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>`;
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) displayTableData(currentPage - 1);
            });
            pagination.appendChild(prevLi);

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
                pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    displayTableData(i);
                });
                pagination.appendChild(pageItem);
            }

            // Next button
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>`;
            nextLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) displayTableData(currentPage + 1);
            });
            pagination.appendChild(nextLi);
        }

        // Event listeners
        if (searchInput) {
            searchInput.addEventListener('input', filterData);
        }

        // Initial display
        displayTableData(1);
    }

    // Table Configurations
    const tableConfigs = {
        usersTable: [
            { field: '_id', type: 'text' },
            { field: 'name', type: 'text' },
            { field: 'email', type: 'text' },
            { field: 'role', type: 'text' },
            { field: 'status', type: 'status' },
            { field: 'createdAt', type: 'date' },
            { field: 'actions', type: 'actions', entity: 'user' }
        ],
        productsTable: [
            { field: '_id', type: 'text' },
            { field: 'image', type: 'image', alt: 'Product Image' },
            { field: 'name', type: 'text' },
            { field: 'price', type: 'currency' },
            { field: 'stock', type: 'text' },
            { field: 'category', type: 'text' },
            { field: 'brand', type: 'text' },
            { field: 'status', type: 'status' },
            { field: 'actions', type: 'actions', entity: 'product' }
        ],
        ordersTable: [
            { field: '_id', type: 'text' },
            { field: 'user.name', type: 'text' },
            { field: 'totalPrice', type: 'currency' },
            { field: 'status', type: 'status' },
            { field: 'paymentMethod', type: 'text' },
            { field: 'createdAt', type: 'date' },
            { field: 'actions', type: 'actions', entity: 'order' }
        ],
        brandsTable: [
            { field: '_id', type: 'text' },
            { field: 'logo', type: 'image', alt: 'Brand Logo' },
            { field: 'name', type: 'text' },
            { field: 'description', type: 'text' },
            { field: 'website', type: 'text' },
            { field: 'status', type: 'status' },
            { field: 'actions', type: 'actions', entity: 'brand' }
        ],
        suppliersTable: [
            { field: '_id', type: 'text' },
            { field: 'name', type: 'text' },
            { field: 'contactInfo.email', type: 'text' },
            { field: 'contactInfo.phone', type: 'text' },
            { field: 'address', type: 'text' },
            { field: 'productCount', type: 'text' },
            { field: 'status', type: 'status' },
            { field: 'actions', type: 'actions', entity: 'supplier' }
        ],
        attributesTable: [
            { field: '_id', type: 'text' },
            { field: 'name', type: 'text' },
            { field: 'description', type: 'text' },
            { field: 'values.length', type: 'text' },
            { field: 'createdAt', type: 'date' },
            { field: 'actions', type: 'actions', entity: 'attribute' }
        ]
    };

    // Create User Modal and Form
    function showCreateUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'createUserModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Thêm người dùng mới</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createUserForm">
                        <div class="mb-3">
                            <label for="userName" class="form-label">Tên người dùng</label>
                            <input type="text" class="form-control" id="userName" required>
                        </div>
                        <div class="mb-3">
                            <label for="userEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="userEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="userPassword" class="form-label">Mật khẩu</label>
                            <input type="password" class="form-control" id="userPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="userRole" class="form-label">Vai trò</label>
                            <select class="form-select" id="userRole" required>
                                <option value="user">Người dùng</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Tạo người dùng</button>
                    </form>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                password: document.getElementById('userPassword').value,
                role: document.getElementById('userRole').value
            };

            try {
                const response = await fetch(`${BASE_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                if (data.status === 'success') {
                    showNotification('Người dùng đã được tạo thành công!', 'success');
                    modalInstance.hide();
                    getAllUsersBtn.click();
                } else {
                    showNotification('Tạo người dùng thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Create Brand Modal and Form
    function showCreateBrandModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'createBrandModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Thêm thương hiệu mới</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createBrandForm">
                        <div class="mb-3">
                            <label for="brandName" class="form-label">Tên thương hiệu</label>
                            <input type="text" class="form-control" id="brandName" required>
                        </div>
                        <div class="mb-3">
                            <label for="brandDescription" class="form-label">Mô tả</label>
                            <textarea class="form-control" id="brandDescription" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="brandWebsite" class="form-label">Website</label>
                            <input type="url" class="form-control" id="brandWebsite">
                        </div>
                        <div class="mb-3">
                            <label for="brandLogo" class="form-label">Logo URL</label>
                            <input type="url" class="form-control" id="brandLogo">
                        </div>
                        <button type="submit" class="btn btn-primary">Tạo thương hiệu</button>
                    </form>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        document.getElementById('createBrandForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const brandData = {
                name: document.getElementById('brandName').value,
                description: document.getElementById('brandDescription').value,
                website: document.getElementById('brandWebsite').value,
                logo: document.getElementById('brandLogo').value
            };

            try {
                const response = await fetch(`${BASE_URL}/brands`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(brandData)
                });

                const data = await response.json();
                if (data.status === 'success') {
                    showNotification('Thương hiệu đã được tạo thành công!', 'success');
                    modalInstance.hide();
                    getAllBrandsBtn.click();
                } else {
                    showNotification('Tạo thương hiệu thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Create Product Modal and Form
    function showCreateProductModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'createProductModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Thêm sản phẩm mới</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createProductForm">
                        <div class="mb-3">
                            <label for="productName" class="form-label">Tên sản phẩm</label>
                            <input type="text" class="form-control" id="productName" required>
                        </div>
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Mô tả</label>
                            <textarea class="form-control" id="productDescription" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="productPrice" class="form-label">Giá</label>
                            <input type="number" class="form-control" id="productPrice" required>
                        </div>
                        <div class="mb-3">
                            <label for="productStock" class="form-label">Số lượng tồn kho</label>
                            <input type="number" class="form-control" id="productStock" required>
                        </div>
                        <div class="mb-3">
                            <label for="productCategory" class="form-label">Danh mục</label>
                            <input type="text" class="form-control" id="productCategory" required>
                        </div>
                        <div class="mb-3">
                            <label for="productBrand" class="form-label">Thương hiệu</label>
                            <select class="form-select" id="productBrand" required>
                                <option value="">Chọn thương hiệu...</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="productImage" class="form-label">URL hình ảnh</label>
                            <input type="url" class="form-control" id="productImage">
                        </div>
                        <button type="submit" class="btn btn-primary">Tạo sản phẩm</button>
                    </form>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        
        // Load brands for select
        loadBrandsForSelect();
        
        modalInstance.show();

        document.getElementById('createProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: Number(document.getElementById('productPrice').value),
                stock: Number(document.getElementById('productStock').value),
                category: document.getElementById('productCategory').value,
                brand: document.getElementById('productBrand').value,
                image: document.getElementById('productImage').value
            };

            try {
                const response = await fetch(`${BASE_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(productData)
                });

                const data = await response.json();
                if (data.status === 'success') {
                    showNotification('Sản phẩm đã được tạo thành công!', 'success');
                    modalInstance.hide();
                    getAllProductsBtn.click();
                } else {
                    showNotification('Tạo sản phẩm thất bại: ' + data.message, 'danger');
                }
            } catch (error) {
                showNotification('Lỗi: ' + error.message, 'danger');
            }
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Load brands for product form
    async function loadBrandsForSelect() {
        try {
            const response = await fetch(`${BASE_URL}/brands`);
            const data = await response.json();
            
            const brandSelect = document.getElementById('productBrand');
            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand._id;
                    option.textContent = brand.name;
                    brandSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    // View brand detail
    async function viewBrandDetail(brandId) {
        try {
            const response = await fetch(`${BASE_URL}/brands/${brandId}`);
            const data = await response.json();
            
            if (data.data && data.data.brand) {
                const brand = data.data.brand;
                
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'viewBrandModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi tiết thương hiệu</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="brand-details">
                                <div class="text-center mb-3">
                                    <img src="${brand.logo || '/images/placeholder.png'}" alt="${brand.name}" class="img-thumbnail" style="max-width: 200px;">
                                </div>
                                <p><strong>ID:</strong> ${brand._id}</p>
                                <p><strong>Tên:</strong> ${brand.name}</p>
                                <p><strong>Mô tả:</strong> ${brand.description || 'Không có mô tả'}</p>
                                <p><strong>Website:</strong> <a href="${brand.website}" target="_blank">${brand.website || 'Không có website'}</a></p>
                                <p><strong>Trạng thái:</strong> <span class="badge ${brand.status === 'active' ? 'bg-success' : 'bg-danger'}">${brand.status}</span></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-warning" onclick="editBrand('${brand._id}')">Chỉnh sửa</button>
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            } else {
                showNotification('Không tìm thấy thông tin thương hiệu!', 'warning');
            }
        } catch (error) {
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // View product detail
    async function viewProductDetail(productId) {
        try {
            const response = await fetch(`${BASE_URL}/products/${productId}`);
            const data = await response.json();
            
            if (data.data && data.data.product) {
                const product = data.data.product;
                
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'viewProductModal';
                modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi tiết sản phẩm</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="product-details">
                                <div class="text-center mb-3">
                                    <img src="${product.image || '/images/placeholder.png'}" alt="${product.name}" class="img-thumbnail" style="max-width: 200px;">
                                </div>
                                <p><strong>ID:</strong> ${product._id}</p>
                                <p><strong>Tên:</strong> ${product.name}</p>
                                <p><strong>Mô tả:</strong> ${product.description || 'Không có mô tả'}</p>
                                <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
                                <p><strong>Tồn kho:</strong> ${product.stock}</p>
                                <p><strong>Danh mục:</strong> ${product.category}</p>
                                <p><strong>Thương hiệu:</strong> ${product.brand?.name || 'Không có thương hiệu'}</p>
                                <p><strong>Trạng thái:</strong> <span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-danger'}">${product.status}</span></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-warning" onclick="editProduct('${product._id}')">Chỉnh sửa</button>
                        </div>
                    </div>
                </div>
                `;
                
                document.body.appendChild(modal);
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            } else {
                showNotification('Không tìm thấy thông tin sản phẩm!', 'warning');
            }
        } catch (error) {
            showNotification('Lỗi: ' + error.message, 'danger');
        }
    }

    // Add event listeners for create buttons
    document.addEventListener('DOMContentLoaded', () => {
        // Create buttons
        const createUserBtn = document.getElementById('createUserBtn');
        const createBrandBtn = document.getElementById('createBrandBtn');
        const createProductBtn = document.getElementById('createProductBtn');

        if (createUserBtn) {
            createUserBtn.addEventListener('click', showCreateUserModal);
        }
        if (createBrandBtn) {
            createBrandBtn.addEventListener('click', showCreateBrandModal);
        }
        if (createProductBtn) {
            createProductBtn.addEventListener('click', showCreateProductModal);
        }
    });
}); 