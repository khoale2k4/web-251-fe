// Simple environment loader for front-end. Injects a global window.__ENV__ if not present.
// Usage: const API_BASE = window.__ENV__?.API_BASE || '/web-251-be';
(function () {
    if (window.__ENV__) return;
    // Load defaults from a meta tag if present
    const meta = document.querySelector('meta[name="app-env"]');
    if (meta) {
        try {
            window.__ENV__ = JSON.parse(meta.content);
        } catch (e) {
            window.__ENV__ = {};
        }
    } else {
        window.__ENV__ = { API_BASE: "/web-251-be" };
    }
})();
