/*
 * Shared layout (sidebar + top navbar) for all authenticated pages.
 *
 * Source of truth: react-version/9jacart-admin-react-v2/src/components/Layout/Sidebar.tsx
 *                  - navigation list, badge logic, footer user block, logout.
 *
 * On DOMContentLoaded this module replaces the contents of:
 *   - <nav id="sidebar">...</nav>      with the React-aligned navigation
 *   - <header class="top-navbar">...</header> with the trimmed top bar
 *
 * The active item is selected from <body data-route="...">.
 *
 * Badge counts are rendered from window.notifications.counts when present.
 * Until notifications.js (Phase 2) ships, badges quietly default to 0.
 */
(function () {
  'use strict';

  if (!window.APP_CONFIG) {
    throw new Error('layout.js requires config.js to be loaded first');
  }

  var BRANDING = window.APP_CONFIG.BRANDING;
  var FEATURES = window.APP_CONFIG.FEATURES;

  // ---- Navigation (mirror Sidebar.tsx:29-72) -----------------------------
  // `key` enables badge rendering from notification counts (vendors, buyers,
  // pendingSignups). `route` matches body[data-route] for active highlighting.
  var NAVIGATION = [
    { route: 'overview', href: 'dashboard.html', icon: 'bi-speedometer2', label: 'Overview' },
    { route: 'vendor-signups', href: 'vendor-signups.html', icon: 'bi-person-plus', label: 'Vendors SignUp', key: 'pendingSignups' },
    { route: 'buyer-signups', href: 'buyer-signups.html', icon: 'bi-person-check', label: 'Buyer Sign ups' },
    { route: 'business-categories', href: 'business-categories.html', icon: 'bi-tag', label: 'Business Categories' },
    { route: 'product-categories', href: 'product-categories.html', icon: 'bi-box-seam', label: 'Product Categories' },
    { route: 'orders', href: 'orders.html', icon: 'bi-box', label: 'Orders' },
    { route: 'buyer-messages', href: 'buyer-messages.html', icon: 'bi-envelope', label: 'Buyer Messages', key: 'buyers' },
    { route: 'vendor-messages', href: 'vendor-messages.html', icon: 'bi-shop', label: 'Vendor Messages', key: 'vendors' },
    { route: 'commission-change', href: 'commission-change.html', icon: 'bi-percent', label: 'Commission Change' },
    { route: 'waitlist', href: 'waitlist.html', icon: 'bi-people', label: 'Waitlist' },
    { route: 'contacts', href: 'contacts.html', icon: 'bi-chat-left', label: 'Contacts' }
  ];

  // ---- Helpers ------------------------------------------------------------
  function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCounts() {
    if (window.notifications && window.notifications.counts) {
      return window.notifications.counts;
    }
    return { vendors: 0, buyers: 0, pendingSignups: 0 };
  }

  // Mirror Sidebar.tsx:87-98 — pendingSignups uses a localStorage diff so the
  // badge only shows NEW pending signups since the user last visited that list.
  function unreadCountFor(key, counts) {
    if (!key) return 0;
    if (key === 'vendors') return counts.vendors || 0;
    if (key === 'buyers') return counts.buyers || 0;
    if (key === 'pendingSignups') {
      var lastViewed = parseInt(
        localStorage.getItem('lastViewedPendingSignupsCount') || '0',
        10
      ) || 0;
      var diff = (counts.pendingSignups || 0) - lastViewed;
      return diff > 0 ? diff : 0;
    }
    return 0;
  }

  function badgeMarkup(count) {
    if (!FEATURES.SHOW_BADGE_COUNTS || !count) return '';
    var label = count > 99 ? '99+' : String(count);
    return '<span class="sidebar-badge">' + escapeHtml(label) + '</span>';
  }

  // ---- Sidebar ------------------------------------------------------------
  function renderSidebar(activeRoute) {
    var counts = getCounts();
    var user = window.auth && window.auth.getUser ? window.auth.getUser() : null;

    var items = NAVIGATION.map(function (item) {
      var isActive = item.route === activeRoute;
      var badge = badgeMarkup(unreadCountFor(item.key, counts));
      return (
        '<li class="nav-item">' +
        '<a href="' + escapeHtml(item.href) + '" ' +
        'class="nav-link' + (isActive ? ' active' : '') + '" ' +
        'data-route="' + escapeHtml(item.route) + '">' +
        '<i class="bi ' + escapeHtml(item.icon) + '"></i>' +
        '<span>' + escapeHtml(item.label) + '</span>' +
        badge +
        '</a>' +
        '</li>'
      );
    }).join('');

    var userBlock = '';
    if (FEATURES.SHOW_USER_INFO_IN_SIDEBAR && user) {
      userBlock =
        '<div class="sidebar-user">' +
        '<div class="sidebar-user-name">' + escapeHtml(user.name) + '</div>' +
        '<div class="sidebar-user-email">' + escapeHtml(user.email) + '</div>' +
        '</div>';
    }

    return (
      '<div class="sidebar-header">' +
      '<span class="logo-text">' + escapeHtml(BRANDING.SIDEBAR_TITLE) + '</span>' +
      '<button id="sidebarCollapse" class="btn btn-link d-lg-none" aria-label="Close sidebar">' +
      '<i class="bi bi-x-lg"></i>' +
      '</button>' +
      '</div>' +
      '<ul class="nav flex-column sidebar-nav">' + items + '</ul>' +
      '<div class="sidebar-footer">' +
      userBlock +
      '<a href="#" class="nav-link" id="logoutBtn" data-action="logout">' +
      '<i class="bi bi-box-arrow-left"></i><span>Logout</span>' +
      '</a>' +
      '</div>'
    );
  }

  // ---- Top navbar ---------------------------------------------------------
  // Trimmed version: page title (left), sidebar toggle, theme switcher,
  // notification bell, user dropdown with logout. No search, no Profile/Settings.
  function renderTopnav() {
    var pageTitle = document.title.split(' - ')[0] || '';
    var user = window.auth && window.auth.getUser ? window.auth.getUser() : null;
    var userName = user && user.name ? user.name : 'Account';

    var themes = (window.APP_CONFIG.AVAILABLE_THEMES || []).map(function (t) {
      return (
        '<li>' +
        '<a class="dropdown-item theme-option" data-theme="' + escapeHtml(t.id) + '" href="#">' +
        '<span class="theme-swatch" style="background:' + escapeHtml(t.swatch) + '"></span>' +
        escapeHtml(t.name) +
        '<i class="bi bi-check2 d-none"></i>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    var bell = FEATURES.SHOW_NOTIFICATIONS
      ? (
        '<div class="dropdown notification-dropdown">' +
        '<button class="btn btn-link notification-btn" data-bs-toggle="dropdown" aria-label="Notifications">' +
        '<i class="bi bi-bell"></i>' +
        '<span class="notification-badge" id="notificationBadge" hidden>0</span>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-menu-end notification-menu" id="notificationMenu">' +
        '<li><h6 class="dropdown-header">Notifications</h6></li>' +
        '<li><div class="dropdown-item-text small text-muted">No notifications yet.</div></li>' +
        '</ul>' +
        '</div>'
      ) : '';

    return (
      '<div class="navbar-left">' +
      '<button id="sidebarToggle" class="btn btn-link d-lg-none" aria-label="Open sidebar">' +
      '<i class="bi bi-list"></i>' +
      '</button>' +
      '<h4 class="mb-0 page-title">' + escapeHtml(pageTitle) + '</h4>' +
      '</div>' +
      '<div class="navbar-right">' +
      '<div class="dropdown theme-switcher">' +
      '<button id="themeToggle" class="btn btn-link theme-toggle" data-bs-toggle="dropdown" aria-label="Theme">' +
      '<i class="bi bi-palette"></i>' +
      '</button>' +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><h6 class="dropdown-header">Color Theme</h6></li>' +
      themes +
      '</ul>' +
      '</div>' +
      bell +
      '<div class="user-dropdown dropdown">' +
      '<button class="btn user-btn" data-bs-toggle="dropdown" aria-label="Account menu">' +
      '<span class="user-name d-none d-md-inline">' + escapeHtml(userName) + '</span>' +
      '<i class="bi bi-chevron-down"></i>' +
      '</button>' +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      (user ? '<li><span class="dropdown-item-text small text-muted">' + escapeHtml(user.email) + '</span></li><li><hr class="dropdown-divider"></li>' : '') +
      '<li><a class="dropdown-item" href="#" id="logoutBtnTop" data-action="logout"><i class="bi bi-box-arrow-left"></i> Logout</a></li>' +
      '</ul>' +
      '</div>' +
      '</div>'
    );
  }

  // ---- Mount + behavior ---------------------------------------------------
  function applyActiveRoute(activeRoute) {
    // Re-apply active class in case the DOM was already populated.
    var nodes = document.querySelectorAll('#sidebar .sidebar-nav .nav-link');
    nodes.forEach(function (a) {
      var matches = a.getAttribute('data-route') === activeRoute;
      a.classList.toggle('active', matches);
    });
  }

  function refreshBadges() {
    var counts = getCounts();
    var nodes = document.querySelectorAll('#sidebar .sidebar-nav .nav-link');
    nodes.forEach(function (a) {
      var route = a.getAttribute('data-route');
      var navItem = NAVIGATION.find(function (i) { return i.route === route; });
      if (!navItem) return;
      var existing = a.querySelector('.sidebar-badge');
      var n = unreadCountFor(navItem.key, counts);
      if (n > 0 && FEATURES.SHOW_BADGE_COUNTS) {
        var label = n > 99 ? '99+' : String(n);
        if (existing) {
          existing.textContent = label;
        } else {
          a.insertAdjacentHTML('beforeend', badgeMarkup(n));
        }
      } else if (existing) {
        existing.remove();
      }
    });
  }

  function attachSidebarToggle() {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('sidebarToggle');
    var close = document.getElementById('sidebarCollapse');
    if (toggle && sidebar) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('show');
      });
    }
    if (close && sidebar) {
      close.addEventListener('click', function () {
        sidebar.classList.remove('show');
      });
    }
    // Close mobile sidebar on outside click.
    document.addEventListener('click', function (e) {
      if (!sidebar || window.innerWidth >= 992) return;
      if (!sidebar.classList.contains('show')) return;
      if (sidebar.contains(e.target)) return;
      if (toggle && toggle.contains(e.target)) return;
      sidebar.classList.remove('show');
    });
  }

  function mount() {
    var activeRoute = document.body.getAttribute('data-route') || '';

    // Ensure a persistent sidebar exists across all pages. Some pages (like
    // dashboard.html) include <nav id="sidebar"> but others don't — create
    // the element when missing so the navigation is always present.
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) {
      sidebar = document.createElement('nav');
      sidebar.id = 'sidebar';
      sidebar.className = 'sidebar';
      // Insert before main content so layout matches pages that already have it
      var main = document.getElementById('main-content');
      if (main && main.parentNode) main.parentNode.insertBefore(sidebar, main);
      else document.body.insertBefore(sidebar, document.body.firstChild);
    }
    sidebar.innerHTML = renderSidebar(activeRoute);

    // Ensure top navbar exists
    var topnav = document.querySelector('header.top-navbar');
    if (!topnav) {
      topnav = document.createElement('header');
      topnav.className = 'top-navbar';
      var main = document.getElementById('main-content');
      if (main) main.insertBefore(topnav, main.firstChild);
      else document.body.appendChild(topnav);
    }
    topnav.innerHTML = renderTopnav();

    attachSidebarToggle();

    // Re-wire logout buttons in case auth.js mounted before our DOM was ready.
    if (window.auth && window.auth._wireLogoutButtons) {
      window.auth._wireLogoutButtons();
    }

    // Listen for notification updates (Phase 2 will dispatch this event).
    window.addEventListener('notifications:update', refreshBadges);

    // If we're on the vendor-signups page, mark the pending count as viewed
    // so the badge clears next time (mirror Sidebar.tsx:87-98 semantics).
    if (activeRoute === 'vendor-signups') {
      var counts = getCounts();
      if (typeof counts.pendingSignups === 'number') {
        localStorage.setItem(
          'lastViewedPendingSignupsCount',
          String(counts.pendingSignups)
        );
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  window.layout = {
    NAVIGATION: NAVIGATION,
    refreshBadges: refreshBadges,
    applyActiveRoute: applyActiveRoute,
    mount: mount
  };
})();
