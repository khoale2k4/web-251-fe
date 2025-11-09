// admin_comments.js
// Place this file next to admin_comments.html and ensure API_BASE points to your BE.
import { BASE_URL } from '../../js/config.js';
(function () {
    const API_BASE = BASE_URL;

    const commentTableBody = document.getElementById("commentTableBody");
    const tabPosts = document.getElementById("tab-posts");
    const tabProducts = document.getElementById("tab-products");
    const filterInput = document.getElementById("filterId");
    const btnFilter = document.getElementById("btnFilter");
    const btnRefresh = document.getElementById("btnRefresh");
    const confirmModalEl = document.getElementById("confirmModal");
    const btnConfirmDelete = document.getElementById("btnConfirmDelete");
    const confirmModal = new bootstrap.Modal(confirmModalEl);

    let currentType = "post"; // 'post' or 'product'
    let deleteId = null;

    // helper: show loading row
    function showLoading() {
        commentTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    }
    function showEmpty(msg = "Không có dữ liệu") {
        commentTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">${msg}</td></tr>`;
    }
    function showError(msg = "Lỗi khi tải dữ liệu") {
        commentTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">${msg}</td></tr>`;
    }

    // build URL based on type and optional filterId
    function buildUrl(filterId) {
        const effectiveFilter = (filterId || "").toString().trim();
        if (currentType === "post") {
            return effectiveFilter
                ? `${API_BASE}/comments?post_id=${encodeURIComponent(effectiveFilter)}`
                : `${API_BASE}/comments`;
        } else {
            return effectiveFilter
                ? `${API_BASE}/product-comments?product_id=${encodeURIComponent(effectiveFilter)}`
                : `${API_BASE}/product-comments`;
        }
    }

    // load comments
    async function loadComments(filterId = "") {
        showLoading();
        const url = buildUrl(filterId);
        try {
            const res = await fetch(url, { credentials: "same-origin" });
            // if backend returns non-JSON or non-200, handle gracefully
            if (!res.ok) {
                showError(`API lỗi: ${res.status}`);
                return;
            }
            const data = await res.json();

            // backend might return { success: true, data: [...] } or directly array
            const list = Array.isArray(data) ? data : data.data || [];
            if (!list || list.length === 0) {
                showEmpty();
                return;
            }

            // render rows
            commentTableBody.innerHTML = list
                .map((c) => {
                    const targetLabel =
                        currentType === "post" ? `Bài viết #${c.post_id ?? "-"}` : `Sản phẩm #${c.product_id ?? "-"}`;
                    const userName = c.user_name || (c.user_id ? `User#${c.user_id}` : "Ẩn danh");
                    const createdAt = c.created_at || "";

                    return `<tr>
                    <td>${c.id}</td>
                    <td>${escapeHtml(userName)}</td>
                    <td>${escapeHtml(targetLabel)}</td>
                    <td>${escapeHtml(c.content)}</td>
                    <td>${escapeHtml(createdAt)}</td>
                    <td class="text-end">
                        <button class="btn btn-outline-primary btn-sm btn-view me-1" data-id="${c.id}">Xem</button>
                        <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${c.id}">Xoá</button>
                    </td>
                </tr>`;
                })
                .join("");
        } catch (err) {
            console.error(err);
            showError();
        }
    }

    // escape simple HTML
    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }

    // delete
    async function doDelete(id) {
        try {
            // prefer DELETE /comments/{id}
            const url = `${API_BASE}/comments/${id}`;
            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) {
                // try alternative endpoint (if BE expects query param)
                console.warn("DELETE failed, status:", res.status);
                showError("Không thể xóa (server trả lỗi)");
                return;
            }
            // refresh
            await loadComments(filterInput.value.trim());
        } catch (err) {
            console.error(err);
            showError("Lỗi khi xóa");
        }
    }

    // event delegation for view and delete buttons
    commentTableBody.addEventListener("click", (ev) => {
        const viewBtn = ev.target.closest('.btn-view');
        if (viewBtn) {
            const id = viewBtn.dataset.id;
            // navigate to comment detail page
            window.location.href = `detail.html?id=${id}`;
            return;
        }

        const btn = ev.target.closest(".btn-delete");
        if (!btn) return;
        deleteId = btn.dataset.id;
        confirmModal.show();
    });

    // confirm delete
    btnConfirmDelete.addEventListener("click", async () => {
        if (!deleteId) return;
        confirmModal.hide();
        await doDelete(deleteId);
        deleteId = null;
    });

    // tab handlers
    tabPosts.addEventListener("click", (e) => {
        e.preventDefault();
        currentType = "post";
        tabPosts.classList.add("active");
        tabProducts.classList.remove("active");
        filterInput.placeholder = "Lọc theo post_id";
        loadComments();
    });
    tabProducts.addEventListener("click", (e) => {
        e.preventDefault();
        currentType = "product";
        tabProducts.classList.add("active");
        tabPosts.classList.remove("active");
        filterInput.placeholder = "Lọc theo product_id";
        loadComments();
    });

    // filter / refresh
    btnFilter.addEventListener("click", () => {
        loadComments(filterInput.value.trim());
    });
    btnRefresh.addEventListener("click", () => {
        filterInput.value = "";
        loadComments();
    });

    // init
    loadComments();
})();
