import { showToast } from '../utils/toast.js';

(function(){
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8000';

  function qs(sel){return document.querySelector(sel)}

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const titleEl = qs('#postTitle');
  const metaEl = qs('#postMeta');
  const contentEl = qs('#postContent');
  const btnEdit = qs('#btnEdit');
  const btnDelete = qs('#btnDelete');

  if(!id){
    titleEl.textContent = 'Không tìm thấy id bài viết';
    btnEdit.style.display = 'none';
    btnDelete.style.display = 'none';
  } else {
    // Load post
    fetch(`${API_BASE}/posts/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Lỗi tải bài viết'))
      .then(data => {
        const post = (data && data.data) ? data.data : data;
        titleEl.textContent = post.title || '—';
        metaEl.textContent = `ID: ${post.id} • Tác giả: ${post.author_id || '-'} • ${post.created_at || ''}`;
        contentEl.innerHTML = post.content || '';
        btnEdit.href = `edit.html?id=${post.id}`;
      })
      .catch(err => {
        titleEl.textContent = 'Lỗi khi tải bài viết';
        contentEl.textContent = err.message || err;
      });

    // Load comments
    fetch(`${API_BASE}/comments?type=post&id=${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Lỗi tải comments'))
      .then(data => {
        const comments = (data && data.data) ? data.data : (Array.isArray(data) ? data : []);
        displayComments(comments);
      })
      .catch(err => {
        qs('#commentsContainer').innerHTML = '<p class="text-muted">Không thể tải bình luận</p>';
      });

    btnDelete.addEventListener('click', function(){
      fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(resp => {
          showToast({ message: 'Xoá thành công', type: 'success' });
          setTimeout(() => window.location.href = 'index.html', 1000);
        })
        .catch(err => showToast({ message: 'Lỗi khi xoá', type: 'error' }));
    });
  }

  function displayComments(comments) {
    const container = qs('#commentsContainer');
    const countEl = qs('#commentCount');
    
    countEl.textContent = comments.length;
    
    if(comments.length === 0) {
      container.innerHTML = '<p class="text-muted">Chưa có bình luận nào</p>';
      return;
    }

    container.innerHTML = comments.map(c => `
      <div class="card mb-2">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <strong>${c.user_name || 'User #' + c.user_id}</strong>
            <span class="text-muted">${new Date(c.created_at).toLocaleString('vi-VN')}</span>
          </div>
          <div class="mt-2">${c.content || ''}</div>
          ${c.rating ? `<div class="mt-1"><span class="text-warning">${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</span></div>` : ''}
        </div>
      </div>
    `).join('');
  }
})();