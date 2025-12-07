import { Security } from '../../js/security.js';

(async function () {
    await Security.requireAdmin();
})();
