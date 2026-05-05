// AdminHub Dashboard - Bootstrap Version
// Main Application JavaScript - Matches React version functionality

(function() {
    'use strict';

    // Initialize sidebar toggle
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarCollapse = document.getElementById('sidebarCollapse');

        if (!sidebar) return;

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                if (mainContent) mainContent.classList.toggle('expanded');
            });
        }

        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', function() {
                sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.classList.remove('expanded');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                const inSidebar = sidebar.contains(e.target);
                const inToggle = sidebarToggle && sidebarToggle.contains(e.target);
                if (!inSidebar && !inToggle) {
                    sidebar.classList.remove('collapsed');
                    if (mainContent) mainContent.classList.remove('expanded');
                }
            }
        });
    }

    // Initialize theme switcher (multi-theme + dark mode)
    var THEME_NAMES = ['forest', 'ocean', 'sunset', 'midnight', 'minimal'];

    function applyColorTheme(name) {
        if (THEME_NAMES.indexOf(name) === -1) name = 'forest';
        THEME_NAMES.forEach(function(t) {
            document.body.classList.remove('theme-' + t);
        });
        document.body.classList.add('theme-' + name);
        // Mark active option
        document.querySelectorAll('.theme-option').forEach(function(el) {
            const isActive = el.getAttribute('data-theme') === name;
            el.classList.toggle('active', isActive);
            const check = el.querySelector('.bi-check2');
            if (check) check.classList.toggle('d-none', !isActive);
        });
    }

    function initThemeToggle() {
        const savedTheme = localStorage.getItem('color-theme') || 'forest';
        applyColorTheme(savedTheme);

        document.querySelectorAll('.theme-option').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                const name = this.getAttribute('data-theme');
                applyColorTheme(name);
                localStorage.setItem('color-theme', name);
            });
        });
    }

    // Initialize login page
    function initLogin() {
        const loginForm = document.getElementById('loginForm');
        const togglePasswordBtns = document.querySelectorAll('.toggle-password');

        // Password visibility toggle
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        });

        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const emailInput = loginForm.querySelector('input[type="email"]');
                const passwordInput = loginForm.querySelector('input[type="password"]');
                const email = emailInput ? emailInput.value : '';
                const password = passwordInput ? passwordInput.value : '';
                const submitBtn = this.querySelector('button[type="submit"]');
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Signing in...';

                try {
                    await new Promise(function(resolve) { setTimeout(resolve, 500); });
                    localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    alert('Login failed. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Sign In';
                }
            });
        }
    }

    // Render contacts page
    async function initContacts() {
        initSidebar();
        
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const contactsList = document.getElementById('contactsList');
        const contactsContainer = document.getElementById('contactsContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationControls = document.getElementById('paginationControls');
        const totalContacts = document.getElementById('totalContacts');
        const exportBtn = document.getElementById('exportBtn');

        let currentPage = 1;
        const perPage = 5;

        async function loadContacts(page = 1) {
            loadingState.classList.remove('d-none');
            errorState.classList.add('d-none');
            emptyState.classList.add('d-none');
            contactsList.classList.add('d-none');

            try {
                await mockData.simulateDelay({}, 300);
                const result = mockData.paginate(mockData.contacts, page, perPage);
                
                if (result.data.length === 0) {
                    loadingState.classList.add('d-none');
                    emptyState.classList.remove('d-none');
                    return;
                }

                contactsContainer.innerHTML = result.data.map(contact => `
                    <div class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div class="flex-1">
                                <div class="d-flex align-items-center gap-3">
                                    <div>
                                        <h6 class="mb-1">${contact.fullName}</h6>
                                        <p class="mb-1 text-muted small">${contact.email}</p>
                                        <p class="mb-0 small text-muted d-none d-md-block">${contact.subject} - ${contact.message.substring(0, 80)}...</p>
                                    </div>
                                </div>
                            </div>
                            <div class="text-end">
                                <p class="mb-0 small text-muted">${mockData.formatDate(contact.createdAt)}</p>
                                <a href="contact-detail.html?id=${contact.id}" class="btn btn-outline-primary btn-sm mt-1">
                                    <i class="bi bi-eye"></i> View
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');

                totalContacts.textContent = `${result.pagination.totalItems} total contacts`;
                paginationInfo.textContent = `Page ${result.pagination.currentPage} of ${result.pagination.totalPages} (${result.pagination.totalItems} total)`;
                
                paginationControls.innerHTML = `
                    <button class="btn btn-outline-secondary btn-sm" ${page === 1 ? 'disabled' : ''} onclick="loadContacts(${page - 1})">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" ${page === result.pagination.totalPages ? 'disabled' : ''} onclick="loadContacts(${page + 1})">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                `;

                loadingState.classList.add('d-none');
                contactsList.classList.remove('d-none');
            } catch (error) {
                loadingState.classList.add('d-none');
                errorState.classList.remove('d-none');
                document.getElementById('errorMessage').textContent = 'Failed to load contacts';
            }
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', async function() {
                this.disabled = true;
                this.innerHTML = '<i class="bi bi-download"></i> Exporting...';
                try {
                    await mockData.simulateDelay({}, 500);
                    const csv = convertContactsToCSV(mockData.contacts);
                    downloadCSV(csv, 'contacts.csv');
                } finally {
                    this.disabled = false;
                    this.innerHTML = '<i class="bi bi-download"></i> Export CSV';
                }
            });
        }

        window.loadContacts = loadContacts;
        loadContacts(currentPage);
    }

    // Render waitlist page
    async function initWaitlist() {
        initSidebar();
        
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const waitlistList = document.getElementById('waitlistList');
        const waitlistContainer = document.getElementById('waitlistContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationControls = document.getElementById('paginationControls');
        const totalWaitlist = document.getElementById('totalWaitlist');
        const exportBtn = document.getElementById('exportBtn');

        let currentPage = 1;
        const perPage = 10;

        async function loadWaitlist(page = 1) {
            loadingState.classList.remove('d-none');
            errorState.classList.add('d-none');
            emptyState.classList.add('d-none');
            waitlistList.classList.add('d-none');

            try {
                await mockData.simulateDelay({}, 300);
                const result = mockData.paginate(mockData.waitlist, page, perPage);
                
                if (result.data.length === 0) {
                    loadingState.classList.add('d-none');
                    emptyState.classList.remove('d-none');
                    return;
                }

                waitlistContainer.innerHTML = result.data.map(entry => `
                    <tr>
                        <td><strong>${entry.business_name}</strong></td>
                        <td>
                            <div>${entry.full_name}</div>
                            <small class="text-muted">${entry.email}</small>
                        </td>
                        <td><span class="badge bg-light text-dark">${entry.category}</span></td>
                        <td>${entry.state}</td>
                        <td><span class="badge ${mockData.getStatusBadgeClass(entry.status)}">${entry.status}</span></td>
                        <td>${mockData.formatDate(entry.created_at)}</td>
                        <td>
                            <a href="waitlist-detail.html?id=${entry.id}" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-eye"></i> View
                            </a>
                        </td>
                    </tr>
                `).join('');

                totalWaitlist.textContent = `${result.pagination.totalItems} total entries`;
                paginationInfo.textContent = `Page ${result.pagination.currentPage} of ${result.pagination.totalPages} (${result.pagination.totalItems} total)`;
                
                paginationControls.innerHTML = `
                    <button class="btn btn-outline-secondary btn-sm" ${page === 1 ? 'disabled' : ''} onclick="loadWaitlist(${page - 1})">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" ${page === result.pagination.totalPages ? 'disabled' : ''} onclick="loadWaitlist(${page + 1})">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                `;

                loadingState.classList.add('d-none');
                waitlistList.classList.remove('d-none');
            } catch (error) {
                loadingState.classList.add('d-none');
                errorState.classList.remove('d-none');
                document.getElementById('errorMessage').textContent = 'Failed to load waitlist';
            }
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', async function() {
                this.disabled = true;
                this.innerHTML = '<i class="bi bi-download"></i> Exporting...';
                try {
                    await mockData.simulateDelay({}, 500);
                    const csv = convertWaitlistToCSV(mockData.waitlist);
                    downloadCSV(csv, 'waitlist.csv');
                } finally {
                    this.disabled = false;
                    this.innerHTML = '<i class="bi bi-download"></i> Export CSV';
                }
            });
        }

        window.loadWaitlist = loadWaitlist;
        loadWaitlist(currentPage);
    }

    // Initialize dashboard
    async function initDashboard() {
        initSidebar();
        
        try {
            await mockData.simulateDelay({}, 300);
            const stats = mockData.overviewStats;
            
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length >= 4) {
                statCards[0].querySelector('.stat-value').textContent = stats.totalVendors.toLocaleString();
                statCards[1].querySelector('.stat-value').textContent = stats.completedOrders.toLocaleString();
                statCards[2].querySelector('.stat-value').textContent = stats.adminMessagesCount.toLocaleString();
                statCards[3].querySelector('.stat-value').textContent = stats.buyerMessagesCount.toLocaleString();
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    // Helper: Convert contacts to CSV
    function convertContactsToCSV(contacts) {
        const headers = ['ID', 'Full Name', 'Email', 'Subject', 'Message', 'Created At'];
        const rows = contacts.map(c => [
            c.id, c.fullName, c.email, c.subject, `"${c.message.replace(/"/g, '""')}"`, c.createdAt
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Helper: Convert waitlist to CSV
    function convertWaitlistToCSV(waitlist) {
        const headers = ['ID', 'Business Name', 'Full Name', 'Email', 'Phone', 'Category', 'State', 'Status', 'Created At'];
        const rows = waitlist.map(w => [
            w.id, w.business_name, w.full_name, w.email, w.phone, w.category, w.state, w.status, w.created_at
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Helper: Download CSV
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Expose functions globally
    window.initSidebar = initSidebar;
    window.initLogin = initLogin;
    window.initContacts = initContacts;
    window.initWaitlist = initWaitlist;
    window.initDashboard = initDashboard;
    window.downloadCSV = downloadCSV;
    window.initThemeToggle = initThemeToggle;

    // Explicitly initialize all Bootstrap dropdowns (defensive)
    function initDropdowns() {
        if (typeof bootstrap === 'undefined' || !bootstrap.Dropdown) return;
        document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function(el) {
            try { bootstrap.Dropdown.getOrCreateInstance(el); } catch (e) {}
        });
    }

    // Auto-initialize based on page
    document.addEventListener('DOMContentLoaded', function() {
        initSidebar();
        initDropdowns();
        initThemeToggle();
        
        if (document.getElementById('loginForm')) {
            initLogin();
        }
        
        if (document.getElementById('contactsContainer')) {
            initContacts();
        }
        
        if (document.getElementById('waitlistContainer')) {
            initWaitlist();
        }
        
        if (document.querySelector('.stat-card')) {
            initDashboard();
        }
    });

})();
