import { Security } from '../../js/security.js';

// Enforce admin access immediately
(async function () {
    await Security.requireAdmin();
})();
