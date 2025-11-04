(function(){
  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:8000';
  const qs = (s)=>document.querySelector(s);

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const userEl = qs('#commentUser');
  const metaEl = qs('#commentMeta');
  const contentEl = qs('#commentContent');
  const ratingEl = qs('#commentRating');
  const btnDelete = qs('#btnDelete');

  if(!id){
    userEl.textContent = 'Không tìm thấy id bình luận';
    btnDelete.style.display = 'none';
  } else {
    fetch(`${API_BASE}/comments?id=${encodeURIComponent(id)}`)
      .then(r=>{
        if(!r.ok) throw new Error('Không tải được bình luận');
        return r.json();
      })
      .then(data=>{
        // controller returns { success?, data: [...] } or plain array/object. Try common shapes.
        let comment = null;
        if(Array.isArray(data)) comment = data[0];
        else if(data && data.data){
          if(Array.isArray(data.data)) comment = data.data[0];
          else comment = data.data;
        } else comment = data;

        if(!comment){
          userEl.textContent = 'Không tìm thấy bình luận.';
          return;
        }

        userEl.textContent = comment.username || ('User #' + (comment.user_id || '-'));
        metaEl.textContent = `ID: ${comment.id || '-'} • Loại: ${comment.comment_type || '-'} • Tham chiếu: ${comment.post_id || comment.product_id || '-'} • ${comment.created_at || ''}`;
        contentEl.textContent = comment.content || '';
        ratingEl.textContent = (comment.rating !== undefined && comment.rating !== null) ? comment.rating : '-';

        btnDelete.addEventListener('click', ()=>{
          if(!confirm('Bạn có chắc muốn xoá bình luận này?')) return;
          fetch(`${API_BASE}/comments?id=${id}`, { method: 'DELETE' })
            .then(r=>r.json())
            .then(()=>{
              alert('Đã xoá');
              window.location.href = 'index.html';
            })
            .catch(()=> alert('Lỗi khi xoá'));
        });
      })
      .catch(err=>{
        userEl.textContent = 'Lỗi khi tải bình luận';
        contentEl.textContent = err.message;
      });
  }
})();