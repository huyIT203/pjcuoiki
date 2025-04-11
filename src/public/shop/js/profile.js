/**
 * VietShop - Profile Page JavaScript
 * Handles user profile page functionality including user data loading,
 * profile updates, and password changes
 */

// Initialize profile page
function initProfilePage() {
    console.log('Initializing profile page...');
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || !userData) {
        // Redirect to login page if not logged in
        console.log('User not logged in, redirecting...');
        window.location.href = 'index.html?showLogin=true';
        return;
    }
    
    // Load user data
    loadUserProfile(userData);
    
    // Setup event listeners
    setupProfileEventListeners();
}

/**
 * Load user profile data into the form
 * @param {Object} userData - User data from localStorage
 */
function loadUserProfile(userData) {
    console.log('Loading user profile data:', userData);
    
    // Update user information in the sidebar
    document.querySelectorAll('.user-name').forEach(element => {
        element.textContent = userData.name || 'Người dùng';
    });
    
    document.querySelectorAll('.user-email').forEach(element => {
        element.textContent = userData.email || '';
    });
    
    document.querySelectorAll('.user-role').forEach(element => {
        const role = userData.role || 'user';
        let roleText = 'Người dùng';
        
        if (role === 'admin') roleText = 'Quản trị viên';
        else if (role === 'staff') roleText = 'Nhân viên';
        
        element.textContent = roleText;
    });
    
    // Fill profile form
    const userNameField = document.getElementById('userName');
    const userEmailField = document.getElementById('userEmail');
    const userPhoneField = document.getElementById('userPhone');
    const userAddressField = document.getElementById('userAddress');
    
    if (userNameField) userNameField.value = userData.name || '';
    if (userEmailField) userEmailField.value = userData.email || '';
    if (userPhoneField) userPhoneField.value = userData.phone || '';
    if (userAddressField) userAddressField.value = userData.address || '';
    
    // Make additional API call to fetch latest user data if needed
    fetchUserData();
}

/**
 * Fetch latest user data from the API
 */
function fetchUserData() {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    console.log('Fetching latest user data from API...');
    
    fetch(`${API_BASE_URL}/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        console.log('User data fetched successfully:', data);
        
        let userData;
        
        // Handle different API response formats
        if (data.data && data.data.user) {
            userData = data.data.user;
        } else if (data.user) {
            userData = data.user;
        } else if (data._id) {
            userData = data;
        } else {
            console.warn('Unknown API response format:', data);
            return;
        }
        
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update form with latest data
        loadUserProfile(userData);
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        showToast('Không thể tải thông tin người dùng mới nhất.', 'warning');
    });
}

/**
 * Setup event listeners for profile page
 */
function setupProfileEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
            modal.show();
        });
    }
    
    // Change password form submission
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
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
 * Update user profile
 */
function updateProfile() {
    const userNameField = document.getElementById('userName');
    const userPhoneField = document.getElementById('userPhone');
    const userAddressField = document.getElementById('userAddress');
    
    if (!userNameField) return;
    
    const updateData = {
        name: userNameField.value,
        phone: userPhoneField ? userPhoneField.value : '',
        address: userAddressField ? userAddressField.value : ''
    };
    
    console.log('Updating profile with data:', updateData);
    
    const token = localStorage.getItem('userToken');
    if (!token) {
        showToast('Bạn cần đăng nhập lại để thực hiện thao tác này.', 'warning');
        return;
    }
    
    const successAlert = document.getElementById('profileUpdateSuccess');
    const errorAlert = document.getElementById('profileUpdateError');
    
    if (successAlert) successAlert.classList.add('d-none');
    if (errorAlert) errorAlert.classList.add('d-none');
    
    // Call API to update profile
    fetch(`${API_BASE_URL}/users/updateMe`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Không thể cập nhật thông tin.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile updated successfully:', data);
        
        // Show success message
        if (successAlert) successAlert.classList.remove('d-none');
        
        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Merge updated data
        const updatedUserData = {
            ...userData,
            name: updateData.name,
            phone: updateData.phone,
            address: updateData.address
        };
        
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Update UI
        loadUserProfile(updatedUserData);
        
        // Show toast notification
        showToast('Thông tin cá nhân đã được cập nhật thành công!', 'success');
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        
        // Show error message
        if (errorAlert) {
            errorAlert.textContent = error.message;
            errorAlert.classList.remove('d-none');
        }
        
        // Show toast notification
        showToast(error.message || 'Có lỗi xảy ra khi cập nhật thông tin.', 'danger');
    });
}

/**
 * Change user password
 */
function changePassword() {
    const currentPasswordField = document.getElementById('currentPassword');
    const newPasswordField = document.getElementById('newPassword');
    const confirmNewPasswordField = document.getElementById('confirmNewPassword');
    
    if (!currentPasswordField || !newPasswordField || !confirmNewPasswordField) return;
    
    const currentPassword = currentPasswordField.value;
    const newPassword = newPasswordField.value;
    const confirmNewPassword = confirmNewPasswordField.value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showToast('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'warning');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'warning');
        return;
    }
    
    const token = localStorage.getItem('userToken');
    if (!token) {
        showToast('Bạn cần đăng nhập lại để thực hiện thao tác này.', 'warning');
        return;
    }
    
    const successAlert = document.getElementById('passwordChangeSuccess');
    const errorAlert = document.getElementById('passwordChangeError');
    
    if (successAlert) successAlert.classList.add('d-none');
    if (errorAlert) errorAlert.classList.add('d-none');
    
    // Call API to change password
    fetch(`${API_BASE_URL}/users/updateMyPassword`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            passwordCurrent: currentPassword,
            password: newPassword,
            passwordConfirm: confirmNewPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Không thể cập nhật mật khẩu.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Password changed successfully:', data);
        
        // If response contains a new token, update it
        if (data.token) {
            localStorage.setItem('userToken', data.token);
        }
        
        // Show success message
        if (successAlert) successAlert.classList.remove('d-none');
        
        // Clear password fields
        currentPasswordField.value = '';
        newPasswordField.value = '';
        confirmNewPasswordField.value = '';
        
        // Show toast notification
        showToast('Mật khẩu đã được cập nhật thành công!', 'success');
        
        // Close modal after a short delay
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            if (modal) modal.hide();
        }, 2000);
    })
    .catch(error => {
        console.error('Error changing password:', error);
        
        // Show error message
        if (errorAlert) {
            errorAlert.textContent = error.message;
            errorAlert.classList.remove('d-none');
        }
        
        // Show toast notification
        showToast(error.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.', 'danger');
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