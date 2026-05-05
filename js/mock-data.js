// Mock Data Service for AdminHub Dashboard - Bootstrap Version
// All API calls use this mock data instead of real API endpoints
// Matches the React version exactly

(function() {
    'use strict';

    // Generate mock contacts
    const mockContacts = Array.from({ length: 25 }, (_, i) => ({
        id: `contact-${i + 1}`,
        fullName: `Contact User ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        subject: ["General Inquiry", "Support Request", "Feedback", "Partnership"][i % 4],
        message: `This is a sample message from contact ${i + 1}. They have an inquiry about our services.`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Generate mock waitlist entries
    const mockWaitlist = Array.from({ length: 30 }, (_, i) => ({
        id: `waitlist-${i + 1}`,
        business_name: `Business ${i + 1}`,
        full_name: `Vendor ${i + 1}`,
        email: `vendor${i + 1}@example.com`,
        phone: `+234${Math.floor(8000000000 + Math.random() * 999999999)}`,
        category: ["Fashion", "Electronics", "Food", "Services", "Health"][i % 5],
        state: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"][i % 5],
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: ["pending", "approved", "rejected"][i % 3],
    }));

    // Generate mock vendor signups
    const mockVendorSignups = Array.from({ length: 20 }, (_, i) => {
        const nigerianAddresses = [
            "15 Adeola Odeku Street, Victoria Island, Lagos",
            "Plot 234 Central Business District, Abuja",
            "45 Azikiwe Road, Port Harcourt",
            "78 Bompai Road, Kano",
            "12 Ring Road, Ibadan",
            "34 Awolowo Way, Ikeja, Lagos",
            "67 Ahmadu Bello Way, Kaduna",
            "90 Enugu Road, Onitsha",
            "23 Marina Street, Lagos Island, Lagos",
            "56 Wuse Zone 5, Abuja",
            "89 Aba Road, Umuahia",
            "11 Sokoto Road, Gusau",
            "44 Calabar Road, Ikot Ekpene",
            "77 Benin-Sapele Road, Benin City",
            "22 Owerri Road, Aba",
            "55 Jos Road, Bauchi",
            "88 Maiduguri Road, Damaturu",
            "33 Lokoja Road, Okene",
            "66 Minna Road, Suleja",
            "99 Asaba Road, Warri",
        ];
        
        return {
            id: `vendor-signup-${i + 1}`,
            vendorId: `vendor-${i + 1}`,
            fullName: `Vendor ${i + 1}`,
            emailAddress: `vendor${i + 1}@business.com`,
            phoneNumber: `+234${Math.floor(8000000000 + Math.random() * 999999999)}`,
            businessName: `Vendor Business ${i + 1}`,
            businessCategory: "Fashion",
            businessRegNumber: null,
            storeName: `Store ${i + 1}`,
            businessAddress: nigerianAddresses[i % nigerianAddresses.length],
            taxIdNumber: null,
            idDocument: null,
            businessRegCertificate: null,
            isActive: "1",
            isApproved: i % 3 === 0 ? "1" : "0",
            approvedAt: null,
            isSuspended: "0",
            suspendedAt: null,
            isPending: i % 3 === 0 ? false : true,
            createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            businessCategoryName: "Fashion & Clothing",
        };
    });

    // Generate mock buyer signups
    const mockBuyerSignups = Array.from({ length: 35 }, (_, i) => ({
        id: `buyer-${i + 1}`,
        buyerId: `buyer-${i + 1}`,
        fullName: `Buyer ${i + 1}`,
        emailAddress: `buyer${i + 1}@example.com`,
        phoneNumber: `+234${Math.floor(7000000000 + Math.random() * 999999999)}`,
        isActive: i % 4 !== 0 ? "1" : "0",
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Generate mock orders
    const mockOrders = Array.from({ length: 50 }, (_, i) => ({
        orderNo: `ORD-${String(i + 1).padStart(6, "0")}`,
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        customerPhone: `+234${Math.floor(9000000000 + Math.random() * 999999999)}`,
        status: ["pending", "processing", "shipped", "delivered", "cancelled"][i % 5],
        paymentMethod: ["bank_transfer", "card", "pay_on_delivery"][i % 3],
        totalAmount: (Math.random() * 500000 + 5000).toFixed(2),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        totalItemsCount: Math.floor(Math.random() * 10) + 1,
    }));

    // Generate mock business categories
    const mockBusinessCategories = [
        { id: "1", categoryName: "Fashion & Clothing", associatedBusinesses: "25", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
        { id: "2", categoryName: "Electronics", associatedBusinesses: "18", createdAt: "2024-01-20", updatedAt: "2024-01-20" },
        { id: "3", categoryName: "Food & Beverages", associatedBusinesses: "32", createdAt: "2024-02-01", updatedAt: "2024-02-01" },
        { id: "4", categoryName: "Health & Beauty", associatedBusinesses: "15", createdAt: "2024-02-10", updatedAt: "2024-02-10" },
        { id: "5", categoryName: "Home & Garden", associatedBusinesses: "20", createdAt: "2024-02-15", updatedAt: "2024-02-15" },
    ];

    // Generate mock product categories
    const mockProductCategories = [
        { categoryId: "1", categoryName: "Men's Clothing", associatedProducts: "50", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
        { categoryId: "2", categoryName: "Women's Clothing", associatedProducts: "75", createdAt: "2024-01-16", updatedAt: "2024-01-16" },
        { categoryId: "3", categoryName: "Smartphones", associatedProducts: "30", createdAt: "2024-01-20", updatedAt: "2024-01-20" },
        { categoryId: "4", categoryName: "Laptops", associatedProducts: "20", createdAt: "2024-01-21", updatedAt: "2024-01-21" },
        { categoryId: "5", categoryName: "Organic Food", associatedProducts: "45", createdAt: "2024-02-01", updatedAt: "2024-02-01" },
    ];

    // Generate mock notifications
    const mockNotifications = Array.from({ length: 15 }, (_, i) => ({
        notificationId: `notif-${i + 1}`,
        userId: `user-${i % 5 + 1}`,
        title: ["New Vendor Signup", "Order Update", "Payment Received", "Support Ticket"][i % 4],
        message: `Notification message ${i + 1} with important information.`,
        isRead: i % 3 === 0 ? "1" : "0",
        readAt: i % 3 === 0 ? new Date().toISOString() : null,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Generate mock tickets
    const mockTickets = Array.from({ length: 20 }, (_, i) => ({
        ticketId: `ticket-${i + 1}`,
        subject: ["Product Issue", "Payment Problem", "Delivery Question", "Account Access"][i % 4],
        status: ["open", "in_progress", "resolved", "closed"][i % 4],
        priority: ["low", "medium", "high"][i % 3],
        category: "Support",
        unreadCount: i % 3,
        userType: ["VENDOR", "BUYER"][i % 2],
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Mock overview statistics
    const mockOverviewStats = {
        totalVendors: 156,
        completedOrders: 1243,
        adminMessagesCount: 12,
        buyerMessagesCount: 28,
    };

    // Helper function to paginate results
    function paginate(data, page, perPage) {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedData = data.slice(start, end);
        
        return {
            data: paginatedData,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                perPage,
            },
        };
    }

    // Simulate network delay
    function simulateDelay(data, ms = 300) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(data), ms);
        });
    }

    // Format currency
    function formatCurrency(amount) {
        return '₦' + parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Get status badge class
    function getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'bg-warning text-dark',
            'processing': 'bg-info text-dark',
            'shipped': 'bg-primary',
            'delivered': 'bg-success',
            'cancelled': 'bg-danger',
            'approved': 'bg-success',
            'rejected': 'bg-danger',
            'open': 'bg-primary',
            'in_progress': 'bg-warning text-dark',
            'resolved': 'bg-success',
            'closed': 'bg-secondary',
            'active': 'bg-success',
            'inactive': 'bg-secondary',
        };
        return statusMap[status?.toLowerCase()] || 'bg-secondary';
    }

    // Expose to window
    window.mockData = {
        contacts: mockContacts,
        waitlist: mockWaitlist,
        vendorSignups: mockVendorSignups,
        buyerSignups: mockBuyerSignups,
        orders: mockOrders,
        businessCategories: mockBusinessCategories,
        productCategories: mockProductCategories,
        notifications: mockNotifications,
        tickets: mockTickets,
        overviewStats: mockOverviewStats,
        paginate,
        simulateDelay,
        formatCurrency,
        formatDate,
        getStatusBadgeClass,
    };
})();
