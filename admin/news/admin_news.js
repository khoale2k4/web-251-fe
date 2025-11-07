import { BASE_URL } from '../../js/config.js';
const API_BASE = BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#newsTableBody");
    const btnAdd = document.querySelector("#btnAdd");
    const btnSave = document.querySelector("#btnSave");
    const modalEl = document.querySelector("#postModal");
    const modal = new bootstrap.Modal(modalEl);
    const modalTitle = document.querySelector("#modalTitle");
    const searchInput = document.querySelector("#searchPost");

    let editId = null;

    async function loadPosts(keyword = "") {
        const res = await fetch(`${API_BASE}/posts?search=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        if (!data.success) return;

        tableBody.innerHTML = data.data
            .map(
                (p) => `
        <tr>
          <td>${p.id}</td>
          <td>${p.title}</td>
          <td>${p.author_id || "-"}</td>
          <td>${p.created_at || ""}</td>
          <td class="table-actions">
            <button class="btn btn-sm btn-secondary btn-detail" data-id="${p.id}">Xem</button>
            <button class="btn btn-sm btn-warning btn-edit" data-id="${p.id}">Sửa</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}">Xóa</button>
          </td>
        </tr>`
            )
            .join("");
    }

    btnAdd.addEventListener("click", () => {
        editId = null;
        modalTitle.textContent = "Thêm bài viết";
        document.querySelector("#title").value = "";
        document.querySelector("#content").value = "";
        modal.show();
    });

    btnSave.addEventListener("click", async () => {
        const title = document.querySelector("#title").value.trim();
        const content = document.querySelector("#content").value.trim();
        const author_id = document.querySelector("#author_id").value || 1;

        if (!title || !content) return alert("Vui lòng nhập đủ tiêu đề và nội dung");

        const method = editId ? "PUT" : "POST";
        const url = editId ? `${API_BASE}/posts/${editId}` : `${API_BASE}/posts`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, author_id }),
        });

        const data = await res.json();
        if (data.success) {
            modal.hide();
            loadPosts();
        } else {
            alert("Lỗi: " + data.message);
        }
    });

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btn-detail")) {
            const id = e.target.dataset.id;
            // navigate to detail page
            window.location.href = `detail.html?id=${id}`;
            return;
        }
        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            if (confirm("Xác nhận xóa bài viết này?")) {
                await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
                loadPosts();
            }
        }

        if (e.target.classList.contains("btn-edit")) {
            editId = e.target.dataset.id;
            const res = await fetch(`${API_BASE}/posts/${editId}`);
            const data = await res.json();
            if (data.success) {
                document.querySelector("#title").value = data.data.title;
                document.querySelector("#content").value = data.data.content;
                document.querySelector("#author_id").value = data.data.author_id || 1;
                modalTitle.textContent = "Chỉnh sửa bài viết";
                modal.show();
            }
        }
    });

    searchInput.addEventListener("input", (e) => loadPosts(e.target.value));
    loadPosts();
});


