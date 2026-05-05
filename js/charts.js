// Chart.js initialization for Dashboard
// Revenue Overview and Sales by Category charts

(function() {
    'use strict';

    // Initialize charts when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initRevenueChart();
        initCategoryChart();
    });

    // Revenue Overview Chart (Line Chart)
    function initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const revenueData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: [12500, 15300, 18200, 16800, 21500, 24300, 22100, 26700, 29400, 28200, 32500, 35800],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        const revenueConfig = {
            type: 'line',
            data: revenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            },
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        };

        new Chart(ctx, revenueConfig);
    }

    // Sales by Category Chart (Doughnut Chart)
    function initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const categoryData = {
            labels: ['Fashion', 'Electronics', 'Food & Beverages', 'Health & Beauty', 'Home & Garden'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#4f46e5',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ef4444'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };

        const categoryConfig = {
            type: 'doughnut',
            data: categoryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        };

        new Chart(ctx, categoryConfig);
    }

})();
