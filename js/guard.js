/*
 * Route guard for protected pages. Mirror of:
 *   - react-version/9jacart-admin-react-v2/src/components/ProtectedRoute.tsx
 *   - react-version/9jacart-admin-react-v2/src/hooks/useAuthCheck.ts
 *
 * Behaviour:
 *   1. On script execution, if no valid token, redirect immediately to login.
 *   2. After DOM ready, set up a 60s interval that re-checks token expiry
 *      (matching ProtectedRoute's 60_000 ms interval) and forces logout +
 *      redirect when the token expires.
 *
 * Include this script in the <head> of every authenticated HTML page,
 * AFTER config.js and auth.js. Do NOT include it on login.html or index.html.
 */
(function () {
  'use strict';

  if (!window.APP_CONFIG || !window.auth) {
    throw new Error('guard.js requires config.js and auth.js to be loaded first');
  }

  var AUTH_CFG = window.APP_CONFIG.AUTH;
  var INTERVAL_MS = AUTH_CFG.EXPIRY_CHECK_INTERVAL_MS;
  var LOGIN_PAGE = AUTH_CFG.LOGIN_PAGE;

  function redirectToLogin() {
    // Use replace() so the protected page does not stay in history.
    window.location.replace(LOGIN_PAGE);
  }

  // ---- 1) Synchronous gate -----------------------------------------------
  if (!window.auth.isAuthenticated()) {
    redirectToLogin();
    // Stop further script execution on this page.
    // throw stops inline + module scripts that may run after this block.
    throw new Error('Unauthenticated; redirecting to ' + LOGIN_PAGE);
  }

  // ---- 2) Periodic expiry check ------------------------------------------
  var intervalHandle = null;

  function startExpiryWatch() {
    if (intervalHandle !== null) return;
    intervalHandle = setInterval(function () {
      if (!window.auth.isAuthenticated()) {
        // isAuthenticated() already calls logout() when expired.
        clearInterval(intervalHandle);
        intervalHandle = null;
        redirectToLogin();
      }
    }, INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExpiryWatch);
  } else {
    startExpiryWatch();
  }

  // Also react immediately if some other tab logs out (storage event) or
  // another module emits an auth change.
  window.addEventListener('storage', function (e) {
    if (e.key === window.APP_CONFIG.AUTH.TOKEN_STORAGE_KEY && !e.newValue) {
      redirectToLogin();
    }
  });

  window.auth.onChange(function (event) {
    if (event && event.type === 'logout') {
      redirectToLogin();
    }
  });

  // Expose for tests/debugging.
  window.guard = {
    redirectToLogin: redirectToLogin,
    startExpiryWatch: startExpiryWatch
  };
})();
