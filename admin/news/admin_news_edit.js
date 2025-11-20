import { BASE_URL } from '../../js/config.js';
import { showToast } from '../utils/toast.js';

const API_BASE = BASE_URL || 'http://localhost:8000';

function qs(sel){ return document.querySelector(sel); }

function getIdFromQuery(){ const p = new URLSearchParams(window.location.search); return p.get('id'); }

function waitForNicEditor(timeout = 3000){
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check(){
      if(window.nicEditor){ resolve(window.nicEditor); return; }
      if(Date.now() - start > timeout){ reject(new Error('nicEdit không tải được')); return; }
      setTimeout(check, 100);
    })();
  });
}

async function initEditor(){
  await waitForNicEditor().catch(()=>{});
  try{
    // initialize full toolbar and attach to textarea#content
    new nicEditor({fullPanel:true}).panelInstance('content');
  }catch(e){
    console.warn('nicEdit init failed', e);
  }
}

function getEditorContent(){
  if(window.nicEditors){
    const ed = nicEditors.findEditor('content');
    if(ed && typeof ed.getContent === 'function') return ed.getContent();
  }
  return qs('#content').value;
}

function setEditorContent(html){
  if(window.nicEditors){
    const ed = nicEditors.findEditor('content');
    if(ed && typeof ed.setContent === 'function') { ed.setContent(html); return; }
  }
  qs('#content').value = html;
}

async function uploadImage(file){
  const fd = new FormData();
  fd.append('file', file);
  try{
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
    if(!res.ok) throw new Error('Upload lỗi: ' + res.status);
    const payload = await res.json();
    // support shapes: { success:true, data: { path: '...' } } or { success:true, file: '...'} or { url: '...'}
    if(payload && payload.data && payload.data.path) return payload.data.path;
    if(payload && payload.data && payload.data.url) return payload.data.url;
    if(payload && payload.file) return payload.file;
    if(payload && payload.url) return payload.url;
    // fallback: try to parse message
    return '';
  }catch(err){
    console.error(err);
    throw err;
  }
}

async function loadPost(id){
  try{
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if(!res.ok) throw new Error('Không tải được bài viết');
    const payload = await res.json();
    const post = (payload && payload.data) ? payload.data : payload;
    qs('#title').value = post.title || '';
    qs('#author_id').value = post.author_id || post.user_id || '';
    setEditorContent(post.content || '');
  }catch(err){
    console.error(err);
    showToast({ message: err.message || 'Lỗi khi tải bài viết', type: 'error' });
  }
}

async function savePost(id){
  const title = qs('#title').value.trim();
  const author_id = Number(qs('#author_id').value) || 1;
  const content = getEditorContent();
  if(!title){ showToast({ message: 'Tiêu đề không được để trống', type: 'error' }); return; }
  try{
    const payload = { title, content, author_id };
    const url = id ? `${API_BASE}/posts/${id}` : `${API_BASE}/posts`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('Lỗi lưu bài viết: ' + res.status);
    const body = await res.json().catch(()=> ({}));
    showToast({ message: 'Lưu thành công', type: 'success' });
    // redirect back to list
    setTimeout(()=> window.location.href = 'index.html', 700);
  }catch(err){
    console.error(err);
    showToast({ message: err.message || 'Lỗi khi lưu bài viết', type: 'error' });
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await initEditor();
  const id = getIdFromQuery();
  if(id) loadPost(id);

  qs('#btnInsertImage').addEventListener('click', async (e)=>{
    e.preventDefault();
    const fileEl = qs('#imageFile');
    if(!fileEl.files || !fileEl.files[0]) { showToast({ message: 'Chọn file trước khi chèn', type: 'error' }); return; }
    const file = fileEl.files[0];
    try{
      const url = await uploadImage(file);
      if(!url) { showToast({ message: 'Không lấy được đường dẫn ảnh', type: 'error' }); return; }
      // insert image HTML into editor
      const imgHtml = `<img src="${url}" alt="image" />`;
      const current = getEditorContent() || '';
      setEditorContent(current + '\n' + imgHtml);
      showToast({ message: 'Đã chèn ảnh', type: 'success' });
      // clear file input
      fileEl.value = '';
    }catch(err){
      showToast({ message: 'Lỗi upload ảnh', type: 'error' });
    }
  });

  qs('#btnSave').addEventListener('click', async ()=>{
    const id = getIdFromQuery();
    await savePost(id);
  });
});
