const API_BASE = window.__ENV__?.API_BASE || "http://btl-web.test/web-251-be";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    const titleEl = document.getElementById("postTitle");
    const contentEl = document.getElementById("postContent");
    const authorEl = document.getElementById("postAuthor");
    const commentList = document.getElementById("commentList");
    const form = document.getElementById("commentForm");
    const commentInput = document.getElementById("commentContent");

    async function loadPost() {
        const res = await fetch(`${API_BASE}/posts/${postId}`);
        const data = await res.json();
        if (data.success) {
            const post = data.data;
            titleEl.textContent = post.title;
            contentEl.innerHTML = post.content;
            authorEl.textContent = `Tác giả: ${post.author_name || "Ẩn danh"} - ${post.created_at}`;
        }
    }

    async function loadComments() {
        const res = await fetch(`${API_BASE}/comments?post_id=${postId}`);
        const data = await res.json();
        if (data.success) {
            commentList.innerHTML = data.data
                .map(
                    (c) => `
        <div class="comment-item">
          <img src="${c.user_avatar || "assets/images/placeholder.png"}" alt="">
          <div>
            <strong>${c.user_name}</strong>
            <p>${c.content}</p>
            <small>${c.created_at}</small>
          </div>
        </div>`
                )
                .join("");
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const content = commentInput.value.trim();
        if (!content) {
            alert("Vui lòng nhập nội dung bình luận");
            return;
        }

        const res = await fetch(`${API_BASE}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                post_id: postId,
                user_id: 1, // Tạm fix cho user test
                content: content,
            }),
        });

        const data = await res.json();
        if (data.success) {
            commentInput.value = "";
            await loadComments();
        } else {
            alert("Không thể gửi bình luận");
        }
    });

    loadPost();
    loadComments();
});
