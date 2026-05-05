/*
 * window.notifications — Bootstrap-side mirror of the React hook
 *   react-version/9jacart-admin-react-v2/src/hooks/useNotifications.ts
 *
 * Maintains live unread counts and notification list, refreshes every 60s,
 * and dispatches a `notifications:update` window event so layout.js (or any
 * consumer) can re-render badges without polling.
 *
 * Public surface:
 *   window.notifications.counts        // { vendors, buyers, admin, pendingSignups }
 *   window.notifications.totalUnread() // sum of all counts
 *   window.notifications.categoryCounts() // [{label, count, route, type}, ...]
 *   window.notifications.list          // last fetched NotificationItem[]
 *   window.notifications.refresh()     // force re-fetch (Promise<void>)
 *   window.notifications.markAsRead(type) // 'vendor' | 'buyer' | 'admin' | 'pendingSignups'
 *   window.notifications.onUpdate(handler) -> unsubscribe
 *
 * Mirror semantics:
 *   - vendors / buyers come from ticket unread counts grouped by userType.
 *   - admin comes from response.adminUnreadMessages (if present) else the
 *     count of notifications with isRead === '0'.
 *   - pendingSignups: vendor signups with isPending truthy OR isApproved !== '1'.
 */
(function () {
  'use strict';

  if (!window.api) {
    throw new Error('notifications.js requires api.js to be loaded first');
  }

  var REFRESH_MS = 60 * 1000; // mirror useNotifications.ts:172

  var state = {
    counts: { vendors: 0, buyers: 0, admin: 0, pendingSignups: 0 },
    list: [],
    loading: true
  };

  var listeners = [];
  var intervalHandle = null;
  var inflight = null;

  // ---- Helpers ------------------------------------------------------------
  function isPendingSignup(signup) {
    if (signup.isPending !== undefined && signup.isPending !== null) {
      var v = signup.isPending;
      return v === true || v === '1' || v === 'true' ||
        String(v).toLowerCase() === 'true';
    }
    return signup.isApproved !== '1';
  }

  function emit() {
    var detail = {
      counts: Object.assign({}, state.counts),
      list: state.list.slice(),
      totalUnread: totalUnread()
    };
    listeners.forEach(function (fn) {
      try { fn(detail); } catch (e) { console.error('notifications listener error', e); }
    });
    window.dispatchEvent(new CustomEvent('notifications:update', { detail: detail }));
  }

  // ---- Fetchers (mirror useNotifications.ts) -----------------------------
  async function fetchPendingSignups() {
    try {
      var resp = await window.api.getAllVendorSignups();
      if (resp && Array.isArray(resp.data)) {
        return resp.data.filter(isPendingSignup).length;
      }
      return 0;
    } catch (e) {
      console.error('Failed to fetch pending vendor signups:', e);
      return 0;
    }
  }

  async function fetchTicketUnreadCounts() {
    try {
      var page = 1;
      var perPage = 50;
      var totalPages = 1;
      var vendorUnread = 0;
      var buyerUnread = 0;
      while (page <= totalPages) {
        var resp = await window.api.getTickets(page, perPage);
        if (!resp || !Array.isArray(resp.tickets)) break;
        totalPages = (resp.pagination && resp.pagination.totalPages) || 1;
        resp.tickets.forEach(function (ticket) {
          var unread = ticket.unreadCount || 0;
          if (!unread) return;
          if (ticket.userType === 'VENDOR') vendorUnread += unread;
          else if (ticket.userType === 'BUYER') buyerUnread += unread;
        });
        page += 1;
      }
      return { vendorUnread: vendorUnread, buyerUnread: buyerUnread };
    } catch (e) {
      console.error('Failed to fetch ticket unread counts:', e);
      return { vendorUnread: 0, buyerUnread: 0 };
    }
  }

  async function fetchAll() {
    var notifResponse = null;
    try {
      notifResponse = await window.api.getNotifications();
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }

    var pendingCount = await fetchPendingSignups();
    var ticketCounts = await fetchTicketUnreadCounts();

    var adminCount = 0;
    var noteList = [];
    if (notifResponse && notifResponse.notifications) {
      noteList = notifResponse.notifications;
      if (typeof notifResponse.adminUnreadMessages === 'number') {
        adminCount = notifResponse.adminUnreadMessages;
      } else if (noteList.length > 0) {
        adminCount = noteList.filter(function (n) { return n.isRead === '0'; }).length;
      }
    }

    state.counts = {
      vendors: ticketCounts.vendorUnread,
      buyers: ticketCounts.buyerUnread,
      admin: adminCount,
      pendingSignups: pendingCount
    };
    state.list = noteList;
    state.loading = false;
    emit();
  }

  function refresh() {
    if (inflight) return inflight;
    inflight = fetchAll().finally(function () { inflight = null; });
    return inflight;
  }

  // ---- Public API --------------------------------------------------------
  function totalUnread() {
    return state.counts.vendors + state.counts.buyers +
      state.counts.admin + state.counts.pendingSignups;
  }

  function categoryCounts() {
    // Mirror useNotifications.ts:134-159 (filter to count > 0).
    var all = [
      { label: 'Vendor Messages', count: state.counts.vendors, type: 'vendor', route: 'vendor-messages.html' },
      { label: 'Buyer Messages', count: state.counts.buyers, type: 'buyer', route: 'buyer-messages.html' },
      { label: 'System Messages', count: state.counts.admin, type: 'admin', route: 'messages.html' },
      { label: 'Vendors SignUp', count: state.counts.pendingSignups, type: 'pendingSignups', route: 'vendor-signups.html' }
    ];
    return all.filter(function (c) { return c.count > 0; });
  }

  async function markAsRead(type) {
    // Mirror useNotifications.ts:178-206. pendingSignups is cleared by visiting
    // vendor-signups.html (handled in layout.js) — no API call here.
    if (type === 'pendingSignups') return;
    var unread = state.list.filter(function (n) {
      if (n.isRead !== '0') return false;
      var text = String((n.title || '') + (n.message || '')).toLowerCase();
      if (type === 'vendor') return text.indexOf('vendor') !== -1;
      if (type === 'buyer') return text.indexOf('buyer') !== -1 || text.indexOf('order') !== -1;
      return true; // admin
    });
    try {
      await Promise.all(unread.map(function (item) {
        return window.api.markNotificationAsRead(item.notificationId);
      }));
      await refresh();
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  }

  function onUpdate(handler) {
    if (typeof handler !== 'function') return function () { };
    listeners.push(handler);
    return function unsubscribe() {
      var idx = listeners.indexOf(handler);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  // ---- Lifecycle ---------------------------------------------------------
  function start() {
    refresh();
    if (intervalHandle === null) {
      intervalHandle = setInterval(refresh, REFRESH_MS);
    }
  }

  function stop() {
    if (intervalHandle !== null) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  }

  // Stop polling when token is revoked.
  if (window.auth && window.auth.onChange) {
    window.auth.onChange(function (event) {
      if (event && event.type === 'logout') stop();
    });
  }

  // ---- Expose ------------------------------------------------------------
  window.notifications = {
    counts: state.counts,
    get list() { return state.list; },
    get loading() { return state.loading; },
    totalUnread: totalUnread,
    categoryCounts: categoryCounts,
    refresh: refresh,
    markAsRead: markAsRead,
    onUpdate: onUpdate,
    start: start,
    stop: stop
  };

  // Kick off the first fetch on script load. This populates counts before
  // (or shortly after) layout.js mounts the sidebar, so badges will appear.
  start();

  // ---- Toast Notification System (mirror react-hot-toast) ---------------
  var toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function showToast(type, message) {
    var container = getToastContainer();
    var toast = document.createElement('div');

    var bgClass, icon;
    switch (type) {
      case 'success':
        bgClass = 'bg-success';
        icon = '<i class="bi bi-check-circle"></i>';
        break;
      case 'error':
        bgClass = 'bg-danger';
        icon = '<i class="bi bi-x-circle"></i>';
        break;
      case 'warning':
        bgClass = 'bg-warning';
        icon = '<i class="bi bi-exclamation-triangle"></i>';
        break;
      default:
        bgClass = 'bg-info';
        icon = '<i class="bi bi-info-circle"></i>';
    }

    toast.className = 'toast show align-items-center text-white ' + bgClass;
    toast.style.cssText = 'min-width:250px;box-shadow:0 0.5rem 1rem rgba(0,0,0,0.15);';
    toast.innerHTML =
      '<div class="d-flex">' +
      '<div class="toast-body d-flex align-items-center gap-2">' +
      icon + '<span>' + escapeHtml(message) + '</span>' +
      '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>' +
      '</div>';

    container.appendChild(toast);

    // Auto-dismiss after 3 seconds
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 150);
    }, 3000);

    // Manual dismiss on close button
    var closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        toast.classList.remove('show');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 150);
      });
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose toast API
  window.showNotification = showToast;
})();
