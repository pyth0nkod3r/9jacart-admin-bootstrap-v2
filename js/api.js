/*
 * window.api — Bootstrap-side mirror of `apiService` from
 *   react-version/9jacart-admin-react-v2/src/services/api.ts
 *
 * Method names, signatures, and response shapes match the React class so
 * page scripts can be ported with minimal changes. All data comes from
 * window.mockData (mock-data.js); create/update/delete mutate the same
 * arrays in place to mirror the React behaviour during a session.
 *
 * Auth methods (login/logout/isAuthenticated) delegate to window.auth so
 * there is exactly one source of truth for the JWT lifecycle.
 *
 * Response envelope (mirror api.ts ApiResponse / PaginatedApiResponse):
 *   { status, error, message, data, pagination?: {...} }
 */
(function () {
    'use strict';

    if (!window.mockData) {
        throw new Error('api.js requires mock-data.js to be loaded first');
    }
    if (!window.APP_CONFIG) {
        throw new Error('api.js requires config.js to be loaded first');
    }

    var DELAY_MIN = window.APP_CONFIG.API.SIMULATED_DELAY_MIN_MS;
    var DELAY_MAX = window.APP_CONFIG.API.SIMULATED_DELAY_MAX_MS;
    var DEFAULT_PAGE_SIZE = window.APP_CONFIG.API.DEFAULT_PAGE_SIZE;

    var data = window.mockData;
    var paginate = data.paginate;

    // ---- Helpers ------------------------------------------------------------
    function delay(ms) {
        var d;
        if (typeof ms === 'number') {
            d = ms;
        } else {
            d = DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1));
        }
        return new Promise(function (resolve) { setTimeout(resolve, d); });
    }

    function ok(body) {
        return Object.assign(
            { status: 200, error: false, message: 'Success' },
            body || {}
        );
    }

    function todayDate() {
        return new Date().toISOString().split('T')[0];
    }

    // ---- Auth (delegate to window.auth) ------------------------------------
    function login(credentials) {
        var email = credentials && credentials.email ? credentials.email : '';
        var password = credentials && credentials.password ? credentials.password : '';
        return window.auth.login(email, password);
    }

    function logout() {
        return window.auth.logout();
    }

    function isAuthenticated() {
        return window.auth.isAuthenticated();
    }

    // ---- Contacts -----------------------------------------------------------
    async function getContacts(page, perPage) {
        await delay();
        var result = paginate(data.contacts, page || 1, perPage || DEFAULT_PAGE_SIZE);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getContact(id) {
        await delay();
        var contact = data.contacts.find(function (c) { return c.id === id; });
        if (!contact) throw new Error('Contact not found');
        return ok({ data: contact });
    }

    async function getAllContacts() {
        await delay();
        var result = paginate(data.contacts, 1, 10000);
        return ok({ data: result.data, pagination: result.pagination });
    }

    // ---- Waitlist -----------------------------------------------------------
    async function getWaitlist(page, perPage) {
        await delay();
        var result = paginate(data.waitlist, page || 1, perPage || DEFAULT_PAGE_SIZE);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getWaitlistEntry(id) {
        await delay();
        var entry = data.waitlist.find(function (w) { return w.id === id; });
        if (!entry) throw new Error('Waitlist entry not found');
        return ok({ data: entry });
    }

    async function getAllWaitlist() {
        await delay();
        var result = paginate(data.waitlist, 1, 10000);
        return ok({ data: result.data, pagination: result.pagination });
    }

    // ---- Vendor Signups -----------------------------------------------------
    async function getVendorSignups(page, perPage) {
        await delay();
        var result = paginate(data.vendorSignups, page || 1, perPage || DEFAULT_PAGE_SIZE);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getVendorSignup(id) {
        await delay();
        var s = data.vendorSignups.find(function (v) {
            return v.vendorId === id || v.id === id;
        });
        if (!s) throw new Error('Vendor signup not found');
        return ok({ data: s });
    }

    async function getAllVendorSignups() {
        await delay();
        var result = paginate(data.vendorSignups, 1, 10000);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function toggleVendorStatus(_id) {
        await delay();
        return ok({ message: 'Status toggled successfully' });
    }

    async function approveVendor(_id) {
        await delay();
        return ok({ message: 'Vendor approved successfully' });
    }

    async function suspendVendor(_id, _payload) {
        await delay();
        return ok({ message: 'Vendor suspended successfully' });
    }

    async function reinstateVendor(_id, _payload) {
        await delay();
        return ok({ message: 'Vendor reinstated successfully' });
    }

    // ---- Buyer Signups ------------------------------------------------------
    async function getBuyerSignups(page, perPage) {
        await delay();
        var result = paginate(data.buyerSignups, page || 1, perPage || DEFAULT_PAGE_SIZE);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getBuyerSignup(id) {
        await delay();
        var s = data.buyerSignups.find(function (b) {
            return b.buyerId === id || b.id === id;
        });
        if (!s) throw new Error('Buyer signup not found');
        return ok({ data: s });
    }

    async function getAllBuyerSignups() {
        await delay();
        var result = paginate(data.buyerSignups, 1, 10000);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function toggleBuyerStatus(_id) {
        await delay();
        return ok({ message: 'Buyer status toggled successfully' });
    }

    // ---- Orders -------------------------------------------------------------
    async function getOrders(query) {
        await delay();
        var q = query || {};
        var filtered = data.orders.slice();

        if (q.status) {
            var status = String(q.status).toLowerCase();
            filtered = filtered.filter(function (o) {
                return String(o.status).toLowerCase() === status;
            });
        }
        if (q.paymentMethod) {
            filtered = filtered.filter(function (o) { return o.paymentMethod === q.paymentMethod; });
        }
        if (q.customerName) {
            var nameQ = String(q.customerName).toLowerCase();
            filtered = filtered.filter(function (o) {
                return (o.customerName || '').toLowerCase().indexOf(nameQ) !== -1;
            });
        }
        if (q.orderNo) {
            var noQ = String(q.orderNo).toLowerCase();
            filtered = filtered.filter(function (o) {
                return (o.orderNo || '').toLowerCase().indexOf(noQ) !== -1;
            });
        }
        if (q.startDate) {
            var start = new Date(q.startDate).getTime();
            if (!isNaN(start)) {
                filtered = filtered.filter(function (o) {
                    var t = new Date(o.createdAt).getTime();
                    return !isNaN(t) && t >= start;
                });
            }
        }
        if (q.endDate) {
            // Include the whole end-date day (add 24h).
            var end = new Date(q.endDate).getTime();
            if (!isNaN(end)) {
                end += 24 * 60 * 60 * 1000 - 1;
                filtered = filtered.filter(function (o) {
                    var t = new Date(o.createdAt).getTime();
                    return !isNaN(t) && t <= end;
                });
            }
        }
        if (q.sortBy === 'oldest') {
            filtered.sort(function (a, b) {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
        } else {
            // Default: recent first.
            filtered.sort(function (a, b) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }

        var page = q.page || 1;
        var perPage = q.perPage || DEFAULT_PAGE_SIZE;
        var result = paginate(filtered, page, perPage);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getOrdersSummary() {
        await delay();
        var orders = data.orders;
        var summary = {
            totalOrders: orders.length,
            deliveredOrders: orders.filter(function (o) { return o.status === 'delivered'; }).length,
            // api.ts uses cancelled count for both returned + cancelled — mirror exactly.
            returnedOrders: orders.filter(function (o) { return o.status === 'cancelled'; }).length,
            cancelledOrders: orders.filter(function (o) { return o.status === 'cancelled'; }).length,
            pendingOrders: orders.filter(function (o) { return o.status === 'pending'; }).length
        };
        return ok({ data: summary });
    }

    async function updateOrderStatus(_id, status) {
        await delay();
        return ok({ message: 'Order status updated to ' + status });
    }

    async function getOrderItems(_orderNo) {
        await delay();
        // Static sample items (mirror api.ts:295-315).
        return {
            items: [
                {
                    productId: 'prod-1',
                    productName: 'Sample Product',
                    quantity: 2,
                    price: 5000,
                    productImages: [
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
                    ]
                },
                {
                    productId: 'prod-2',
                    productName: 'Premium Item',
                    quantity: 1,
                    price: 15000,
                    productImages: [
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
                    ]
                }
            ]
        };
    }

    // ---- Business Categories -----------------------------------------------
    async function getBusinessCategories() {
        await delay();
        return ok({ data: data.businessCategories });
    }

    async function getBusinessCategory(id) {
        await delay();
        var c = data.businessCategories.find(function (x) { return x.id === id; });
        if (!c) throw new Error('Category not found');
        return ok({ data: c });
    }

    async function createBusinessCategory(payload) {
        await delay();
        var newCategory = {
            id: String(Date.now()),
            categoryName: payload.categoryName,
            associatedBusinesses: '0',
            createdAt: todayDate(),
            updatedAt: todayDate()
        };
        data.businessCategories.push(newCategory);
        return ok({ data: newCategory });
    }

    async function updateBusinessCategory(id, payload) {
        await delay();
        var idx = data.businessCategories.findIndex(function (x) { return x.id === id; });
        if (idx === -1) throw new Error('Category not found');
        data.businessCategories[idx] = Object.assign(
            {}, data.businessCategories[idx],
            { categoryName: payload.categoryName, updatedAt: todayDate() }
        );
        return ok({ data: data.businessCategories[idx] });
    }

    async function deleteBusinessCategory(id) {
        await delay();
        var idx = data.businessCategories.findIndex(function (x) { return x.id === id; });
        if (idx === -1) throw new Error('Category not found');
        data.businessCategories.splice(idx, 1);
        return ok({ message: 'Category deleted successfully' });
    }

    // ---- Product Categories ------------------------------------------------
    async function getProductCategories(page, perPage) {
        await delay();
        var result = paginate(data.productCategories, page || 1, perPage || DEFAULT_PAGE_SIZE);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getAllProductCategories() {
        await delay();
        var result = paginate(data.productCategories, 1, 10000);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function createProductCategory(payload) {
        await delay();
        var newCategory = {
            categoryId: String(Date.now()),
            categoryName: payload.categoryName,
            associatedProducts: '0',
            createdAt: todayDate(),
            updatedAt: todayDate()
        };
        data.productCategories.push(newCategory);
        return ok({ data: newCategory });
    }

    async function updateProductCategory(id, payload) {
        await delay();
        var idx = data.productCategories.findIndex(function (x) { return x.categoryId === id; });
        if (idx === -1) throw new Error('Category not found');
        data.productCategories[idx] = Object.assign(
            {}, data.productCategories[idx],
            { categoryName: payload.categoryName, updatedAt: todayDate() }
        );
        return ok({ data: data.productCategories[idx] });
    }

    async function deleteProductCategory(id) {
        await delay();
        var idx = data.productCategories.findIndex(function (x) { return x.categoryId === id; });
        if (idx === -1) throw new Error('Category not found');
        data.productCategories.splice(idx, 1);
        return ok({ message: 'Category deleted successfully' });
    }

    // ---- Commission ---------------------------------------------------------
    // Stored on window.mockData.commission so updates persist across calls.
    if (typeof data.commission !== 'object' || data.commission === null) {
        data.commission = { commissionRate: 5.0 };
    }

    async function getCommission() {
        await delay();
        return ok({ data: { commissionRate: data.commission.commissionRate } });
    }

    async function updateCommission(payload) {
        await delay();
        if (payload && typeof payload.commissionRate === 'number') {
            data.commission.commissionRate = payload.commissionRate;
        }
        return ok({ message: 'Commission rate updated successfully' });
    }

    // ---- Tickets ------------------------------------------------------------
    async function getTickets(page, perPage, search) {
        await delay();
        var filtered = data.tickets.slice();
        if (search) {
            var q = String(search).toLowerCase();
            filtered = filtered.filter(function (t) {
                return (t.subject || '').toLowerCase().indexOf(q) !== -1;
            });
        }
        var result = paginate(filtered, page || 1, perPage || 10);
        return ok({ data: result.data, pagination: result.pagination });
    }

    async function getTicketMessages(ticketId) {
        await delay();
        return {
            messages: [
                {
                    messageId: 'msg-1',
                    ticketId: ticketId,
                    message: 'Initial ticket message',
                    messageType: 'TEXT',
                    senderType: 'BUYER',
                    senderId: 'user-1',
                    senderInfo: {
                        id: 'user-1', name: 'John Doe',
                        email: 'john@example.com', type: 'BUYER'
                    },
                    isOwnMessage: false,
                    isRead: true,
                    createdAt: new Date().toISOString()
                },
                {
                    messageId: 'msg-2',
                    ticketId: ticketId,
                    message: 'Support response',
                    messageType: 'TEXT',
                    senderType: 'ADMIN',
                    senderId: 'admin-1',
                    senderInfo: {
                        id: 'admin-1', name: 'Admin',
                        email: 'admin@adminhub.com', type: 'ADMIN'
                    },
                    isOwnMessage: true,
                    isRead: true,
                    createdAt: new Date().toISOString()
                }
            ]
        };
    }

    async function replyToTicket(_ticketId, _message) {
        await delay();
        return ok({ message: 'Reply sent successfully' });
    }

    // ---- Notifications ------------------------------------------------------
    async function getNotifications(options) {
        await delay();
        var page = (options && options.page) || 1;
        var perPage = (options && options.perPage) || 10;
        var result = paginate(data.notifications, page, perPage);
        return {
            status: 200,
            error: false,
            message: 'Success',
            notifications: result.data,
            unreadCount: data.notifications.filter(function (n) { return n.isRead === '0'; }).length,
            pagination: result.pagination
        };
    }

    async function markNotificationAsRead(notificationId) {
        await delay();
        var n = data.notifications.find(function (x) { return x.notificationId === notificationId; });
        if (n) {
            n.isRead = '1';
            n.readAt = new Date().toISOString();
        }
        return ok({ message: 'Notification marked as read' });
    }

    // ---- Overview -----------------------------------------------------------
    async function getOverviewStats() {
        await delay();
        return ok({ data: data.overviewStats });
    }

    // ---- Expose -------------------------------------------------------------
    window.api = {
        // Auth
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
        // Contacts
        getContacts: getContacts,
        getContact: getContact,
        getAllContacts: getAllContacts,
        // Waitlist
        getWaitlist: getWaitlist,
        getWaitlistEntry: getWaitlistEntry,
        getAllWaitlist: getAllWaitlist,
        // Vendor signups
        getVendorSignups: getVendorSignups,
        getVendorSignup: getVendorSignup,
        getAllVendorSignups: getAllVendorSignups,
        toggleVendorStatus: toggleVendorStatus,
        approveVendor: approveVendor,
        suspendVendor: suspendVendor,
        reinstateVendor: reinstateVendor,
        // Buyer signups
        getBuyerSignups: getBuyerSignups,
        getBuyerSignup: getBuyerSignup,
        getAllBuyerSignups: getAllBuyerSignups,
        toggleBuyerStatus: toggleBuyerStatus,
        // Orders
        getOrders: getOrders,
        getOrdersSummary: getOrdersSummary,
        updateOrderStatus: updateOrderStatus,
        getOrderItems: getOrderItems,
        // Business categories
        getBusinessCategories: getBusinessCategories,
        getBusinessCategory: getBusinessCategory,
        createBusinessCategory: createBusinessCategory,
        updateBusinessCategory: updateBusinessCategory,
        deleteBusinessCategory: deleteBusinessCategory,
        // Product categories
        getProductCategories: getProductCategories,
        getAllProductCategories: getAllProductCategories,
        createProductCategory: createProductCategory,
        updateProductCategory: updateProductCategory,
        deleteProductCategory: deleteProductCategory,
        // Commission
        getCommission: getCommission,
        updateCommission: updateCommission,
        // Tickets
        getTickets: getTickets,
        getTicketMessages: getTicketMessages,
        replyToTicket: replyToTicket,
        // Notifications
        getNotifications: getNotifications,
        markNotificationAsRead: markNotificationAsRead,
        // Overview
        getOverviewStats: getOverviewStats
    };
})();
