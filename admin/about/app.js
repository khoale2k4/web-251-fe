(() => {
  'use strict';
  // ===== Dummy Data & State =====
  const PAGES = [
    { id: 1, title: 'Trang chủ', slug: '', updatedAt: '2025-10-20 14:24', published: true },
    { id: 2, title: 'Giới thiệu', slug: 'gioi-thieu', updatedAt: '2025-10-18 09:01', published: true },
    { id: 3, title: 'Liên hệ', slug: 'lien-he', updatedAt: '2025-10-10 16:45', published: false },
  ];
  const state = { page: 1, perPage: 5, query: '', current: null, tags: [] };

  // ===== Helpers =====
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const formatDate = (d = new Date()) => d.toLocaleString('vi-VN');
  const escapeHtml = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // ===== View routing =====
  function showView(name){
    $$("[data-view]").forEach(v => v.classList.remove('active'));
    $("#view-" + name).classList.add('active');
  }
  $$("[data-route]").forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const r = a.getAttribute('data-route');
    showView(r);
  }));

  // ===== Pages table (list) =====
  function renderTable(){
    const tbody = $("#pages-table tbody");
    tbody.innerHTML = '';
    let rows = PAGES.filter(p => p.title.toLowerCase().includes(state.query));
    const total = rows.length; $("#count").textContent = total;
    const start = (state.page-1)*state.perPage; const end = start + state.perPage;
    rows.slice(start, end).forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.title}</strong></td>
        <td>/${p.slug||''}</td>
        <td>${p.updatedAt}</td>
        <td>${p.published?'<span class="status status-green">Public</span>':'<span class="status status-red">Draft</span>'}</td>
        <td class="text-end"><button class="btn btn-sm" data-edit="${p.id}">Sửa</button></td>`;
      tbody.appendChild(tr);
    });
    // Pagination
    const pager = $("#pager"); pager.innerHTML = '';
    const pages = Math.max(1, Math.ceil(total/state.perPage));
    for(let i=1;i<=pages;i++){
      const li = document.createElement('li');
      li.className = 'page-item' + (i===state.page?' active':'');
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', e => { e.preventDefault(); state.page=i; renderTable(); });
      pager.appendChild(li);
    }
    // Bind edit
    $$('[data-edit]').forEach(btn => btn.addEventListener('click', () => openEditor(+btn.dataset.edit)));
  }

  $('#search').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); state.page=1; renderTable(); });

  // ===== Editor =====
  function openEditor(id){
    const page = PAGES.find(p => p.id===id) || PAGES[0];
    state.current = page.id;
    showView('editor');
    $('[name="title"]').value = page.title;
    $('[name="slug"]').value = page.slug;
    $('[name="published"]').checked = !!page.published;
    $('#status-chip').textContent = page.published ? 'Published' : 'Draft';
    $('#updated-at').textContent = page.updatedAt;
    $('#editor').innerHTML = localStorage.getItem(`content:${page.id}`) || '<p>Nội dung giới thiệu...</p>';
    // Blocks
    const blocks = JSON.parse(localStorage.getItem(`blocks:${page.id}`) || '[]');
    $('#blocks').innerHTML = '';
    blocks.forEach(addBlock);
    // Tags
    state.tags = JSON.parse(localStorage.getItem(`tags:${page.id}`) || '[]');
    renderTags();
    // Hero
    const hero = JSON.parse(localStorage.getItem(`hero:${page.id}`) || 'null');
    if(hero){ renderHeroPreview(hero); }
  }

  $('#btn-link').addEventListener('click', () => {
    const url = prompt('Nhập URL:');
    if(url) document.execCommand('createLink', false, url);
  });
  $$('.wys-toolbar [data-cmd]').forEach(btn => btn.addEventListener('click', () =>
    document.execCommand(btn.dataset.cmd, false, null)));

  function addBlock(data={ title:'Tiêu đề khối', text:'<p>Mô tả...</p>' }){
    const wrap = document.createElement('div');
    wrap.className = 'card card-border mb-2';
    wrap.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center mb-2">
          <input class="form-control me-2 block-title" value="${escapeHtml(data.title)}">
          <button type="button" class="btn btn-outline-danger btn-sm" aria-label="Xóa khối">Xoá</button>
        </div>
        <div class="wys-area block-text" contenteditable="true">${data.text}</div>
      </div>`;
    wrap.querySelector('button').addEventListener('click', () => wrap.remove());
    $('#blocks').appendChild(wrap);
    return wrap;
  }
  $('#btn-add-block').addEventListener('click', () => addBlock());

  // Tags input
  $('#tags').addEventListener('keydown', (e) => {
    if(e.key==='Enter'){
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if(val && !state.tags.includes(val)){
        state.tags.push(val); e.currentTarget.value=''; renderTags();
      }
    }
  });
  function renderTags(){
    const wrap = $('#tags-wrap'); wrap.innerHTML='';
    state.tags.forEach((t,i)=>{
      const chip=document.createElement('span'); chip.className='chip me-1 mb-1';
      chip.innerHTML = `${escapeHtml(t)} <button type="button" class="btn btn-link p-0 ps-1" aria-label="Xoá">×</button>`;
      chip.querySelector('button').addEventListener('click', ()=>{ state.tags.splice(i,1); renderTags(); });
      wrap.appendChild(chip);
    });
  }

  // Hero upload (drag & drop + preview)
  const dz = $('#hero-dropzone');
  const dzInput = $('#hero-input');
  ;['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.add('bg-muted'); }));
  ;['dragleave','drop'].forEach(ev=>dz.addEventListener(ev, e=>{ dz.classList.remove('bg-muted'); }));
  dz.addEventListener('drop', (e)=>{ e.preventDefault(); handleFiles(e.dataTransfer.files); });
  dz.addEventListener('click', ()=> dzInput.click());
  dz.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); dzInput.click(); }});
  dzInput.addEventListener('change', (e)=> handleFiles(e.target.files));
  function handleFiles(files){
    const file = files && files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => renderHeroPreview({ name: file.name, size: file.size, dataUrl: reader.result });
    reader.readAsDataURL(file);
  }
  function renderHeroPreview(obj){
    $('#hero-preview').hidden = false;
    $('#hero-thumb').src = obj.dataUrl;
    $('#hero-name').textContent = obj.name || 'hero.jpg';
    $('#hero-meta').textContent = `${Math.round((obj.size||0)/1024)} KB`;
  }
  $('#hero-remove').addEventListener('click', ()=>{ $('#hero-preview').hidden=true; localStorage.removeItem(`hero:${state.current}`); });

  // ===== Collect helpers =====
  // --- 1) Thu thập khối nội dung: ưu tiên DOM, rỗng thì fallback localStorage
