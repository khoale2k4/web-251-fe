<<<<<<< HEAD
import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'news');
  mountFooter('.mount-footer');
});
=======
const API_BASE = window.__ENV__?.API_BASE || "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.querySelector(".news-list");
    const searchInput = document.querySelector("#searchInput");

    async function loadPosts(keyword = "") {
        try {
            listContainer.innerHTML = `<p>Đang tải...</p>`;
            const res = await fetch(`${API_BASE}/posts?search=${encodeURIComponent(keyword)}`);
            const data = await res.json();

            if (!data.success || !data.data.length) {
                listContainer.innerHTML = `<p>Không tìm thấy bài viết nào.</p>`;
                return;
            }

            listContainer.innerHTML = data.data
                .map(
                    (post) => `
        <div class="news-item">
          <img src="${post.image || "assets/images/placeholder.png"}" alt="">
          <h3>${post.title}</h3>
          <p>${post.content.substring(0, 100)}...</p>
          <a href="detail.html?id=${post.id}" class="btn-view">Xem chi tiết</a>
        </div>`
                )
                .join("");
        } catch (err) {
            listContainer.innerHTML = `<p>Lỗi tải dữ liệu: ${err.message}</p>`;
        }
    }

    // Event search
    searchInput?.addEventListener("input", (e) => loadPosts(e.target.value));

    // Load mặc định
    loadPosts();
});


>>>>>>> fd06cc4569a6982f7b46b54b50aed7ebf617085a
