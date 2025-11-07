(function(){
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8000';

  function qs(sel){return document.querySelector(sel)}

  // Read id from querystring ?id=123
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
    // load post
    fetch(`${API_BASE}/posts/${id}`)
      .then(r => {
        if(!r.ok) throw new Error('Không tải được bài viết');
        return r.json();
      })
      .then(data => {
        const post = (data && data.data) ? data.data : data;
        titleEl.textContent = post.title || '—';
        metaEl.textContent = `ID: ${post.id} • Tác giả: ${post.author_id || '-'} • ${post.created_at || ''}`;
        contentEl.innerHTML = post.content || '';
        btnEdit.href = `edit.html?id=${post.id}`;
      })
      .catch(err => {
        titleEl.textContent = 'Lỗi khi tải bài viết';
        contentEl.textContent = err.message;
      });

    btnDelete.addEventListener('click', function(){
      if(!confirm('Bạn có chắc muốn xoá bài viết này?')) return;
      fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(resp => {
          alert('Xoá thành công');
          window.location.href = 'index.html';
        })
        .catch(err => alert('Lỗi khi xoá'));
    });
  }
})();