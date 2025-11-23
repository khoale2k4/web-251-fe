/**
 * File ví dụ về cách sử dụng Auth Helper
 * Copy các đoạn code này vào file tương ứng của bạn
 */

import { requireLogin, isLoggedIn, getCurrentUser, getUserId } from './auth.js';

// ============================================
// VÍ DỤ 1: Trang Product Detail
// ============================================

// Nút "Thêm vào giỏ hàng"
function setupAddToCartButton() {
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      // Yêu cầu đăng nhập
      if (!requireLogin('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')) {
        return; // Đã tự động redirect
      }

      // Code thêm vào giỏ hàng
      const productId = getProductIdFromURL();
      const quantity = document.getElementById('quantity').value;
      
      await addToCart(productId, quantity);
    });
  }
}

// Form bình luận sản phẩm
function setupProductCommentForm() {
  const commentForm = document.getElementById('comment-form');
  
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Yêu cầu đăng nhập
      if (!requireLogin('Vui lòng đăng nhập để bình luận')) {
        return;
      }

      const userId = getUserId();
      const content = document.getElementById('comment-content').value;
      const rating = document.getElementById('rating').value;
      
      await submitComment({
        user_id: userId,
        product_id: getProductIdFromURL(),
        content: content,
        rating: rating
      });
    });
  }
}


// ============================================
// VÍ DỤ 2: Trang Cart
// ============================================

// Kiểm tra ngay khi load trang
function initCartPage() {
  // Yêu cầu đăng nhập ngay khi vào trang
  if (!requireLogin('Vui lòng đăng nhập để xem giỏ hàng')) {
    return;
  }
  
  // Load cart của user
  loadUserCart();
}

async function loadUserCart() {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_BASE}/carts/${userId}`);
    const result = await response.json();
    
    if (result.success) {
      displayCart(result.data);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}


// ============================================
// VÍ DỤ 3: Hiển thị UI khác nhau cho Guest vs Logged In
// ============================================

function setupProductPage() {
  if (isLoggedIn()) {
    // User đã đăng nhập - hiển thị nút Add to Cart
    document.getElementById('add-to-cart-btn').style.display = 'block';
    document.getElementById('comment-form').style.display = 'block';
  } else {
    // Guest - hiển thị nút "Đăng nhập để mua hàng"
    const loginPrompt = document.createElement('button');
    loginPrompt.textContent = 'Đăng nhập để mua hàng';
    loginPrompt.className = 'btn-primary';
    loginPrompt.onclick = () => {
      window.location.href = '/fe/pages/home/login.html';
    };
    
    document.getElementById('product-actions').appendChild(loginPrompt);
    
    // Ẩn form bình luận, hiển thị message
    document.getElementById('comment-form').style.display = 'none';
    document.getElementById('comment-login-prompt').style.display = 'block';
  }
}


// ============================================
// VÍ DỤ 4: Hiển thị thông tin User
// ============================================

function displayUserInfo() {
  const user = getCurrentUser();
  
  if (user) {
    // Hiển thị thông tin
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-role').textContent = user.role;
    
    // Hiển thị avatar nếu có
    if (user.avatar) {
      document.getElementById('user-avatar').src = user.avatar;
    }
  }
}


// ============================================
// VÍ DỤ 5: Nút "Mua ngay" với kiểm tra đăng nhập
// ============================================

function setupBuyNowButton() {
  const buyNowBtn = document.getElementById('buy-now-btn');
  
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', async () => {
      // Kiểm tra đăng nhập
      if (!requireLogin('Bạn cần đăng nhập để mua hàng')) {
        return;
      }

      // Lấy thông tin sản phẩm
      const productId = getProductIdFromURL();
      const quantity = document.getElementById('quantity').value;
      const user = getCurrentUser();
      
      // Chuyển đến trang checkout với thông tin
      window.location.href = `/fe/pages/checkout/checkout.html?product=${productId}&qty=${quantity}`;
    });
  }
}


// ============================================
// VÍ DỤ 6: Bình luận bài viết (News Detail)
// ============================================

function setupNewsCommentForm() {
  const commentForm = document.getElementById('news-comment-form');
  
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Yêu cầu đăng nhập
      if (!requireLogin('Vui lòng đăng nhập để bình luận bài viết')) {
        return;
      }

      const userId = getUserId();
      const content = document.getElementById('comment-content').value;
      const postId = getPostIdFromURL();
      
      try {
        const response = await fetch(`${API_BASE}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            post_id: postId,
            content: content,
            comment_type: 'post'
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Bình luận thành công!');
          commentForm.reset();
          loadComments(); // Reload comments
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Có lỗi xảy ra khi gửi bình luận');
      }
    });
  }
}


// ============================================
// VÍ DỤ 7: Trang Profile (yêu cầu đăng nhập ngay)
// ============================================

function initProfilePage() {
  // Kiểm tra đăng nhập ngay khi vào trang
  if (!requireLogin('Vui lòng đăng nhập để xem profile')) {
    return;
  }
  
  // Load profile data
  loadUserProfile();
}

async function loadUserProfile() {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    const result = await response.json();
    
    if (result.success || result.id) {
      const user = result.data || result;
      displayProfile(user);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}


// ============================================
// VÍ DỤ 8: Toggle hiển thị content dựa trên login status
// ============================================

function setupConditionalContent() {
  const loggedInOnly = document.querySelectorAll('.logged-in-only');
  const guestOnly = document.querySelectorAll('.guest-only');
  
  if (isLoggedIn()) {
    // Hiển thị content cho user đã đăng nhập
    loggedInOnly.forEach(el => el.style.display = 'block');
    guestOnly.forEach(el => el.style.display = 'none');
  } else {
    // Hiển thị content cho guest
    loggedInOnly.forEach(el => el.style.display = 'none');
    guestOnly.forEach(el => el.style.display = 'block');
  }
}


// ============================================
// HELPER FUNCTIONS
// ============================================

function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function addToCart(productId, quantity) {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_BASE}/carts/${userId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Đã thêm vào giỏ hàng!');
      // Update cart counter
      updateCartCounter();
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Có lỗi xảy ra');
  }
}


// ============================================
// EXPORT (nếu cần)
// ============================================

export {
  setupAddToCartButton,
  setupProductCommentForm,
  initCartPage,
  setupBuyNowButton,
  setupNewsCommentForm,
  initProfilePage,
  setupConditionalContent
};
