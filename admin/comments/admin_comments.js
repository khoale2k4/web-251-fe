const API_BASE = "http://btl-web.test/web-251-be";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#commentTableBody");
    const filterInput = document.querySelector("#filterPostId");
    const btnFilter = document.querySelector("#btnFilter");
    const modalEl = document.querySelector("#confirmModal");
    const modal = new bootstrap.Modal(modalEl);
    const btnConfirmDelete = document.querySelector("#btnConfirmDelete");

    let deleteId = null;

    // Load comments
    async function loadComments(postId = "") {
        let url = postId ? `${API_BASE}/comments?post_id=${postId}` : `${API_BASE}/comments?post_id=1`; // tạm mặc định post_id=1

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6">Không thể tải dữ liệu</td></tr>`;
            return;
        }

        if (!data.data.length) {
            tableBody.innerHTML = `<tr><td colspan="6">Chưa có bình luận nào</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.data
            .map(
                (c) => `
        <tr>
          <td>${c.id}</td>
          <td>${c.user_name || "Ẩn danh"}</td>
          <td>${c.comment_type === "post" ? "Bài viết #" + c.post_id : "Sản phẩm #" + c.product_id}</td>
          <td>${c.content}</td>
          <td>${c.created_at}</td>
          <td>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${c.id}">Xoá</button>
          </td>
        </tr>`
            )
            .join("");
    }

    // Xoá bình luận
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete")) {
            deleteId = e.target.dataset.id;
            modal.show();
        }
    });

    btnConfirmDelete.addEventListener("click", async () => {
        if (!deleteId) return;
        await fetch(`${API_BASE}/comments/${deleteId}`, { method: "DELETE" });
        modal.hide();
        loadComments(filterInput.value);
    });

    // Lọc theo post_id
    btnFilter.addEventListener("click", () => {
        const id = filterInput.value.trim();
        loadComments(id);
    });

    // Load mặc định
    loadComments();
});
