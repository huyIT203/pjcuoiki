/**
 * TechShop - API Functions
 * Contains all functions for interacting with the backend API
 */

// Base API URL
let API_BASE_URL = 'http://localhost:5000/api';

// Helper function to show loader
function showLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader-container';
  loader.innerHTML = '<div class="loader"></div>';
  document.body.appendChild(loader);
}

// Helper function to hide loader
function hideLoader() {
  const loader = document.querySelector('.loader-container');
  if (loader) {
    loader.remove();
  }
}

// Helper function to show a toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('notificationToast');
  const toastMessage = document.getElementById('toastMessage');
  
  // Set message
  toastMessage.textContent = message;
  
  // Set background color based on type
  toast.className = toast.className.replace(/bg-\w+/, `bg-${type}`);
  
  // Show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// Helper function to handle API errors
function handleApiError(error) {
  console.error('API Error:', error);
  
  let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = error.response.data.message || errorMessage;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.';
  }
  
  showToast(errorMessage, 'danger');
}

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Authentication API Calls
const AuthAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Redirect to home page
    window.location.href = '/shop/index.html';
  },
  
  // Get current user info
  getCurrentUser: async () => {
    try {
      if (!isLoggedIn()) {
        return null;
      }
      
      showLoader();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.user;
    } catch (error) {
      handleApiError(error);
      
      // If unauthorized, logout
      if (error.response && error.response.status === 401) {
        AuthAPI.logout();
      }
      
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/users/updateMe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/users/updatePassword`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      // Update token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  }
};

// Products API Calls
const ProductAPI = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      showLoader();
      
      // Build query string from params
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    return ProductAPI.getAllProducts({ limit, isFeatured: true });
  },
  
  // Get new arrivals
  getNewArrivals: async (limit = 8) => {
    return ProductAPI.getAllProducts({ limit, sort: '-createdAt' });
  },
  
  // Get products on sale
  getProductsOnSale: async (limit = 8) => {
    return ProductAPI.getAllProducts({ limit, priceDiscount: { $gt: 0 } });
  },
  
  // Get product by ID
  getProductById: async (productId) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.product;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Get product reviews
  getProductReviews: async (productId) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.reviews;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Post a product review
  postProductReview: async (productId, reviewData) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(reviewData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  }
};

// Category API Calls
const CategoryAPI = {
  // Get all categories
  getAllCategories: async () => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.categories;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      showLoader();
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.category;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  }
};

// Order API Calls
const OrderAPI = {
  // Get user orders
  getUserOrders: async () => {
    try {
      if (!isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      showLoader();
      const response = await fetch(`${API_BASE_URL}/orders/myOrders`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.orders;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      showLoader();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.order;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Create new order
  createOrder: async (orderData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      showLoader();
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data.data.order;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      showLoader();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data } };
      }
      
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      hideLoader();
    }
  }
};

// Cart Functions (local storage based)
const CartAPI = {
  // Get cart from localStorage
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], totalPrice: 0 };
  },
  
  // Save cart to localStorage
  saveCart: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  },
  
  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      // Get product details
      const product = await ProductAPI.getProductById(productId);
      
      // Get current cart
      const cart = CartAPI.getCart();
      
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(item => item.product._id === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            stock: product.stock
          },
          quantity: quantity
        });
      }
      
      // Recalculate total price
      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
      
      // Save cart
      CartAPI.saveCart(cart);
      
      // Update cart badge
      CartAPI.updateCartBadge();
      
      return cart;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  // Update cart item quantity
  updateCartItemQuantity: (productId, quantity) => {
    // Get current cart
    const cart = CartAPI.getCart();
    
    // Find item
    const itemIndex = cart.items.findIndex(item => item.product._id === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Recalculate total price
      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
      
      // Save cart
      CartAPI.saveCart(cart);
      
      // Update cart badge
      CartAPI.updateCartBadge();
    }
    
    return cart;
  },
  
  // Remove item from cart
  removeFromCart: (productId) => {
    return CartAPI.updateCartItemQuantity(productId, 0);
  },
  
  // Clear cart
  clearCart: () => {
    const emptyCart = { items: [], totalPrice: 0 };
    CartAPI.saveCart(emptyCart);
    CartAPI.updateCartBadge();
    return emptyCart;
  },
  
  // Update cart badge count
  updateCartBadge: () => {
    const cart = CartAPI.getCart();
    const cartBadge = document.querySelector('.cart-badge');
    
    if (cartBadge) {
      const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      cartBadge.textContent = itemCount;
      
      // Hide badge if cart is empty
      if (itemCount === 0) {
        cartBadge.classList.add('visually-hidden');
      } else {
        cartBadge.classList.remove('visually-hidden');
      }
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Update cart badge
  CartAPI.updateCartBadge();
  
  // Update UI based on login status
  updateUIForAuth();
});

// Update UI elements based on authentication state
function updateUIForAuth() {
  const isAuthenticated = isLoggedIn();
  
  // User dropdown items
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const accountBtn = document.getElementById('accountBtn');
  const ordersBtn = document.getElementById('ordersBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (loginBtn) loginBtn.style.display = isAuthenticated ? 'none' : 'block';
  if (registerBtn) registerBtn.style.display = isAuthenticated ? 'none' : 'block';
  if (accountBtn) accountBtn.style.display = isAuthenticated ? 'block' : 'none';
  if (ordersBtn) ordersBtn.style.display = isAuthenticated ? 'block' : 'none';
  if (logoutBtn) {
    logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        AuthAPI.logout();
      });
    }
  }
}

// Export all APIs
window.AuthAPI = AuthAPI;
window.ProductAPI = ProductAPI;
window.CategoryAPI = CategoryAPI;
window.OrderAPI = OrderAPI;
window.CartAPI = CartAPI; 