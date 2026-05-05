/*
 * Mock authentication for the Bootstrap mirror.
 * Mirrors react-version/9jacart-admin-react-v2:
 *   - src/services/api.ts:49-86  (login + token minting + isAuthenticated)
 *   - src/stores/authStore.ts    (token storage, expiry checks, init)
 *   - src/hooks/useAuthCheck.ts  (periodic expiry check)
 *   - src/components/ProtectedRoute.tsx (60s expiry interval)
 *
 * Public surface (mirrors apiService for the auth subset):
 *   window.auth.login(email, password)   -> Promise<LoginResponse>
 *   window.auth.logout()
 *   window.auth.isAuthenticated()        -> boolean (also runs expiry check)
 *   window.auth.getToken()               -> string | null
 *   window.auth.getUser()                -> { id, email, name } | null
 *   window.auth.getTokenExpiryTime()     -> number (ms epoch) | null
 *   window.auth.initialize()             -> idempotent; called automatically
 *   window.auth.onChange(handler)        -> unsubscribe()
 */
(function () {
  'use strict';

  if (!window.APP_CONFIG) {
    throw new Error('auth.js requires config.js to be loaded first');
  }

  var AUTH_CFG = window.APP_CONFIG.AUTH;
  var TOKEN_KEY = AUTH_CFG.TOKEN_STORAGE_KEY;        // "auth_token"
  var USER_KEY  = 'auth_user';                       // bootstrap-side companion to authStore.user
  var TTL_HOURS = AUTH_CFG.TOKEN_TTL_HOURS;
  var listeners = [];

  // ---- base64url helpers --------------------------------------------------
  function base64UrlEncode(obj) {
    var json = JSON.stringify(obj);
    // btoa handles ASCII; for non-ASCII emails fall back to encodeURIComponent.
    var b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  function base64UrlDecode(str) {
    var pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    var b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) {
      return null;
    }
  }

  function decodeJwt(token) {
    if (!token || typeof token !== 'string') return null;
    var parts = token.split('.');
    if (parts.length !== 3) return null;
    var payloadJson = base64UrlDecode(parts[1]);
    if (!payloadJson) return null;
    try {
      return JSON.parse(payloadJson);
    } catch (e) {
      return null;
    }
  }

  function isTokenExpired(token) {
    var payload = decodeJwt(token);
    if (!payload || typeof payload.exp !== 'number') {
      return true; // can't decode -> treat as expired (matches authStore.ts:36-38)
    }
    return payload.exp < Date.now() / 1000;
  }

  // ---- storage helpers ----------------------------------------------------
  function readUser() {
    var raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  function emit(event) {
    listeners.forEach(function (fn) {
      try { fn(event); } catch (e) { console.error('auth listener error', e); }
    });
  }

  // ---- public API ---------------------------------------------------------
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    return readUser();
  }

  function getTokenExpiryTime() {
    var token = getToken();
    if (!token) return null;
    var payload = decodeJwt(token);
    if (!payload || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  }

  function isAuthenticated() {
    var token = getToken();
    if (!token) return false;
    if (isTokenExpired(token)) {
      // Mirror authStore.checkTokenExpiry: expired -> log out.
      logout({ silent: false, reason: 'expired' });
      return false;
    }
    return true;
  }

  function login(email, password) {
    // Mirror api.ts:49-76. Accept any credentials; mint a structurally-valid JWT.
    return new Promise(function (resolve) {
      // Simulated network delay (api.ts uses 500ms here, longer than typical).
      setTimeout(function () {
        var nowSec = Math.floor(Date.now() / 1000);
        var header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
        var payload = base64UrlEncode({
          sub: 'user-1',
          email: email,
          iat: nowSec,
          exp: nowSec + TTL_HOURS * 3600
        });
        var token = header + '.' + payload + '.mock-signature';

        var user = {
          id: 'user-1',
          email: email,
          name: typeof email === 'string' ? email.split('@')[0] : 'user'
        };

        localStorage.setItem(TOKEN_KEY, token);
        writeUser(user);

        emit({ type: 'login', user: user, token: token });

        resolve({
          status: 200,
          error: false,
          message: 'Login successful',
          token: token
        });
      }, 500);
    });
  }

  function logout(options) {
    options = options || {};
    var hadToken = !!getToken();
    localStorage.removeItem(TOKEN_KEY);
    writeUser(null);
    if (hadToken) {
      emit({ type: 'logout', reason: options.reason || 'manual' });
    }
  }

  function onChange(handler) {
    if (typeof handler !== 'function') return function () {};
    listeners.push(handler);
    return function unsubscribe() {
      var idx = listeners.indexOf(handler);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  /**
   * Idempotent initialization. Mirrors authStore.initializeAuth():
   * if a stored token is expired, clear it.
   */
  function initialize() {
    var token = getToken();
    if (token && isTokenExpired(token)) {
      logout({ reason: 'expired' });
    }
  }

  // Run initialization synchronously so isAuthenticated() is correct on first call.
  initialize();

  // ---- Logout button auto-wiring -----------------------------------------
  // Any element with id="logoutBtn" / id="logoutBtnTop" / [data-action="logout"]
  // becomes a logout trigger that redirects to the login page.
  function wireLogoutButtons() {
    var selectors = [
      '#logoutBtn',
      '#logoutBtnTop',
      '[data-action="logout"]'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    nodes.forEach(function (el) {
      if (el.dataset.authBound === '1') return;
      el.dataset.authBound = '1';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        logout({ reason: 'manual' });
        window.location.href = AUTH_CFG.LOGIN_PAGE;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireLogoutButtons);
  } else {
    wireLogoutButtons();
  }

  // ---- Expose -------------------------------------------------------------
  window.auth = {
    login: login,
    logout: logout,
    isAuthenticated: isAuthenticated,
    getToken: getToken,
    getUser: getUser,
    getTokenExpiryTime: getTokenExpiryTime,
    initialize: initialize,
    onChange: onChange,
    // Internal helpers exposed for guard.js / api.js
    _decodeJwt: decodeJwt,
    _isTokenExpired: isTokenExpired,
    _wireLogoutButtons: wireLogoutButtons
  };
})();
