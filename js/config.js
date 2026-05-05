/*
 * App-wide configuration for the Bootstrap mirror of the React AdminHub app.
 * Source of truth: react-version/9jacart-admin-react-v2/src/config/theme.ts
 *
 * Loaded as the FIRST script on every page so other modules (theme, auth,
 * layout, api) can read window.APP_CONFIG synchronously.
 */
(function () {
  'use strict';

  // ---- Theme ---------------------------------------------------------------
  // Available palettes: 'forest' | 'ocean' | 'sunset' | 'midnight' | 'minimal'
  // Mirror the React THEME_NAME constant. Light mode only (no dark mode in
  // this project, per parity decision).
  var THEME_NAME = 'forest';

  // ---- Branding ------------------------------------------------------------
  var BRANDING = {
    APP_NAME: 'AdminHub',
    COMPANY_NAME: 'AdminHub',
    LOGO_TEXT: 'AdminHub',
    // Path is resolved relative to the directory of every authenticated HTML
    // page (siblings of this file). All HTML files live in the project root,
    // so the favicon at ../public/favicon.svg works for every page.
    FAVICON_PATH: '../public/favicon.svg',
    SIDEBAR_TITLE: 'AdminHub Admin'
  };

  // ---- Feature flags -------------------------------------------------------
  // Mirror src/config/theme.ts FEATURES, with ENABLE_DARK_MODE forced off
  // because the parity plan keeps only color-palette themes on both sides.
  var FEATURES = {
    SHOW_NOTIFICATIONS: true,
    SHOW_USER_INFO_IN_SIDEBAR: true,
    ENABLE_DARK_MODE: false,
    SHOW_BADGE_COUNTS: true
  };

  // ---- Available themes (names + swatch colors) ---------------------------
  // Used by the theme switcher UI in the top navbar. Hex values are the
  // approximate primary colors from the React theme palettes.
  var AVAILABLE_THEMES = [
    { id: 'forest',   name: 'Forest',   swatch: '#2e7d32' },
    { id: 'ocean',    name: 'Ocean',    swatch: '#1565c0' },
    { id: 'sunset',   name: 'Sunset',   swatch: '#e65100' },
    { id: 'midnight', name: 'Midnight', swatch: '#5e35b1' },
    { id: 'minimal',  name: 'Minimal',  swatch: '#212121' }
  ];

  // ---- Auth / API ----------------------------------------------------------
  var AUTH = {
    TOKEN_STORAGE_KEY: 'auth_token',
    LOGIN_PAGE: 'login.html',
    POST_LOGIN_PAGE: 'dashboard.html',
    TOKEN_TTL_HOURS: 24,
    EXPIRY_CHECK_INTERVAL_MS: 60 * 1000
  };

  var API = {
    SIMULATED_DELAY_MIN_MS: 200,
    SIMULATED_DELAY_MAX_MS: 500,
    DEFAULT_PAGE_SIZE: 20
  };

  // Expose -------------------------------------------------------------------
  window.APP_CONFIG = Object.freeze({
    THEME_NAME: THEME_NAME,
    BRANDING: Object.freeze(BRANDING),
    FEATURES: Object.freeze(FEATURES),
    AVAILABLE_THEMES: Object.freeze(AVAILABLE_THEMES),
    AUTH: Object.freeze(AUTH),
    API: Object.freeze(API)
  });
})();