function collectBlocks(){
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const titles = $$('.block-title');
  if (titles.length) {
    return titles.map((el, idx) => ({
      title: el.value,
      text: $$('.block-text')[idx].innerHTML
    }));
  }
  try {
    const id = state.current;
    return JSON.parse(localStorage.getItem(`blocks:${id}`) || '[]');
  } catch { return []; }
}

// --- 2) Lấy ảnh hero: nếu đang preview sẵn thì lấy trực tiếp, không có thì fallback localStorage
function getHeroSrc(){
  const heroPrev = document.querySelector('#hero-preview');
  if (heroPrev && !heroPrev.hidden) {
    const img = document.querySelector('#hero-thumb');
    return img && img.src ? img.src : null;
  }
  try {
    const id = state.current;
    const hero = JSON.parse(localStorage.getItem(`hero:${id}`) || 'null');
    return hero ? hero.dataUrl : null;
  } catch { return null; }
}

// --- 3) Sửa nút Preview: render đầy đủ hero + intro + blocks
document.getElementById('btn-preview').addEventListener('click', () => {
  const escapeHtml = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const $ = (sel, ctx=document) => ctx.querySelector(sel);

  const title = $('[name="title"]').value;
  const introHtml = $('#editor').innerHTML;
  const blocks = collectBlocks();
  const heroSrc = getHeroSrc();

  console.log('PREVIEW v2', { blocks: blocks.length, hero: !!heroSrc });

  const blocksHtml = blocks.map(b => `
    <section class="card my-3">
      <div class="card-body">
        <h2 class="h3">${escapeHtml(b.title || '')}</h2>
        <div>${b.text || ''}</div>
      </div>
    </section>
  `).join('');

  const heroHtml = heroSrc ? `<img src="${heroSrc}" alt="Hero" class="img-fluid rounded mb-3">` : '';

  const win = window.open('', '_blank');
  if(!win){ alert('Trình duyệt đang chặn popup, hãy cho phép để xem Preview.'); return; }
  win.document.write(`
    <html>
      <head>
        <title>Preview - ${escapeHtml(title)}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css">
      </head>
      <body class="container my-4">
        <header class="mb-3"><h1 class="mb-2">${escapeHtml(title)}</h1></header>
        ${heroHtml}
        <article class="mb-3">${introHtml}</article>
        ${blocksHtml}
      </body>
    </html>
  `);
  win.document.close();
});


  // Init
  renderTable();
  openEditor(2);
})();
