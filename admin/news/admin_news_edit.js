import { showToast } from '../utils/toast.js';

const API_BASE = 'http://localhost:8000';

let editor = null;
let users = [];
let uploadedImagePath = null; // Store uploaded image path

function qs(sel){ return document.querySelector(sel); }

function getIdFromQuery(){ 
  const p = new URLSearchParams(window.location.search); 
  return p.get('id'); 
}

// Generate slug from title
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Initialize Quill Editor
function initEditor(){
  try {
    const toolbarOptions = [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ];

    editor = new Quill('#editor-container', {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Nhập nội dung bài viết...'
    });
    
    return editor;
  } catch(e) {
    console.warn('Quill init failed', e);
  }
}

function getEditorContent(){
  if(editor) {
    return editor.root.innerHTML;
  }
  return qs('#content').value;
}

function setEditorContent(html){
  if(editor) {
    editor.root.innerHTML = html || '';
  } else {
    qs('#content').value = html;
  }
}

// Upload image to server
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'news'); // Upload to assets/uploads/news
    formData.append('target', 'assets');
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed: ' + response.status);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }
    
    // Return relative path (e.g., "assets/uploads/news/image-name.jpg")
    return result.relativePath;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Load users list
async function loadUsers(){
  try{
    const res = await fetch(`${API_BASE}/users`);
    if(!res.ok) throw new Error('Không tải được danh sách users');
    const payload = await res.json();
    users = (payload && payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
    
    // Populate author select
    const authorSelect = qs('#author_id');
    authorSelect.innerHTML = '<option value="">-- Chọn tác giả --</option>';
    
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.name}${user.role === 'admin' ? ' (Admin)' : ''}`;
      authorSelect.appendChild(option);
    });
    
    // Set default to current user or first admin
    const currentUser = users.find(u => u.role === 'admin');
    if(currentUser) {
      authorSelect.value = currentUser.id;
    }
  }catch(err){
    console.error(err);
    showToast({ message: 'Không thể tải danh sách tác giả', type: 'warning' });
  }
}

async function loadPost(id){
  try{
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if(!res.ok) throw new Error('Không tải được bài viết');
    const payload = await res.json();
    const post = (payload && payload.data) ? payload.data : payload;
    
    // Update page title
    qs('#pageTitle').textContent = 'Sửa bài viết';
    qs('#pageSubtitle').textContent = `Chỉnh sửa bài viết #${id}`;
    
    // Fill form
    const titleInput = qs('#title');
    const slugInput = qs('#slug');
    const excerptInput = qs('#excerpt');
    const authorSelect = qs('#author_id');
    const statusSelect = qs('#status');
    const publishedInput = qs('#published_at');
    const imageUrlInput = qs('#imageUrl');
    const imagePreview = qs('#imagePreview');
    
    if(titleInput) titleInput.value = post.title || '';
    if(slugInput) slugInput.value = post.slug || '';
    if(excerptInput) excerptInput.value = post.excerpt || '';
    
    // Set author (wait for users to be loaded)
    if(authorSelect) {
      authorSelect.value = post.author_id || post.user_id || 1;
    }
    
    // Set status
    if(statusSelect) {
      statusSelect.value = post.status || 'draft';
      console.log('Setting status to:', post.status || 'draft');
    }
    
    // Set published date
    if(post.published_at && publishedInput) {
      const date = new Date(post.published_at);
      publishedInput.value = date.toISOString().slice(0, 16);
    }
    
    // Set image
    if(post.image) {
      if(imageUrlInput) imageUrlInput.value = post.image;
      if(imagePreview) {
        imagePreview.src = post.image;
        imagePreview.classList.add('show');
      }
    }
    
    // Set content
    setEditorContent(post.content || '');
  }catch(err){
    console.error(err);
    showToast({ message: err.message || 'Lỗi khi tải bài viết', type: 'error' });
  }
}

async function savePost(id, autoPublish = false){
  const title = qs('#title').value.trim();
  const slug = qs('#slug').value.trim();
  const excerpt = qs('#excerpt').value.trim();
  const author_id = Number(qs('#author_id').value) || 1;
  const status = autoPublish ? 'published' : qs('#status').value;
  const published_at = qs('#published_at').value || null;
  const image = qs('#imageUrl').value.trim() || null;
  const content = getEditorContent();
  
  if(!title){ 
    showToast({ message: 'Tiêu đề không được để trống', type: 'error' }); 
    return; 
  }
  
  try{
    const payload = { 
      title, 
      slug: slug || generateSlug(title),
      excerpt,
      content, 
      author_id,
      status,
      published_at,
      image
    };
    
    const url = id ? `${API_BASE}/posts/${id}` : `${API_BASE}/posts`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    if(!res.ok) throw new Error('Lỗi lưu bài viết: ' + res.status);
    const body = await res.json().catch(()=> ({}));
    
    showToast({ 
      message: autoPublish ? 'Đã lưu và xuất bản thành công!' : 'Lưu thành công!', 
      type: 'success' 
    });
    
    // redirect back to list
    setTimeout(()=> window.location.href = 'index.html', 1000);
  }catch(err){
    console.error(err);
    showToast({ message: err.message || 'Lỗi khi lưu bài viết', type: 'error' });
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  // Load users first
  await loadUsers();
  
  // Initialize editor (synchronous for Quill)
  initEditor();
  
  // Load post if editing
  const id = getIdFromQuery();
  if(id) {
    // Wait a bit for editor to be ready
    setTimeout(() => loadPost(id), 300);
  }

  // Auto-generate slug from title
  const titleInput = qs('#title');
  if(titleInput) {
    titleInput.addEventListener('input', (e) => {
      const slug = generateSlug(e.target.value);
      const slugInput = qs('#slug');
      if(slugInput) slugInput.value = slug;
    });
  }

  // Image file preview and upload
  const imageFile = qs('#imageFile');
  if(imageFile) {
    imageFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if(file) {
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = qs('#imagePreview');
          if(preview) {
            preview.src = event.target.result;
            preview.classList.add('show');
          }
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        try {
          showToast({ message: 'Đang upload ảnh...', type: 'info' });
          const imagePath = await uploadImage(file);
          uploadedImagePath = imagePath;
          
          // Update URL input with uploaded path
          const urlInput = qs('#imageUrl');
          if(urlInput) urlInput.value = imagePath;
          
          showToast({ message: 'Upload ảnh thành công!', type: 'success' });
        } catch (error) {
          showToast({ message: 'Lỗi upload ảnh: ' + error.message, type: 'error' });
          // Clear file input on error
          e.target.value = '';
        }
      }
    });
  }

  // Image URL preview
  const imageUrl = qs('#imageUrl');
  if(imageUrl) {
    imageUrl.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      const preview = qs('#imagePreview');
      if(url && preview) {
        preview.src = url;
        preview.classList.add('show');
        const fileInput = qs('#imageFile');
        if(fileInput) fileInput.value = '';
      } else if(preview) {
        preview.classList.remove('show');
      }
    });
  }

  // Save button
  const btnSave = qs('#btnSave');
  if(btnSave) {
    btnSave.addEventListener('click', async ()=>{
      const id = getIdFromQuery();
      await savePost(id, false);
    });
  }

  // Save and Publish button
  const btnSaveAndPublish = qs('#btnSaveAndPublish');
  if(btnSaveAndPublish) {
    btnSaveAndPublish.addEventListener('click', async ()=>{
      const id = getIdFromQuery();
      await savePost(id, true);
    });
  }
});
