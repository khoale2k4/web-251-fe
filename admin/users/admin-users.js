import { mountAdminSidebar } from '../../components/AdminSidebar.js';
import { requireAdmin, getCurrentAdmin } from '../utils/adminAuth.js';

const API_BASE = 'http://localhost:8000';

// Kiểm tra quyền admin
if (!requireAdmin()) {
  throw new Error('Unauthorized');
}

const currentAdmin = getCurrentAdmin();

/**
 * Load danh sách users
 */
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE}/users`);
    const result = await response.json();

    const tbody = document.getElementById('usersTableBody');
    
    if (!result.success || !result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Không có user nào</td></tr>';
      return;
    }

    tbody.innerHTML = result.data.map(user => {
      const avatar = user.name.charAt(0).toUpperCase();
      const statusBadge = user.status === 'active' 
        ? '<span class="badge bg-success">Active</span>' 
        : '<span class="badge bg-danger">Banned</span>';
      const roleBadge = user.role === 'admin'
        ? '<span class="badge badge-role badge-admin"><i class="ti ti-crown"></i> Admin</span>'
        : '<span class="badge badge-role badge-member">Member</span>';
      
      const date = new Date(user.created_at).toLocaleDateString('vi-VN');
      
      return `
        <tr>
          <td>${user.id}</td>
          <td>
            <div class="d-flex align-items-center">
              <div class="user-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                ${avatar}
              </div>
              <div class="ms-2">
                <div class="fw-bold">${user.name}</div>
                ${user.must_change_password ? '<span class="badge bg-warning badge-sm">Cần đổi mật khẩu</span>' : ''}
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td>${date}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
                <i class="ti ti-edit"></i>
              </button>
              ${user.role !== 'admin' ? `
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                  <i class="ti ti-trash"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Lỗi khi tải dữ liệu</td></tr>';
  }
}

/**
 * Load yêu cầu reset password
 */
async function loadPasswordResetRequests(status = 'pending') {
  try {
    const url = status 
      ? `${API_BASE}/password-reset/all?status=${status}`
      : `${API_BASE}/password-reset/all`;
    
    const response = await fetch(url);
    const result = await response.json();

    const tbody = document.getElementById('requestsTableBody');
    
    if (!result.success || !result.requests || result.requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Không có yêu cầu nào</td></tr>';
      return;
    }

    tbody.innerHTML = result.requests.map(req => {
      let statusBadge;
      if (req.status === 'pending') {
        statusBadge = '<span class="badge bg-warning">Chờ duyệt</span>';
      } else if (req.status === 'approved') {
        statusBadge = '<span class="badge bg-success">Đã duyệt</span>';
      } else {
        statusBadge = '<span class="badge bg-danger">Đã từ chối</span>';
      }
      
      const date = new Date(req.created_at).toLocaleDateString('vi-VN');
      
      return `
        <tr>
          <td>${req.id}</td>
          <td>
            <div class="fw-bold">${req.user_name}</div>
            <div class="text-muted small">${req.user_email}</div>
          </td>
          <td>${req.reason || '<em class="text-muted">Không có</em>'}</td>
          <td>${statusBadge}</td>
          <td>${date}</td>
          <td>
            ${req.status === 'pending' ? `
              <div class="btn-group btn-group-sm">
                <button class="btn btn-sm btn-success" onclick="approveRequest(${req.id}, '${req.user_name}')">
                  <i class="ti ti-check"></i> Duyệt
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectRequest(${req.id})">
                  <i class="ti ti-x"></i> Từ chối
                </button>
              </div>
            ` : `
              <div class="text-muted small">
                ${req.admin_name ? `Bởi: ${req.admin_name}` : ''}
              </div>
            `}
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading requests:', error);
    const tbody = document.getElementById('requestsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Lỗi khi tải dữ liệu</td></tr>';
  }
}

/**
 * Duyệt yêu cầu reset password
 */
window.approveRequest = async function(requestId, userName) {
  const note = prompt(`Duyệt yêu cầu reset password cho "${userName}"?\nGhi chú (tùy chọn):`);
  
  if (note === null) return; // User cancelled
  
  try {
    const response = await fetch(`${API_BASE}/password-reset/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        admin_id: currentAdmin.id,
        admin_note: note || null
      })
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ ${result.message}\n\nUser có thể đăng nhập với password: 12345678`);
      loadPasswordResetRequests(document.getElementById('filterStatus').value);
    } else {
      alert('❌ Lỗi: ' + result.error);
    }
  } catch (error) {
    console.error('Error approving request:', error);
    alert('❌ Lỗi khi duyệt yêu cầu');
  }
};

/**
 * Từ chối yêu cầu reset password
 */
window.rejectRequest = async function(requestId) {
  const note = prompt('Lý do từ chối:');
  
  if (!note) {
    alert('Vui lòng nhập lý do từ chối');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/password-reset/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        admin_id: currentAdmin.id,
        admin_note: note
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('✅ Yêu cầu đã bị từ chối');
      loadPasswordResetRequests(document.getElementById('filterStatus').value);
    } else {
      alert('❌ Lỗi: ' + result.error);
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    alert('❌ Lỗi khi từ chối yêu cầu');
  }
};

/**
 * Khởi chạy
 */
document.addEventListener('DOMContentLoaded', () => {
  mountAdminSidebar('.mount-admin-sidebar', 'admin-users');
  
  loadUsers();
  loadPasswordResetRequests('pending');
  
  // Filter status change
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    loadPasswordResetRequests(e.target.value);
  });
  
  // Search user (simple filter)
  document.getElementById('searchUser').addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchText) ? '' : 'none';
    });
  });
});
