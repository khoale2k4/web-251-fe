const API_BASE = window.__ENV__?.API_BASE || "http://btl-web.test/web-251-be";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#newsTableBody");
    const popup = document.querySelector("#newsFormPopup");
    const btnAdd = document.querySelector("#btnAdd");
    const btnSave = document.querySelector("#btnSave");
    const btnCancel = document.querySelector("#btnCancel");
    const formTitle = document.querySelector("#formTitle");
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
          <td>
            <button class="btn-edit" data-id="${p.id}">Sửa</button>
            <button class="btn-delete" data-id="${p.id}">Xóa</button>
          </td>
        </tr>`
            )
            .join("");
    }

    // Add new post
    btnAdd.addEventListener("click", () => {
        editId = null;
        formTitle.textContent = "Thêm bài viết";
        popup.classList.remove("hidden");
        document.querySelector("#title").value = "";
        document.querySelector("#content").value = "";
    });

    // Save (create/update)
    btnSave.addEventListener("click", async () => {
        const title = document.querySelector("#title").value.trim();
        const content = document.querySelector("#content").value.trim();
        const author_id = document.querySelector("#author_id").value || 1;

        if (!title || !content) {
            alert("Vui lòng nhập đủ tiêu đề và nội dung");
            return;
        }

        const method = editId ? "PUT" : "POST";
        const url = editId ? `${API_BASE}/posts/${editId}` : `${API_BASE}/posts`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, author_id }),
        });

        const data = await res.json();
        if (data.success) {
            alert(editId ? "Đã cập nhật bài viết" : "Đã thêm bài viết mới");
            popup.classList.add("hidden");
            loadPosts();
        } else {
            alert("Lỗi: " + data.message);
        }
    });

    // Cancel popup
    btnCancel.addEventListener("click", () => popup.classList.add("hidden"));

    // Delete post
    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            if (confirm("Xác nhận xóa bài viết này?")) {
                const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) loadPosts();
            }
        }
    });

    // Edit post
    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btn-edit")) {
            editId = e.target.dataset.id;
            const res = await fetch(`${API_BASE}/posts/${editId}`);
            const data = await res.json();
            if (data.success) {
                const post = data.data;
                document.querySelector("#title").value = post.title;
                document.querySelector("#content").value = post.content;
                formTitle.textContent = "Chỉnh sửa bài viết";
                popup.classList.remove("hidden");
            }
        }
    });

    // Search post
    searchInput.addEventListener("input", (e) => {
        loadPosts(e.target.value);
    });

    loadPosts();
});
