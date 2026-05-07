// AdminHub Dashboard - Bootstrap Version
// Consolidated Universal JavaScript - Single file for all pages

(function () {
    'use strict';

    // === SHARED UTILITIES ===
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        if (!value) return '';
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function formatDateTime(value) {
        if (!value) return '';
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getQueryParam(name) {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get(name);
        } catch (e) { return null; }
    }

    function setViewState(root, state) {
        if (!root) return;
        ['loading', 'error', 'empty', 'ready'].forEach(function (name) {
            root.querySelectorAll('.state-' + name).forEach(function (el) {
                el.classList.toggle('d-none', name !== state);
            });
        });
    }

    // === SIDEBAR & THEME ===
    function initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var mainContent = document.getElementById('main-content');
        var sidebarToggle = document.getElementById('sidebarToggle');
        var sidebarCollapse = document.getElementById('sidebarCollapse');

        if (!sidebar) return;

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function () {
                sidebar.classList.toggle('collapsed');
                if (mainContent) mainContent.classList.toggle('expanded');
            });
        }

        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', function () {
                sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.classList.remove('expanded');
            });
        }

        document.addEventListener('click', function (e) {
            if (window.innerWidth < 992) {
                var inSidebar = sidebar.contains(e.target);
                var inToggle = sidebarToggle && sidebarToggle.contains(e.target);
                if (!inSidebar && !inToggle) {
                    sidebar.classList.remove('collapsed');
                    if (mainContent) mainContent.classList.remove('expanded');
                }
            }
        });
    }

    var THEME_NAMES = ['forest', 'ocean', 'sunset', 'midnight', 'minimal'];

    function applyColorTheme(name) {
        if (THEME_NAMES.indexOf(name) === -1) name = 'forest';
        THEME_NAMES.forEach(function (t) {
            document.body.classList.remove('theme-' + t);
        });
        document.body.classList.add('theme-' + name);
        document.querySelectorAll('.theme-option').forEach(function (el) {
            var isActive = el.getAttribute('data-theme') === name;
            el.classList.toggle('active', isActive);
            var check = el.querySelector('.bi-check2');
            if (check) check.classList.toggle('d-none', !isActive);
        });
    }

    function initThemeToggle() {
        var savedTheme = localStorage.getItem('color-theme') || 'forest';
        applyColorTheme(savedTheme);
        document.querySelectorAll('.theme-option').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                var name = this.getAttribute('data-theme');
                applyColorTheme(name);
                localStorage.setItem('color-theme', name);
            });
        });
    }

    // === LOGIN PAGE ===
    function initLogin() {
        var loginForm = document.getElementById('loginForm');
        var emailInput = document.getElementById('loginEmail');
        var passInput = document.getElementById('loginPassword');
        var errorBox = document.getElementById('loginError');
        var submitBtn = document.getElementById('loginSubmit');
        var toggleBtn = document.getElementById('togglePasswordBtn');
        var toggleIcon = document.getElementById('toggleIcon');

        if (!loginForm || !window.auth || !window.APP_CONFIG) return;

        var POST_LOGIN_PAGE = window.APP_CONFIG.AUTH.POST_LOGIN_PAGE;

        if (window.auth.isAuthenticated()) {
            window.location.replace(POST_LOGIN_PAGE);
            return;
        }

        if (toggleBtn && passInput && toggleIcon) {
            toggleBtn.addEventListener('click', function () {
                var showing = passInput.type === 'text';
                passInput.type = showing ? 'password' : 'text';
                toggleIcon.classList.toggle('bi-eye', showing);
                toggleIcon.classList.toggle('bi-eye-slash', !showing);
                toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
            });
        }

        function setError(message) {
            if (!errorBox) return;
            if (message) {
                errorBox.textContent = message;
                errorBox.hidden = false;
            } else {
                errorBox.textContent = '';
                errorBox.hidden = true;
            }
        }

        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            setError('');
            var email = (emailInput && emailInput.value || '').trim();
            var password = passInput && passInput.value || '';

            if (!email || !password) {
                setError('Please enter both email and password.');
                return;
            }

            var originalLabel = submitBtn ? submitBtn.textContent : 'Sign in';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
            }

            try {
                await window.auth.login(email, password);
                window.location.href = POST_LOGIN_PAGE;
            } catch (err) {
                console.error('Login error:', err);
                var msg = err && err.message ? err.message : 'Login failed. Please try again.';
                setError(msg);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
            }
        });
    }

    // === PAGE HANDLERS ===

    // Overview Page
    window.initOverviewPage = function () {
        var U = { escape: escapeHtml, formatDate: formatDate, setViewState: setViewState };
        var api = window.api;

        function renderStatCard(root, key, label, icon, value) {
            root.innerHTML = '<div class="card stat-card h-100" data-stat="' + key + '">' +
                '<div class="card-body d-flex justify-content-between align-items-center">' +
                '<div><p class="text-muted small mb-1">' + U.escape(label) + '</p>' +
                '<p class="h3 fw-bold mb-0 stat-value">' + (value == null ? '0' : U.escape(String(value))) + '</p></div>' +
                '<i class="bi ' + icon + ' fs-1 text-muted opacity-50"></i></div></div>';
        }

        function renderRecentContacts(root, contacts) {
            if (!contacts || contacts.length === 0) { root.innerHTML = '<p class="text-muted small mb-0">No contacts yet.</p>'; return; }
            root.innerHTML = contacts.map(function (c) {
                return '<div class="d-flex justify-content-between align-items-center p-3 rounded border mb-2">' +
                    '<div class="me-3"><p class="mb-0 fw-medium">' + U.escape(c.fullName) + '</p>' +
                    '<p class="mb-0 small text-muted">' + U.escape(c.subject) + '</p></div>' +
                    '<div class="text-end"><p class="mb-0 small text-muted">' + U.escape(U.formatDate(c.createdAt)) + '</p></div></div>';
            }).join('');
        }

        function renderRecentWaitlist(root, waitlist) {
            if (!waitlist || waitlist.length === 0) { root.innerHTML = '<p class="text-muted small mb-0">No waitlist entries yet.</p>'; return; }
            root.innerHTML = waitlist.map(function (w) {
                var businessName = w.business_name || w.businessName || '';
                var fullName = w.full_name || w.fullName || '';
                var createdAt = w.created_at || w.createdAt || '';
                return '<div class="d-flex justify-content-between align-items-center p-3 rounded border mb-2">' +
                    '<div class="me-3"><p class="mb-0 fw-medium">' + U.escape(businessName) + '</p>' +
                    '<p class="mb-0 small text-muted">' + U.escape(fullName) + '</p></div>' +
                    '<div class="text-end"><p class="mb-0 small text-muted">' + U.escape(U.formatDate(createdAt)) + '</p></div></div>';
            }).join('');
        }

        function renderPendingBanner(container, count) {
            if (!container) return;
            if (!count || count <= 0) { container.innerHTML = ''; container.classList.add('d-none'); return; }
            container.classList.remove('d-none');
            container.innerHTML = '<div class="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">' +
                '<i class="bi bi-exclamation-circle fs-5"></i>' +
                '<p class="mb-0 small fw-medium">You have ' + U.escape(String(count)) + ' pending user sign-up' + (count === 1 ? '' : 's') + ' to approve.</p>' +
                '<a href="vendor-signups.html?filter=pending" class="ms-auto small fw-medium text-reset text-decoration-underline">Review now</a></div>';
        }

        async function init() {
            var root = document.getElementById('overviewRoot');
            if (!root) return;
            var statsRow = document.getElementById('overviewStats');
            var pendingBanner = document.getElementById('pendingBanner');
            var recentContactsEl = document.getElementById('recentContacts');
            var recentWaitlistEl = document.getElementById('recentWaitlist');

            U.setViewState(root, 'loading');
            try {
                var results = await Promise.all([api.getContacts(1, 5), api.getWaitlist(1, 5), api.getOverviewStats()]);
                var contactsRes = results[0], waitlistRes = results[1], statsRes = results[2];
                var stats = (statsRes && statsRes.data) || {};

                statsRow.innerHTML = '<div class="col-md-6 col-lg-3" id="statCardVendors"></div>' +
                    '<div class="col-md-6 col-lg-3" id="statCardOrders"></div>' +
                    '<div class="col-md-6 col-lg-3" id="statCardAdminMessages"></div>' +
                    '<div class="col-md-6 col-lg-3" id="statCardContactMessages"></div>';
                renderStatCard(document.getElementById('statCardVendors'), 'totalVendors', 'Vendor count', 'bi-people', stats.totalVendors || 0);
                renderStatCard(document.getElementById('statCardOrders'), 'completedOrders', 'Completed order', 'bi-box', stats.completedOrders || 0);
                renderStatCard(document.getElementById('statCardAdminMessages'), 'adminMessagesCount', 'Message count', 'bi-chat-square-text', stats.adminMessagesCount || 0);
                renderStatCard(document.getElementById('statCardContactMessages'), 'contactMessagesCount', 'Contact message count', 'bi-chat-left-dots', stats.buyerMessagesCount || 0);

                var counts = window.notifications && window.notifications.counts;
                renderPendingBanner(pendingBanner, counts ? counts.pendingSignups : 0);
                renderRecentContacts(recentContactsEl, (contactsRes && contactsRes.data) || []);
                renderRecentWaitlist(recentWaitlistEl, (waitlistRes && waitlistRes.data) || []);
                U.setViewState(root, 'ready');
            } catch (err) {
                console.error('Overview load failed:', err);
                U.setViewState(root, 'error');
            }
        }

        window.addEventListener('notifications:update', function (e) {
            var banner = document.getElementById('pendingBanner');
            if (!banner) return;
            var counts = (e && e.detail && e.detail.counts) || (window.notifications && window.notifications.counts);
            renderPendingBanner(banner, counts ? counts.pendingSignups : 0);
        });

        init();
    };

    // Contacts Page
    window.initContactsPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, contacts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, exporting: false };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.contactsList = document.getElementById('contactsList');
            els.contactsContainer = document.getElementById('contactsContainer');
            els.totalContacts = document.getElementById('totalContacts');
            els.exportBtn = document.getElementById('exportBtn');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getContacts(page || 1, PAGE_SIZE);
                if (response && response.data) {
                    state.contacts = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.contacts = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load contacts:', err);
                state.error = 'Failed to load contacts. Please try again.';
                state.contacts = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.contacts.length === 0));
            if (els.contactsList) els.contactsList.classList.toggle('d-none', !(!state.loading && !state.error && state.contacts.length > 0));
            if (els.totalContacts) els.totalContacts.textContent = state.pagination.totalItems + ' total contacts';

            if (els.contactsContainer) {
                els.contactsContainer.innerHTML = '';
                state.contacts.forEach(function (contact) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    var createdAt = contact.createdAt ? new Date(contact.createdAt) : null;
                    var dateStr = createdAt ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    var timeStr = createdAt ? createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-center gap-4"><div><h6 class="mb-0">' + escapeHtml(contact.fullName || 'N/A') + '</h6><p class="text-muted small mb-0">' + escapeHtml(contact.email || '') + '</p></div><div class="d-none d-md-block"><p class="small fw-medium mb-0">' + escapeHtml(contact.subject || '') + '</p><p class="text-muted small mb-0 text-truncate" style="max-width: 400px;">' + escapeHtml(contact.message || '') + '</p></div></div></div><div class="d-flex align-items-center gap-4"><div class="text-end d-none d-sm-block"><p class="text-muted small mb-0">' + dateStr + '</p><p class="text-muted small mb-0">' + timeStr + '</p></div><a href="contact-detail.html?id=' + escapeHtml(contact.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.contactsContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' contact' + (total !== 1 ? 's' : '');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        if (els.exportBtn) {
            els.exportBtn.addEventListener('click', async function () {
                state.exporting = true;
                this.disabled = true;
                this.innerHTML = '<i class="bi bi-download"></i> Exporting...';
                try {
                    var response = await window.api.getAllContacts();
                    if (response && response.data && Array.isArray(response.data)) {
                        var rows = [['Full Name', 'Email', 'Phone', 'Subject', 'Message', 'Created At']];
                        response.data.forEach(function (contact) {
                            rows.push([contact.fullName || '', contact.email || '', contact.phone || '', contact.subject || '', contact.message || '', formatDate(contact.createdAt)]);
                        });
                        var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
                        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'contacts_' + new Date().toISOString().slice(0, 10) + '.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                } catch (err) {
                    console.error('Failed to export contacts:', err);
                    state.error = 'Failed to export contacts. Please try again.';
                    render();
                } finally {
                    state.exporting = false;
                    this.disabled = false;
                    this.innerHTML = '<i class="bi bi-download"></i> Export CSV';
                }
            });
        }
        loadPage();
    };

    // Waitlist Page
    window.initWaitlistPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, waitlist: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, exporting: false };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.waitlistList = document.getElementById('waitlistList');
            els.waitlistContainer = document.getElementById('waitlistContainer');
            els.totalWaitlist = document.getElementById('totalWaitlist');
            els.exportBtn = document.getElementById('exportBtn');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getWaitlist(page || 1, PAGE_SIZE);
                if (response && response.data) {
                    state.waitlist = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.waitlist = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load waitlist:', err);
                state.error = 'Failed to load waitlist. Please try again.';
                state.waitlist = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.waitlist.length === 0));
            if (els.waitlistList) els.waitlistList.classList.toggle('d-none', !(!state.loading && !state.error && state.waitlist.length > 0));
            if (els.totalWaitlist) els.totalWaitlist.textContent = state.pagination.totalItems + ' vendor applications';

            if (els.waitlistContainer) {
                els.waitlistContainer.innerHTML = '';
                state.waitlist.forEach(function (entry) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    var businessName = entry.business_name || entry.businessName || 'N/A';
                    var fullName = entry.full_name || entry.fullName || 'N/A';
                    var businessType = entry.business_type || entry.businessType || 'N/A';
                    var stateOfOp = entry.state_of_operation || entry.stateOfOperation || 'N/A';
                    var createdAt = formatDate(entry.created_at || entry.createdAt || '');
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-start gap-3"><div class="flex-1"><div class="d-flex align-items-center gap-2 mb-1"><i class="bi bi-building text-muted small"></i><h6 class="mb-0">' + escapeHtml(businessName) + '</h6><span class="badge bg-light text-dark small">' + escapeHtml(businessType) + '</span></div><p class="text-muted small mb-1">' + escapeHtml(fullName) + '</p><div class="d-flex align-items-center gap-1 text-muted small"><i class="bi bi-geo-alt small"></i><span>' + escapeHtml(stateOfOp) + '</span></div></div><div class="d-none d-md-block text-end"><p class="text-muted small mb-0">Applied on</p><p class="small fw-medium mb-0">' + createdAt + '</p></div></div></div><div class="ms-3"><a href="waitlist-detail.html?id=' + escapeHtml(entry.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.waitlistContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' entr' + (total !== 1 ? 'ies' : 'y');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        if (els.exportBtn) {
            els.exportBtn.addEventListener('click', async function () {
                state.exporting = true;
                this.disabled = true;
                this.innerHTML = '<i class="bi bi-download"></i> Exporting...';
                try {
                    var response = await window.api.getAllWaitlist();
                    if (response && response.data && Array.isArray(response.data)) {
                        var rows = [['Business Name', 'Contact Name', 'Email', 'Phone', 'Business Type', 'State of Operation', 'Created At']];
                        response.data.forEach(function (entry) {
                            rows.push([entry.business_name || entry.businessName || '', entry.full_name || entry.fullName || '', entry.email || '', entry.phone || '', entry.business_type || entry.businessType || '', entry.state_of_operation || entry.stateOfOperation || '', formatDate(entry.created_at || entry.createdAt || '')]);
                        });
                        var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
                        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'waitlist_' + new Date().toISOString().slice(0, 10) + '.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                } catch (err) {
                    console.error('Failed to export waitlist:', err);
                    state.error = 'Failed to export waitlist. Please try again.';
                    render();
                } finally {
                    state.exporting = false;
                    this.disabled = false;
                    this.innerHTML = '<i class="bi bi-download"></i> Export CSV';
                }
            });
        }
        loadPage();
    };

    // Commission Change Page
    window.initCommissionChangePage = function () {
        var state = { currentCommission: '', newCommission: '', loading: false, error: null, loadError: null };
        var els = {};

        function cacheElements() {
            els.loadErrorAlert = document.getElementById('loadErrorAlert');
            els.loadErrorMessage = document.getElementById('loadErrorMessage');
            els.currentCommissionInput = document.getElementById('currentCommission');
            els.newCommissionInput = document.getElementById('newCommission');
            els.form = document.getElementById('commissionForm');
            els.errorAlert = document.getElementById('errorAlert');
            els.errorMessage = document.getElementById('errorMessage');
            els.submitBtn = document.getElementById('submitBtn');
        }

        async function loadCommission() {
            state.loadError = null;
            renderLoadError();
            try {
                var response = await window.api.getCommission();
                state.currentCommission = response.data && response.data.platformCommission ? String(response.data.platformCommission) : '';
                if (els.currentCommissionInput) els.currentCommissionInput.value = state.currentCommission;
            } catch (err) {
                console.error('Failed to fetch current commission:', err);
                state.loadError = 'Unable to load commission settings.';
                renderLoadError();
            }
        }

        async function handleSubmit(e) {
            e.preventDefault();
            state.error = null;
            renderError();
            var commissionValue = parseFloat(state.newCommission);
            if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
                state.error = 'Please enter a valid commission percentage between 0 and 100';
                renderError();
                return;
            }
            state.loading = true;
            render();
            try {
                var response = await window.api.updateCommission({ platformShare: commissionValue });
                state.currentCommission = String(commissionValue);
                state.newCommission = '';
                if (els.currentCommissionInput) els.currentCommissionInput.value = state.currentCommission;
                if (els.newCommissionInput) els.newCommissionInput.value = '';
                if (window.showNotification) {
                    window.showNotification('success', response.data && response.data.message ? response.data.message : 'Commission percentage updated to ' + commissionValue + '%');
                }
            } catch (err) {
                console.error('Failed to update commission:', err);
                state.error = err instanceof Error ? err.message : 'Failed to update commission percentage';
                renderError();
                if (window.showNotification) window.showNotification('error', state.error);
            } finally {
                state.loading = false;
                render();
            }
        }

        function render() {
            if (els.submitBtn) {
                els.submitBtn.disabled = state.loading || !state.newCommission;
                els.submitBtn.textContent = state.loading ? 'Updating...' : 'Update Commission';
            }
            if (els.newCommissionInput) els.newCommissionInput.disabled = state.loading;
        }

        function renderError() {
            if (els.errorAlert) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorAlert.classList.remove('d-none'); }
                else { els.errorAlert.classList.add('d-none'); }
            }
        }

        function renderLoadError() {
            if (els.loadErrorAlert) {
                if (state.loadError) { if (els.loadErrorMessage) els.loadErrorMessage.textContent = state.loadError; els.loadErrorAlert.classList.remove('d-none'); }
                else { els.loadErrorAlert.classList.add('d-none'); }
            }
        }

        cacheElements();
        if (els.form) els.form.addEventListener('submit', handleSubmit);
        if (els.newCommissionInput) els.newCommissionInput.addEventListener('input', function (e) { state.newCommission = e.target.value; });
        loadCommission();
    };

    // Business Category Create Page
    window.initBusinessCategoryCreatePage = function () {
        var state = { categoryName: '', loading: false, error: null };
        var els = {};

        function cacheElements() {
            els.categoryNameInput = document.getElementById('categoryName');
            els.form = document.getElementById('createForm');
            els.errorAlert = document.getElementById('errorAlert');
            els.errorMessage = document.getElementById('errorMessage');
            els.submitBtn = document.getElementById('submitBtn');
            els.cancelBtn = document.getElementById('cancelBtn');
            els.backBtn = document.getElementById('backBtn');
        }

        async function handleSubmit(e) {
            e.preventDefault();
            if (!state.categoryName.trim()) {
                state.error = 'Category name is required';
                renderError();
                return;
            }
            state.loading = true;
            state.error = null;
            render();
            try {
                await window.api.createBusinessCategory({ categoryName: state.categoryName.trim() });
                window.location.href = 'business-categories.html';
            } catch (err) {
                console.error('Failed to create business category:', err);
                state.error = err instanceof Error ? err.message : 'Failed to create category';
                renderError();
            } finally {
                state.loading = false;
                render();
            }
        }

        function handleCancel() {
            window.location.href = 'business-categories.html';
        }

        function render() {
            if (els.submitBtn) {
                els.submitBtn.disabled = state.loading || !state.categoryName.trim();
                els.submitBtn.textContent = state.loading ? 'Creating...' : 'Create Category';
            }
            if (els.cancelBtn) els.cancelBtn.disabled = state.loading;
        }

        function renderError() {
            if (els.errorAlert) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorAlert.classList.remove('d-none'); }
                else { els.errorAlert.classList.add('d-none'); }
            }
        }

        cacheElements();
        if (els.categoryNameInput) els.categoryNameInput.addEventListener('input', function (e) { state.categoryName = e.target.value; render(); });
        if (els.form) els.form.addEventListener('submit', handleSubmit);
        if (els.cancelBtn) els.cancelBtn.addEventListener('click', handleCancel);
        if (els.backBtn) els.backBtn.addEventListener('click', handleCancel);
    };

    // Product Category Create Page
    window.initProductCategoryCreatePage = function () {
        var state = { categoryName: '', loading: false, error: null };
        var els = {};

        function cacheElements() {
            els.categoryNameInput = document.getElementById('categoryName');
            els.form = document.getElementById('createForm');
            els.errorAlert = document.getElementById('errorAlert');
            els.errorMessage = document.getElementById('errorMessage');
            els.submitBtn = document.getElementById('submitBtn');
            els.cancelBtn = document.getElementById('cancelBtn');
            els.backBtn = document.getElementById('backBtn');
        }

        async function handleSubmit(e) {
            e.preventDefault();
            if (!state.categoryName.trim()) {
                state.error = 'Category name is required';
                renderError();
                return;
            }
            state.loading = true;
            state.error = null;
            render();
            try {
                await window.api.createProductCategory({ categoryName: state.categoryName.trim() });
                window.location.href = 'product-categories.html';
            } catch (err) {
                console.error('Failed to create product category:', err);
                state.error = err instanceof Error ? err.message : 'Failed to create category';
                renderError();
            } finally {
                state.loading = false;
                render();
            }
        }

        function handleCancel() {
            window.location.href = 'product-categories.html';
        }

        function render() {
            if (els.submitBtn) {
                els.submitBtn.disabled = state.loading || !state.categoryName.trim();
                els.submitBtn.textContent = state.loading ? 'Creating...' : 'Create Category';
            }
            if (els.cancelBtn) els.cancelBtn.disabled = state.loading;
        }

        function renderError() {
            if (els.errorAlert) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorAlert.classList.remove('d-none'); }
                else { els.errorAlert.classList.add('d-none'); }
            }
        }

        cacheElements();
        if (els.categoryNameInput) els.categoryNameInput.addEventListener('input', function (e) { state.categoryName = e.target.value; render(); });
        if (els.form) els.form.addEventListener('submit', handleSubmit);
        if (els.cancelBtn) els.cancelBtn.addEventListener('click', handleCancel);
        if (els.backBtn) els.backBtn.addEventListener('click', handleCancel);
    };

    // Vendor Signups Page
    window.initVendorSignupsPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, signups: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.signupsList = document.getElementById('signupsList');
            els.signupsContainer = document.getElementById('signupsContainer');
            els.totalSignups = document.getElementById('totalSignups');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getVendorSignups(page || 1, PAGE_SIZE);
                console.debug('[debug] getVendorSignups response:', response && response.pagination ? response.pagination : '(no pagination)', 'items:', (response && response.data && response.data.length) || 0);
                if (response && response.data) {
                    state.signups = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.signups = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load vendor signups:', err);
                state.error = 'Failed to load vendor signups. Please try again.';
                state.signups = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.signups.length === 0));
            if (els.signupsList) els.signupsList.classList.toggle('d-none', !(!state.loading && !state.error && state.signups.length > 0));
            if (els.totalSignups) els.totalSignups.textContent = (state.pagination.totalItems || 0) + ' vendor applications';

            if (els.signupsContainer) {
                els.signupsContainer.innerHTML = '';
                try {
                    state.signups.forEach(function (signup) {
                        var div = document.createElement('div');
                        div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                        div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                        var statusClass = signup.isApproved === '1' ? 'bg-success' : (signup.isSuspended === '1' ? 'bg-danger' : 'bg-warning');
                        var statusText = signup.isApproved === '1' ? 'Active' : (signup.isSuspended === '1' ? 'Suspended' : 'Pending');
                        div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-start gap-3"><div class="flex-1"><div class="d-flex align-items-center gap-2 mb-1"><h6 class="mb-0">' + escapeHtml(signup.businessName || 'N/A') + '</h6><span class="badge ' + statusClass + '">' + statusText + '</span></div><p class="text-muted small mb-1">' + escapeHtml(signup.fullName || 'N/A') + '</p><p class="text-muted small mb-0">' + escapeHtml(signup.emailAddress || 'N/A') + '</p></div><div class="d-none d-md-block text-end"><p class="text-muted small mb-0">Joined</p><p class="small fw-medium mb-0">' + formatDate(signup.createdAt) + '</p></div></div></div><div class="ms-3"><a href="vendor-signup-detail.html?id=' + escapeHtml(signup.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                        els.signupsContainer.appendChild(div);
                    });
                } catch (e) {
                    console.error('[debug] error rendering signups:', e, 'state.signups:', state.signups);
                    // show error state so user sees something
                    state.error = 'Failed to render vendor signups';
                }
                // If items were rendered, ensure first item is scrolled into view for users
                try {
                    var first = els.signupsContainer && els.signupsContainer.firstElementChild;
                    if (first) first.scrollIntoView({ behavior: 'auto', block: 'center' });
                } catch (e) { /* ignore scroll errors */ }
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' vendor' + (total !== 1 ? 's' : '');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Buyer Signups Page
    window.initBuyerSignupsPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, signups: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.signupsList = document.getElementById('signupsList');
            els.signupsContainer = document.getElementById('signupsContainer');
            els.totalSignups = document.getElementById('totalSignups');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getBuyerSignups(page || 1, PAGE_SIZE);
                if (response && response.data) {
                    state.signups = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.signups = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load buyer signups:', err);
                state.error = 'Failed to load buyer signups. Please try again.';
                state.signups = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.signups.length === 0));
            if (els.signupsList) els.signupsList.classList.toggle('d-none', !(!state.loading && !state.error && state.signups.length > 0));
            if (els.totalSignups) els.totalSignups.textContent = state.pagination.totalItems + ' buyer signups';

            if (els.signupsContainer) {
                els.signupsContainer.innerHTML = '';
                state.signups.forEach(function (signup) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    var statusClass = signup.isActive === '1' ? 'bg-success' : 'bg-secondary';
                    var statusText = signup.isActive === '1' ? 'Active' : 'Inactive';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-start gap-3"><div class="flex-1"><div class="d-flex align-items-center gap-2 mb-1"><h6 class="mb-0">' + escapeHtml(signup.fullName || 'N/A') + '</h6><span class="badge ' + statusClass + '">' + statusText + '</span></div><p class="text-muted small mb-1">' + escapeHtml(signup.emailAddress || 'N/A') + '</p><p class="text-muted small mb-0">' + escapeHtml(signup.phoneNumber || 'N/A') + '</p></div><div class="d-none d-md-block text-end"><p class="text-muted small mb-0">Joined</p><p class="small fw-medium mb-0">' + formatDate(signup.createdAt) + '</p></div></div></div><div class="ms-3"><a href="buyer-signup-detail.html?id=' + escapeHtml(signup.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.signupsContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' buyer' + (total !== 1 ? 's' : '');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Business Categories Page
    window.initBusinessCategoriesPage = function () {
        var PAGE_SIZE = 10;
        var state = { loading: false, error: null, categories: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.categoriesList = document.getElementById('categoriesList');
            els.categoriesContainer = document.getElementById('categoriesContainer');
            els.totalCategories = document.getElementById('totalCategories');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getBusinessCategories();
                if (response && response.data) {
                    state.categories = response.data;
                    state.pagination = { currentPage: 1, totalPages: 1, totalItems: response.data.length };
                } else { state.categories = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load business categories:', err);
                state.error = 'Failed to load business categories. Please try again.';
                state.categories = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.categories.length === 0));
            if (els.categoriesList) els.categoriesList.classList.toggle('d-none', !(!state.loading && !state.error && state.categories.length > 0));
            if (els.totalCategories) els.totalCategories.textContent = state.pagination.totalItems + ' categories';

            if (els.categoriesContainer) {
                els.categoriesContainer.innerHTML = '';
                state.categories.forEach(function (category) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-center gap-3"><div><h6 class="mb-0">' + escapeHtml(category.categoryName || 'N/A') + '</h6><p class="text-muted small mb-0">ID: ' + escapeHtml(category.id || 'N/A') + '</p></div><div class="ms-auto"><span class="badge bg-light text-dark">' + (category.associatedBusinesses || 0) + ' businesses</span></div></div></div><div class="ms-3"><a href="business-category-detail.html?id=' + escapeHtml(category.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.categoriesContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' categor' + (total !== 1 ? 'ies' : 'y');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Product Categories Page
    window.initProductCategoriesPage = function () {
        var PAGE_SIZE = 10;
        var state = { loading: false, error: null, categories: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.categoriesList = document.getElementById('categoriesList');
            els.categoriesContainer = document.getElementById('categoriesContainer');
            els.totalCategories = document.getElementById('totalCategories');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getProductCategories(page || 1, PAGE_SIZE);
                if (response && response.data) {
                    state.categories = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.categories = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load product categories:', err);
                state.error = 'Failed to load product categories. Please try again.';
                state.categories = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.categories.length === 0));
            if (els.categoriesList) els.categoriesList.classList.toggle('d-none', !(!state.loading && !state.error && state.categories.length > 0));
            if (els.totalCategories) els.totalCategories.textContent = state.pagination.totalItems + ' categories';

            if (els.categoriesContainer) {
                els.categoriesContainer.innerHTML = '';
                state.categories.forEach(function (category) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-center gap-3"><div><h6 class="mb-0">' + escapeHtml(category.categoryName || 'N/A') + '</h6><p class="text-muted small mb-0">ID: ' + escapeHtml(category.categoryId || 'N/A') + '</p></div><div class="ms-auto"><span class="badge bg-light text-dark">' + (category.associatedProducts || 0) + ' products</span></div></div></div><div class="ms-3"><a href="product-category-detail.html?id=' + escapeHtml(category.categoryId) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.categoriesContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' categor' + (total !== 1 ? 'ies' : 'y');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Buyer Messages Page
    window.initBuyerMessagesPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, messages: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.messagesList = document.getElementById('messagesList');
            els.messagesContainer = document.getElementById('messagesContainer');
            els.totalMessages = document.getElementById('totalMessages');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getTickets(page || 1, PAGE_SIZE);
                console.debug('[debug] getTickets response keys:', response && Object.keys(response || {}));
                var items = response && (response.data || response.tickets || response.messages);
                if (items) {
                    state.messages = items;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: (items && items.length) || 0 };
                } else { state.messages = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load buyer messages:', err);
                state.error = 'Failed to load buyer messages. Please try again.';
                state.messages = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.messages.length === 0));
            if (els.messagesList) els.messagesList.classList.toggle('d-none', !(!state.loading && !state.error && state.messages.length > 0));
            if (els.totalMessages) els.totalMessages.textContent = state.pagination.totalItems + ' messages';

            if (els.messagesContainer) {
                els.messagesContainer.innerHTML = '';
                state.messages.forEach(function (msg) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-start gap-3"><div class="flex-1"><div class="d-flex align-items-center gap-2 mb-1"><h6 class="mb-0">' + escapeHtml(msg.subject || 'N/A') + '</h6><span class="badge bg-primary">Ticket #' + escapeHtml((msg.ticketId || msg.id) || 'N/A') + '</span></div><p class="text-muted small mb-1">' + escapeHtml(msg.senderName || 'N/A') + '</p><p class="text-muted small mb-0">' + escapeHtml((msg.message || '').substring(0, 80)) + '...</p></div><div class="d-none d-md-block text-end"><p class="text-muted small mb-0">Created</p><p class="small fw-medium mb-0">' + formatDate(msg.createdAt) + '</p></div></div></div><div class="ms-3"><a href="buyer-message-detail.html?id=' + escapeHtml(msg.ticketId || msg.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.messagesContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' message' + (total !== 1 ? 's' : '');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Vendor Messages Page
    window.initVendorMessagesPage = function () {
        var PAGE_SIZE = 5;
        var state = { loading: false, error: null, messages: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.emptyState = document.getElementById('emptyState');
            els.messagesList = document.getElementById('messagesList');
            els.messagesContainer = document.getElementById('messagesContainer');
            els.totalMessages = document.getElementById('totalMessages');
            els.paginationInfo = document.getElementById('paginationInfo');
            els.paginationControls = document.getElementById('paginationControls');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getTickets(page || 1, PAGE_SIZE);
                var items = response && (response.data || response.tickets || response.messages);
                if (items) {
                    state.messages = items;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: (items && items.length) || 0 };
                } else { state.messages = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load vendor messages:', err);
                state.error = 'Failed to load vendor messages. Please try again.';
                state.messages = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.emptyState) els.emptyState.classList.toggle('d-none', !(!state.loading && !state.error && state.messages.length === 0));
            if (els.messagesList) els.messagesList.classList.toggle('d-none', !(!state.loading && !state.error && state.messages.length > 0));
            if (els.totalMessages) els.totalMessages.textContent = state.pagination.totalItems + ' messages';

            if (els.messagesContainer) {
                els.messagesContainer.innerHTML = '';
                state.messages.forEach(function (msg) {
                    var div = document.createElement('div');
                    div.className = 'd-flex align-items-center justify-content-between p-4 rounded border mb-3';
                    div.style.cssText = 'background-color: var(--card); border-color: var(--border);';
                    div.innerHTML = '<div class="flex-1"><div class="d-flex align-items-start gap-3"><div class="flex-1"><div class="d-flex align-items-center gap-2 mb-1"><h6 class="mb-0">' + escapeHtml(msg.subject || 'N/A') + '</h6><span class="badge bg-primary">Ticket #' + escapeHtml((msg.ticketId || msg.id) || 'N/A') + '</span></div><p class="text-muted small mb-1">' + escapeHtml(msg.senderName || 'N/A') + '</p><p class="text-muted small mb-0">' + escapeHtml((msg.message || '').substring(0, 80)) + '...</p></div><div class="d-none d-md-block text-end"><p class="text-muted small mb-0">Created</p><p class="small fw-medium mb-0">' + formatDate(msg.createdAt) + '</p></div></div></div><div class="ms-3"><a href="vendor-message-detail.html?id=' + escapeHtml(msg.ticketId || msg.id) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i> View</a></div>';
                    els.messagesContainer.appendChild(div);
                });
            }

            if (els.paginationInfo && els.paginationControls) {
                var totalPages = state.pagination.totalPages, currentPage = state.pagination.currentPage, total = state.pagination.totalItems;
                els.paginationInfo.textContent = totalPages > 1 ? 'Page ' + currentPage + ' of ' + totalPages + ' (' + total + ' total)' : 'Showing all ' + total + ' message' + (total !== 1 ? 's' : '');
                els.paginationControls.innerHTML = '';
                if (totalPages > 1) {
                    var prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-sm btn-outline-secondary';
                    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.addEventListener('click', function () { if (currentPage > 1) loadPage(currentPage - 1); });
                    els.paginationControls.appendChild(prevBtn);
                    var nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-sm btn-outline-secondary';
                    nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.addEventListener('click', function () { if (currentPage < totalPages) loadPage(currentPage + 1); });
                    els.paginationControls.appendChild(nextBtn);
                }
            }
        }

        cacheElements();
        loadPage();
    };

    // Orders Page
    window.initOrdersPage = function () {
        var PAGE_SIZE = 10;
        var state = { loading: false, error: null, orders: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
        var els = {};

        function cacheElements() {
            els.loadingOverlay = document.getElementById('loadingOverlay');
            els.ordersTableBody = document.getElementById('ordersTableBody');
            els.paginationContainer = document.getElementById('paginationContainer');
            els.errorAlert = document.getElementById('errorAlert');
        }

        async function loadPage(page) {
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getOrders({ page: page || 1, perPage: PAGE_SIZE });
                if (response && response.data) {
                    state.orders = response.data;
                    state.pagination = response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
                } else { state.orders = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 }; }
            } catch (err) {
                console.error('Failed to load orders:', err);
                state.error = 'Failed to load orders. Please try again.';
                state.orders = []; state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0 };
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingOverlay) {
                els.loadingOverlay.classList.toggle('d-none', !state.loading);
                els.loadingOverlay.classList.toggle('d-flex', !!state.loading);
            }
            if (els.errorAlert) els.errorAlert.classList.toggle('d-none', !state.error);

            if (els.ordersTableBody) {
                els.ordersTableBody.innerHTML = '';
                state.orders.forEach(function (order) {
                    var tr = document.createElement('tr');
                    var statusClass = order.status === 'delivered' ? 'bg-success' : (order.status === 'cancelled' ? 'bg-danger' : 'bg-warning');
                    tr.innerHTML = '<td>' + escapeHtml(order.orderNo || 'N/A') + '</td><td>' + escapeHtml(order.customerName || 'N/A') + '</td><td>' + escapeHtml(order.customerEmail || 'N/A') + '</td><td><span class="badge ' + statusClass + '">' + escapeHtml(order.status || 'N/A') + '</span></td><td>' + escapeHtml(order.totalAmount || 'N/A') + '</td><td>' + formatDate(order.createdAt) + '</td><td><a href="order-detail.html?orderNo=' + encodeURIComponent(escapeHtml(order.orderNo || '')) + '" class="btn btn-sm btn-outline-primary">View</a></td>';
                    els.ordersTableBody.appendChild(tr);
                });
            }
        }

        cacheElements();
        loadPage();
    };

    // Detail pages - fetch and render data
    window.initContactDetailPage = function () {
        var state = { loading: false, error: null, contact: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.contactDetail = document.getElementById('contactDetail');
            els.subjectDisplay = document.getElementById('subjectDisplay');
            els.messageDisplay = document.getElementById('messageDisplay');
            els.fullNameDisplay = document.getElementById('fullNameDisplay');
            els.emailDisplay = document.getElementById('emailDisplay');
            els.submittedDateDisplay = document.getElementById('submittedDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.backBtn = document.getElementById('backBtn');
        }

        async function loadContact() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Contact ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getContact(state.id);
                state.contact = response.data;
            } catch (err) {
                console.error('Failed to load contact:', err);
                state.error = 'Failed to load contact. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.contactDetail) els.contactDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.contact));
            if (state.contact && els.subjectDisplay) els.subjectDisplay.textContent = state.contact.subject || '--';
            if (state.contact && els.messageDisplay) els.messageDisplay.textContent = state.contact.message || '--';
            if (state.contact && els.fullNameDisplay) els.fullNameDisplay.textContent = state.contact.fullName || '--';
            if (state.contact && els.emailDisplay) {
                els.emailDisplay.textContent = state.contact.email || '--';
                if (state.contact.email) els.emailDisplay.setAttribute('href', 'mailto:' + state.contact.email);
            }
            if (state.contact && els.submittedDateDisplay) els.submittedDateDisplay.textContent = state.contact.createdAt ? formatDate(state.contact.createdAt) : '--';
            if (state.contact && els.updatedDateDisplay) els.updatedDateDisplay.textContent = state.contact.updatedAt ? formatDate(state.contact.updatedAt) : '--';
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'contacts.html'; });
        loadContact();
    };

    window.initWaitlistDetailPage = function () {
        var state = { loading: false, error: null, entry: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.waitlistDetail = document.getElementById('waitlistDetail');
            els.backBtn = document.getElementById('backBtn');
            els.businessNameDisplay = document.getElementById('businessNameDisplay');
            els.businessTypeDisplay = document.getElementById('businessTypeDisplay');
            els.stateOfOperationDisplay = document.getElementById('stateOfOperationDisplay');
            els.fullNameDisplay = document.getElementById('fullNameDisplay');
            els.emailDisplay = document.getElementById('emailDisplay');
            els.phoneDisplay = document.getElementById('phoneDisplay');
            els.appliedDateDisplay = document.getElementById('appliedDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.productCategoriesContainer = document.getElementById('productCategoriesContainer');
            els.productOriginDisplay = document.getElementById('productOriginDisplay');
            els.specialHandlingDisplay = document.getElementById('specialHandlingDisplay');
            els.specialHandlingIcon = document.getElementById('specialHandlingIcon');
            els.onlinePresenceDisplay = document.getElementById('onlinePresenceDisplay');
            els.onlinePlatformsDisplay = document.getElementById('onlinePlatformsDisplay');
            els.receiveNotificationDisplay = document.getElementById('receiveNotificationDisplay');
            els.messageCard = document.getElementById('messageCard');
            els.messageDisplay = document.getElementById('messageDisplay');
        }

        async function loadEntry() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Waitlist ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getWaitlistEntry(state.id);
                state.entry = response.data;
            } catch (err) {
                console.error('Failed to load waitlist entry:', err);
                state.error = 'Failed to load waitlist entry. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.waitlistDetail) els.waitlistDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.entry));
            if (state.entry) {
                if (els.businessNameDisplay) els.businessNameDisplay.textContent = state.entry.business_name || '--';
                if (els.businessTypeDisplay) els.businessTypeDisplay.textContent = state.entry.category || '--';
                if (els.stateOfOperationDisplay) els.stateOfOperationDisplay.textContent = state.entry.state || '--';
                if (els.fullNameDisplay) els.fullNameDisplay.textContent = state.entry.full_name || '--';
                if (els.emailDisplay) { els.emailDisplay.textContent = state.entry.email || '--'; if (state.entry.email) els.emailDisplay.setAttribute('href', 'mailto:' + state.entry.email); }
                if (els.phoneDisplay) els.phoneDisplay.textContent = state.entry.phone || '--';
                if (els.appliedDateDisplay) els.appliedDateDisplay.textContent = state.entry.created_at ? formatDate(state.entry.created_at) : '--';
                if (els.updatedDateDisplay) els.updatedDateDisplay.textContent = state.entry.updated_at ? formatDate(state.entry.updated_at) : '--';
                if (els.productCategoriesContainer) {
                    els.productCategoriesContainer.innerHTML = (state.entry.category ? '<span class="badge bg-light text-dark small">' + escapeHtml(state.entry.category) + '</span>' : '');
                }
                if (els.productOriginDisplay) els.productOriginDisplay.textContent = state.entry.product_origin || '--';
                if (els.specialHandlingDisplay) els.specialHandlingDisplay.textContent = state.entry.special_handling ? 'Yes' : '--';
                if (els.specialHandlingIcon) els.specialHandlingIcon.style.display = state.entry.special_handling ? '' : 'none';
                if (els.onlinePresenceDisplay) els.onlinePresenceDisplay.textContent = state.entry.online_presence ? 'Yes' : '--';
                if (els.onlinePlatformsDisplay) els.onlinePlatformsDisplay.textContent = state.entry.online_platforms || '--';
                if (els.receiveNotificationDisplay) els.receiveNotificationDisplay.textContent = state.entry.receive_notifications ? 'Yes' : '--';
                if (els.messageDisplay) {
                    if (state.entry.message) { els.messageCard.style.display = ''; els.messageDisplay.textContent = state.entry.message; } else { if (els.messageCard) els.messageCard.style.display = 'none'; }
                }
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'waitlist.html'; });
        loadEntry();
    };

    window.initVendorSignupDetailPage = function () {
        var state = { loading: false, error: null, signup: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.signupDetail = document.getElementById('signupDetail');
            els.backBtn = document.getElementById('backBtn');
            // Personal
            els.fullNameDisplay = document.getElementById('fullNameDisplay');
            els.emailDisplay = document.getElementById('emailDisplay');
            els.phoneDisplay = document.getElementById('phoneDisplay');
            els.vendorIdDisplay = document.getElementById('vendorIdDisplay');
            // Business
            els.businessNameDisplay = document.getElementById('businessNameDisplay');
            els.storeNameDisplay = document.getElementById('storeNameDisplay');
            els.businessCategoryDisplay = document.getElementById('businessCategoryDisplay');
            els.businessRegNumberDisplay = document.getElementById('businessRegNumberDisplay');
            els.taxIdNumberDisplay = document.getElementById('taxIdNumberDisplay');
            els.businessAddressDisplay = document.getElementById('businessAddressDisplay');
            // Account
            els.accountNameDisplay = document.getElementById('accountNameDisplay');
            els.bankNameDisplay = document.getElementById('bankNameDisplay');
            els.accountNumberDisplay = document.getElementById('accountNumberDisplay');
            // Documents / timeline
            els.idDocumentBtn = document.getElementById('idDocumentBtn');
            els.regCertificateBtn = document.getElementById('regCertificateBtn');
            els.createdAtDisplay = document.getElementById('createdAtDisplay');
            els.updatedAtDisplay = document.getElementById('updatedAtDisplay');
            els.approvedAtSection = document.getElementById('approvedAtSection');
            els.approvedAtDisplay = document.getElementById('approvedAtDisplay');
            els.suspendedAtSection = document.getElementById('suspendedAtSection');
            els.suspendedAtDisplay = document.getElementById('suspendedAtDisplay');
        }

        async function loadSignup() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Vendor signup ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getVendorSignup(state.id);
                state.signup = response.data;
            } catch (err) {
                console.error('Failed to load vendor signup:', err);
                state.error = 'Failed to load vendor signup. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.signupDetail) els.signupDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.signup));
            if (state.signup) {
                if (els.fullNameDisplay) els.fullNameDisplay.textContent = state.signup.fullName || '--';
                if (els.emailDisplay) els.emailDisplay.textContent = state.signup.emailAddress || '--';
                if (els.emailDisplay && state.signup.emailAddress) els.emailDisplay.setAttribute('href', 'mailto:' + state.signup.emailAddress);
                if (els.phoneDisplay) els.phoneDisplay.textContent = state.signup.phoneNumber || '--';
                if (els.vendorIdDisplay) els.vendorIdDisplay.textContent = state.signup.vendorId || state.signup.vendorId || '--';
                if (els.businessNameDisplay) els.businessNameDisplay.textContent = state.signup.businessName || '--';
                if (els.storeNameDisplay) els.storeNameDisplay.textContent = state.signup.storeName || '--';
                if (els.businessCategoryDisplay) els.businessCategoryDisplay.textContent = state.signup.businessCategoryName || state.signup.businessCategory || '--';
                if (els.businessRegNumberDisplay) els.businessRegNumberDisplay.textContent = state.signup.businessRegNumber || '--';
                if (els.taxIdNumberDisplay) els.taxIdNumberDisplay.textContent = state.signup.taxIdNumber || '--';
                if (els.businessAddressDisplay) els.businessAddressDisplay.textContent = state.signup.businessAddress || '--';
                if (els.accountNameDisplay) els.accountNameDisplay.textContent = state.signup.accountName || '--';
                if (els.bankNameDisplay) els.bankNameDisplay.textContent = state.signup.bankName || '--';
                if (els.accountNumberDisplay) els.accountNumberDisplay.textContent = state.signup.accountNumber || '--';
                if (els.createdAtDisplay) els.createdAtDisplay.textContent = state.signup.createdAt ? formatDate(state.signup.createdAt) : '--';
                if (els.updatedAtDisplay) els.updatedAtDisplay.textContent = state.signup.updatedAt ? formatDate(state.signup.updatedAt) : '--';
                if (state.signup.approvedAt && els.approvedAtSection) { els.approvedAtSection.style.display = ''; if (els.approvedAtDisplay) els.approvedAtDisplay.textContent = formatDate(state.signup.approvedAt); }
                else if (els.approvedAtSection) els.approvedAtSection.style.display = 'none';
                if (state.signup.suspendedAt && els.suspendedAtSection) { els.suspendedAtSection.style.display = ''; if (els.suspendedAtDisplay) els.suspendedAtDisplay.textContent = formatDate(state.signup.suspendedAt); }
                else if (els.suspendedAtSection) els.suspendedAtSection.style.display = 'none';
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'vendor-signups.html'; });
        loadSignup();
    };

    window.initBuyerSignupDetailPage = function () {
        var state = { loading: false, error: null, signup: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.signupDetail = document.getElementById('signupDetail');
            els.backBtn = document.getElementById('backBtn');
            els.createdAtDisplay = document.getElementById('createdAtDisplay');
            els.updatedAtDisplay = document.getElementById('updatedAtDisplay');
            // buyer personal
            els.fullNameDisplay = document.getElementById('fullNameDisplay');
            els.emailDisplay = document.getElementById('emailDisplay');
            els.phoneDisplay = document.getElementById('phoneDisplay');
            els.buyerIdDisplay = document.getElementById('buyerIdDisplay');
        }

        async function loadSignup() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Buyer signup ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getBuyerSignup(state.id);
                state.signup = response.data;
            } catch (err) {
                console.error('Failed to load buyer signup:', err);
                state.error = 'Failed to load buyer signup. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.signupDetail) els.signupDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.signup));
            if (state.signup) {
                if (els.fullNameDisplay) els.fullNameDisplay.textContent = state.signup.fullName || '--';
                if (els.emailDisplay) { els.emailDisplay.textContent = state.signup.emailAddress || '--'; if (state.signup.emailAddress) els.emailDisplay.setAttribute('href', 'mailto:' + state.signup.emailAddress); }
                if (els.phoneDisplay) els.phoneDisplay.textContent = state.signup.phoneNumber || '--';
                if (els.buyerIdDisplay) els.buyerIdDisplay.textContent = state.signup.buyerId || '--';
                if (els.createdAtDisplay) els.createdAtDisplay.textContent = state.signup.createdAt ? formatDate(state.signup.createdAt) : '--';
                if (els.updatedAtDisplay) els.updatedAtDisplay.textContent = state.signup.updatedAt ? formatDate(state.signup.updatedAt) : '--';
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'buyer-signups.html'; });
        loadSignup();
    };

    window.initBusinessCategoryDetailPage = function () {
        var state = { loading: false, error: null, category: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.categoryDetail = document.getElementById('categoryDetail');
            els.backBtn = document.getElementById('backBtn');
            els.categoryNameDisplay = document.getElementById('categoryNameDisplay');
            els.categoryIdDisplay = document.getElementById('categoryIdDisplay');
            els.categoryNameDisplaySmall = document.getElementById('categoryNameDisplaySmall');
            els.productCountDisplay = document.getElementById('productCountDisplay');
            els.createdDateDisplay = document.getElementById('createdDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.updatedDateSection = document.getElementById('updatedDateSection');
            els.displayForm = document.getElementById('displayForm');
            els.editForm = document.getElementById('editForm');
            els.categoryNameInput = document.getElementById('categoryNameInput');
            els.editBtn = document.getElementById('editBtn');
            els.deleteBtn = document.getElementById('deleteBtn');
            els.saveBtn = document.getElementById('saveBtn');
            els.cancelBtn = document.getElementById('cancelBtn');
        }

        async function loadCategory() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Category ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getBusinessCategory(state.id);
                state.category = response.data;
            } catch (err) {
                console.error('Failed to load business category:', err);
                state.error = 'Failed to load business category. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.categoryDetail) els.categoryDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.category));
            if (state.category) {
                if (els.categoryNameDisplay) els.categoryNameDisplay.textContent = state.category.categoryName || '--';
                if (els.categoryIdDisplay) els.categoryIdDisplay.textContent = state.category.categoryId || state.category.id || '--';
                if (els.categoryNameDisplaySmall) els.categoryNameDisplaySmall.textContent = state.category.categoryName || '--';
                if (els.productCountDisplay) els.productCountDisplay.textContent = state.category.associatedProducts || '--';
                if (els.createdDateDisplay) els.createdDateDisplay.textContent = state.category.createdAt ? formatDate(state.category.createdAt) : '--';
                if (els.updatedDateDisplay) {
                    if (state.category.updatedAt) { els.updatedDateDisplay.textContent = formatDate(state.category.updatedAt); els.updatedDateSection.classList.remove('d-none'); }
                    else { els.updatedDateSection.classList.add('d-none'); }
                }
                // Fill edit input default
                if (els.categoryNameInput) els.categoryNameInput.value = state.category.categoryName || '';
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'business-categories.html'; });
        loadCategory();
    };

    window.initProductCategoryDetailPage = function () {
        var state = { loading: false, error: null, category: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.categoryDetail = document.getElementById('categoryDetail');
            els.backBtn = document.getElementById('backBtn');
            els.categoryNameDisplay = document.getElementById('categoryNameDisplay');
            els.categoryNameDisplaySmall = document.getElementById('categoryNameDisplaySmall');
            els.productCountDisplay = document.getElementById('productCountDisplay');
            els.createdDateDisplay = document.getElementById('createdDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.updatedDateSection = document.getElementById('updatedDateSection');
        }

        async function loadCategory() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Category ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                console.debug('[debug] loading product category id=', state.id);
                var response = await window.api.getProductCategory(state.id);
                console.debug('[debug] getProductCategory response keys=', response && Object.keys(response || {}));
                state.category = response && response.data ? response.data : null;
            } catch (err) {
                console.error('Failed to load product category:', err);
                state.error = 'Failed to load product category. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.categoryDetail) els.categoryDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.category));
            if (state.category) {
                if (els.categoryNameDisplay) els.categoryNameDisplay.textContent = state.category.categoryName || '--';
                if (els.categoryNameDisplaySmall) els.categoryNameDisplaySmall.textContent = state.category.categoryName || '--';
                if (els.productCountDisplay) els.productCountDisplay.textContent = state.category.associatedProducts || state.category.productCount || '--';
                if (els.createdDateDisplay) els.createdDateDisplay.textContent = state.category.createdAt ? formatDate(state.category.createdAt) : '--';
                if (els.updatedDateDisplay) {
                    if (state.category.updatedAt) { els.updatedDateDisplay.textContent = formatDate(state.category.updatedAt); if (els.updatedDateSection) els.updatedDateSection.classList.remove('d-none'); }
                    else if (els.updatedDateSection) els.updatedDateSection.classList.add('d-none');
                }
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'product-categories.html'; });
        loadCategory();
    };

    window.initBuyerMessageDetailPage = function () {
        var state = { loading: false, error: null, message: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.messageDetail = document.getElementById('messageDetail');
            els.subjectDisplay = document.getElementById('subjectDisplay');
            els.messagesContainer = document.getElementById('messagesContainer');
            els.singleMessageDisplay = document.getElementById('singleMessageDisplay');
            els.senderNameDisplay = document.getElementById('senderNameDisplay');
            els.senderEmailDisplay = document.getElementById('senderEmailDisplay');
            els.senderPhoneDisplay = document.getElementById('senderPhoneDisplay');
            els.submittedDateDisplay = document.getElementById('submittedDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.backBtn = document.getElementById('backBtn');
        }

        async function loadMessage() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Message ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getTicket(state.id);
                state.message = response && response.data ? response.data : null;
                // also fetch ticket messages to populate sender info and message body
                try {
                    var msgsResp = await window.api.getTicketMessages(state.id);
                    state.messages = msgsResp && (msgsResp.messages || msgsResp.data) ? (msgsResp.messages || msgsResp.data) : [];
                } catch (e) {
                    state.messages = [];
                }
            } catch (err) {
                console.error('Failed to load message:', err);
                state.error = 'Failed to load message. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.messageDetail) els.messageDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.message));

            // populate fields when message is available
            if (state.message) {
                if (els.subjectDisplay) els.subjectDisplay.textContent = state.message.subject || '--';
                if (els.submittedDateDisplay) els.submittedDateDisplay.textContent = state.message.createdAt ? formatDate(state.message.createdAt) : '--';
                if (els.updatedDateDisplay) els.updatedDateDisplay.textContent = state.message.updatedAt ? formatDate(state.message.updatedAt) : '--';
            }
            // populate sender and messages from fetched ticket messages
            if (els.senderNameDisplay) {
                var sender = (state.messages && state.messages[0] && state.messages[0].senderInfo) ? state.messages[0].senderInfo : null;
                if (sender) {
                    if (els.senderNameDisplay) els.senderNameDisplay.textContent = sender.name || '--';
                    if (els.senderEmailDisplay) { els.senderEmailDisplay.textContent = sender.email || '--'; if (sender.email) els.senderEmailDisplay.setAttribute('href', 'mailto:' + sender.email); }
                    if (els.senderPhoneDisplay) els.senderPhoneDisplay.textContent = sender.phone || '--';
                }
            }
            if (els.singleMessageDisplay) {
                if (state.messages && state.messages.length > 0) {
                    // show first message
                    els.singleMessageDisplay.textContent = state.messages[0].message || '--';
                } else if (state.message && state.message.message) {
                    els.singleMessageDisplay.textContent = state.message.message || '--';
                } else {
                    els.singleMessageDisplay.textContent = '--';
                }
            }
            if (els.messagesContainer) {
                // if multiple messages, render the thread; otherwise hide the thread container
                if (state.messages && state.messages.length > 1) {
                    els.messagesContainer.style.display = 'block';
                    els.messagesContainer.innerHTML = '';
                    state.messages.forEach(function (m) {
                        var p = document.createElement('div');
                        p.className = 'mb-3';
                        var who = (m.senderInfo && m.senderInfo.name) ? m.senderInfo.name : (m.senderType || 'User');
                        p.innerHTML = '<div class="small text-muted">' + escapeHtml(who) + ' • ' + formatDate(m.createdAt) + '</div><div style="white-space:pre-wrap;">' + escapeHtml(m.message || '') + '</div>';
                        els.messagesContainer.appendChild(p);
                    });
                } else {
                    els.messagesContainer.style.display = 'none';
                }
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'buyer-messages.html'; });
        loadMessage();
    };

    window.initVendorMessageDetailPage = function () {
        var state = { loading: false, error: null, message: null, id: null };
        var els = {};

        function cacheElements() {
            els.loadingState = document.getElementById('loadingState');
            els.errorState = document.getElementById('errorState');
            els.errorMessage = document.getElementById('errorMessage');
            els.messageDetail = document.getElementById('messageDetail');
            els.subjectDisplay = document.getElementById('subjectDisplay');
            els.messagesContainer = document.getElementById('messagesContainer');
            els.singleMessageDisplay = document.getElementById('singleMessageDisplay');
            els.senderNameDisplay = document.getElementById('senderNameDisplay');
            els.senderEmailDisplay = document.getElementById('senderEmailDisplay');
            els.senderPhoneDisplay = document.getElementById('senderPhoneDisplay');
            els.submittedDateDisplay = document.getElementById('submittedDateDisplay');
            els.updatedDateDisplay = document.getElementById('updatedDateDisplay');
            els.backBtn = document.getElementById('backBtn');
        }

        async function loadMessage() {
            var params = new URLSearchParams(window.location.search);
            state.id = params.get('id');
            if (!state.id) { state.error = 'Message ID is required'; render(); return; }
            state.loading = true; state.error = null; render();
            try {
                var response = await window.api.getTicket(state.id);
                state.message = response && response.data ? response.data : null;
                try {
                    var msgsResp = await window.api.getTicketMessages(state.id);
                    state.messages = msgsResp && (msgsResp.messages || msgsResp.data) ? (msgsResp.messages || msgsResp.data) : [];
                } catch (e) {
                    state.messages = [];
                }
            } catch (err) {
                console.error('Failed to load message:', err);
                state.error = 'Failed to load message. Please try again.';
            } finally { state.loading = false; render(); }
        }

        function render() {
            if (els.loadingState) els.loadingState.classList.toggle('d-none', !state.loading);
            if (els.errorState) {
                if (state.error) { if (els.errorMessage) els.errorMessage.textContent = state.error; els.errorState.classList.remove('d-none'); }
                else { els.errorState.classList.add('d-none'); }
            }
            if (els.messageDetail) els.messageDetail.classList.toggle('d-none', !(!state.loading && !state.error && state.message));

            if (state.message) {
                if (els.subjectDisplay) els.subjectDisplay.textContent = state.message.subject || '--';
                if (els.submittedDateDisplay) els.submittedDateDisplay.textContent = state.message.createdAt ? formatDate(state.message.createdAt) : '--';
                if (els.updatedDateDisplay) els.updatedDateDisplay.textContent = state.message.updatedAt ? formatDate(state.message.updatedAt) : '--';
            }

            if (els.senderNameDisplay) {
                var sender = (state.messages && state.messages[0] && state.messages[0].senderInfo) ? state.messages[0].senderInfo : null;
                if (sender) {
                    if (els.senderNameDisplay) els.senderNameDisplay.textContent = sender.name || '--';
                    if (els.senderEmailDisplay) { els.senderEmailDisplay.textContent = sender.email || '--'; if (sender.email) els.senderEmailDisplay.setAttribute('href', 'mailto:' + sender.email); }
                    if (els.senderPhoneDisplay) els.senderPhoneDisplay.textContent = sender.phone || '--';
                }
            }
            if (els.singleMessageDisplay) {
                if (state.messages && state.messages.length > 0) {
                    els.singleMessageDisplay.textContent = state.messages[0].message || '--';
                } else if (state.message && state.message.message) {
                    els.singleMessageDisplay.textContent = state.message.message || '--';
                } else {
                    els.singleMessageDisplay.textContent = '--';
                }
            }
            if (els.messagesContainer) {
                if (state.messages && state.messages.length > 1) {
                    els.messagesContainer.style.display = 'block';
                    els.messagesContainer.innerHTML = '';
                    state.messages.forEach(function (m) {
                        var p = document.createElement('div');
                        p.className = 'mb-3';
                        var who = (m.senderInfo && m.senderInfo.name) ? m.senderInfo.name : (m.senderType || 'User');
                        p.innerHTML = '<div class="small text-muted">' + escapeHtml(who) + ' • ' + formatDate(m.createdAt) + '</div><div style="white-space:pre-wrap;">' + escapeHtml(m.message || '') + '</div>';
                        els.messagesContainer.appendChild(p);
                    });
                } else {
                    els.messagesContainer.style.display = 'none';
                }
            }
        }

        cacheElements();
        if (els.backBtn) els.backBtn.addEventListener('click', function () { window.location.href = 'vendor-messages.html'; });
        loadMessage();
    };

    // === PAGE ROUTER ===
    var pageHandlers = {
        'overview': function () { window.initOverviewPage(); },
        'orders': function () { window.initOrdersPage(); },
        'waitlist': function () { window.initWaitlistPage(); },
        'contacts': function () { window.initContactsPage(); },
        'vendor-signups': function () { window.initVendorSignupsPage(); },
        'buyer-signups': function () { window.initBuyerSignupsPage(); },
        'business-categories': function () { window.initBusinessCategoriesPage(); },
        'product-categories': function () { window.initProductCategoriesPage(); },
        'buyer-messages': function () { window.initBuyerMessagesPage(); },
        'vendor-messages': function () { window.initVendorMessagesPage(); },
        'commission-change': function () { window.initCommissionChangePage(); },
        'contact-detail': function () { window.initContactDetailPage(); },
        'waitlist-detail': function () { window.initWaitlistDetailPage(); },
        'vendor-signup-detail': function () { window.initVendorSignupDetailPage(); },
        'buyer-signup-detail': function () { window.initBuyerSignupDetailPage(); },
        'business-category-detail': function () { window.initBusinessCategoryDetailPage(); },
        'business-category-create': function () { window.initBusinessCategoryCreatePage(); },
        'product-category-detail': function () { window.initProductCategoryDetailPage(); },
        'product-category-create': function () { window.initProductCategoryCreatePage(); },
        'buyer-message-detail': function () { window.initBuyerMessageDetailPage(); },
        'vendor-message-detail': function () { window.initVendorMessageDetailPage(); }
    };

    // === INITIALIZATION ===
    function initDropdowns() {
        if (typeof bootstrap === 'undefined' || !bootstrap.Dropdown) return;
        document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function (el) {
            try { bootstrap.Dropdown.getOrCreateInstance(el); } catch (e) { }
        });
    }

    function initApp() {
        initSidebar();
        initDropdowns();
        initThemeToggle();

        var route = document.body.getAttribute('data-route');
        if (route && pageHandlers[route]) {
            pageHandlers[route]();
        } else if (document.getElementById('loginForm')) {
            initLogin();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
