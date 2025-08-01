// Pharma Connect Dashboard JavaScript

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
});

// Application Initialization
function initializeApp() {
    setupEventListeners();
    setupNavigation();
    setupNotifications();
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Login form submission
    $('#loginForm').on('submit', handleLogin);
    
    // Logout button
    $('#logoutBtn').on('click', handleLogout);
    
    // Sidebar toggle for mobile
    $('#sidebarToggle').on('click', toggleSidebar);
    
    // User dropdown toggle
    $('#userDropdown').on('click', toggleUserDropdown);
    
    // Close dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#userDropdown, #dropdownMenu').length) {
            $('#dropdownMenu').addClass('hidden');
        }
    });
    
    // Navigation items
    $('.nav-item').on('click', handleNavigation);
    
    // Notification bell
    $('.fas.fa-bell').parent().addClass('bell-notification cursor-pointer');
    $('.bell-notification').on('click', showNotifications);
    
    // ESC key to close modals
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#loginModal').hide();
            $('#dropdownMenu').addClass('hidden');
        }
    });
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();
    
    // Show loading state
    const submitBtn = $('#loginForm button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.html('<span class="loading"></span> Signing in...').prop('disabled', true);
    
    // Simulate API call delay
    setTimeout(() => {
        if (validateCredentials(username, password)) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Show success message
            showNotification('Login successful! Welcome to Pharma Connect.', 'success');
            
            // Hide login modal and show dashboard
            $('#loginModal').fadeOut(300, () => {
                showDashboard();
            });
            
            // Reset form
            $('#loginForm')[0].reset();
        } else {
            showNotification('Invalid credentials. Please try again.', 'error');
        }
        
        // Reset button
        submitBtn.text(originalText).prop('disabled', false);
    }, 1500);
}

function validateCredentials(username, password) {
    // Demo credentials - in real app, this would be an API call
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'manager', password: 'manager123' },
        { username: 'user', password: 'user123' }
    ];
    
    return validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
}

function handleLogout() {
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear login state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        
        // Show logout message
        showNotification('You have been logged out successfully.', 'info');
        
        // Hide dashboard and show login
        $('#dashboardContainer').fadeOut(300, () => {
            showLogin();
        });
        
        // Reset navigation
        $('.nav-item').removeClass('active');
        $('.nav-item[data-page="dashboard"]').addClass('active');
        
        // Reset page content
        $('.page-content').addClass('hidden');
        $('#dashboard-page').removeClass('hidden');
        $('#pageTitle').text('Dashboard');
    }
}

function showLogin() {
    $('#loginModal').fadeIn(300);
    $('#dashboardContainer').hide();
    $('#username').focus();
}

function showDashboard() {
    $('#loginModal').hide();
    $('#dashboardContainer').fadeIn(300);
    
    // Update welcome message with stored username
    const username = localStorage.getItem('username') || 'User';
    $('.text-gray-700:contains("Welcome")').text(`Welcome, ${capitalizeFirst(username)}!`);
    
    // Update user initials
    $('#userDropdown').text(username.substring(0, 2).toUpperCase());
    
    // Load dashboard data
    loadDashboardData();
    
    // Start real-time updates
    updateDashboardStats();
}

// Navigation Functions
function setupNavigation() {
    // Set active navigation based on current page
    updateActiveNavigation('dashboard');
}

function handleNavigation(e) {
    e.preventDefault();
    
    const targetPage = $(this).data('page');
    const pageTitle = $(this).find('span').text();
    
    // Update active navigation
    $('.nav-item').removeClass('active');
    $(this).addClass('active');
    
    // Update page title
    $('#pageTitle').text(pageTitle);
    
    // Show target page content
    showPage(targetPage);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
    
    // Add navigation to browser history
    history.pushState({ page: targetPage }, pageTitle, `#${targetPage}`);
}

function showPage(pageId) {
    // Hide all pages
    $('.page-content').addClass('hidden');
    
    // Show target page
    $(`#${pageId}-page`).removeClass('hidden');
    
    // Load page specific data
    loadPageData(pageId);
}

function updateActiveNavigation(pageId) {
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-page="${pageId}"]`).addClass('active');
}

// UI Functions
function toggleSidebar() {
    $('.sidebar').toggleClass('show');
}

function toggleUserDropdown() {
    $('#dropdownMenu').toggleClass('hidden');
}

// Notification System
function setupNotifications() {
    // Create notification container if it doesn't exist
    if (!$('#notificationContainer').length) {
        $('body').append(`
            <div id="notificationContainer" class="fixed top-4 right-4 z-50 space-y-2"></div>
        `);
    }
}

function showNotification(message, type = 'info', duration = 4000) {
    const iconMap = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-exclamation-circle text-red-500',
        warning: 'fas fa-exclamation-triangle text-yellow-500',
        info: 'fas fa-info-circle text-blue-500'
    };
    
    const bgColorMap = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    };
    
    const notificationId = 'notification-' + Date.now();
    const notification = $(`
        <div id="${notificationId}" class="notification-item ${bgColorMap[type]} border rounded-lg p-4 shadow-lg max-w-sm transform translate-x-full opacity-0 transition-all duration-300">
            <div class="flex items-start">
                <i class="${iconMap[type]} mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-sm text-gray-800">${message}</p>
                </div>
                <button class="ml-2 text-gray-400 hover:text-gray-600" onclick="closeNotification('${notificationId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `);
    
    $('#notificationContainer').append(notification);
    
    // Animate in
    setTimeout(() => {
        notification.removeClass('translate-x-full opacity-0');
    }, 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notificationId);
        }, duration);
    }
}

function closeNotification(notificationId) {
    $(`#${notificationId}`).addClass('translate-x-full opacity-0');
    setTimeout(() => {
        $(`#${notificationId}`).remove();
    }, 300);
}

function showNotifications() {
    showNotification('You have 3 new notifications', 'info');
    
    // In a real app, this would open a notifications panel
    const notifications = [
        { message: '15 items expiring soon', type: 'warning', time: '2 hours ago' },
        { message: '28 items low in stock', type: 'error', time: '4 hours ago' },
        { message: '7 new orders received', type: 'info', time: '6 hours ago' }
    ];
    
    console.log('Notifications:', notifications);
}

// Data Loading Functions
function loadDashboardData() {
    // Simulate loading dashboard data
    animateCounters();
    updateCharts();
}

function loadPageData(pageId) {
    // Simulate loading page-specific data
    console.log(`Loading data for ${pageId} page`);
    
    // In a real app, you would make API calls here
    switch(pageId) {
        case 'stock':
            loadStockData();
            break;
        case 'products':
            loadProductsData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        // Add more cases for other pages
        default:
            break;
    }
}

function loadStockData() {
    // Simulate stock data loading
    console.log('Loading stock data...');
}

function loadProductsData() {
    // Simulate products data loading
    console.log('Loading products data...');
}

function loadOrdersData() {
    // Simulate orders data loading
    console.log('Loading orders data...');
}

// Animation Functions
function animateCounters() {
    // Animate number counters
    $('.font-semibold').each(function() {
        const $this = $(this);
        const text = $this.text();
        const numberMatch = text.match(/₹?(\d+(?:\.\d+)?)/);
        
        if (numberMatch) {
            const number = parseFloat(numberMatch[1]);
            const prefix = text.substring(0, numberMatch.index);
            const suffix = text.substring(numberMatch.index + numberMatch[0].length);
            
            $({ counter: 0 }).animate({ counter: number }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    $this.text(prefix + Math.ceil(this.counter) + suffix);
                },
                complete: function() {
                    $this.text(text);
                }
            });
        }
    });
}

function updateCharts() {
    // In a real app, you would update charts here
    console.log('Updating charts...');
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update time in header if element exists
    if ($('#currentTime').length) {
        $('#currentTime').text(timeString);
    }
}

// Browser history handling
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) {
        showPage(e.state.page);
        updateActiveNavigation(e.state.page);
        $('#pageTitle').text(capitalizeFirst(e.state.page));
    }
});

// Keyboard shortcuts
$(document).on('keydown', function(e) {
    // Alt + D for Dashboard
    if (e.altKey && e.key === 'd') {
        e.preventDefault();
        $('.nav-item[data-page="dashboard"]').click();
    }
    
    // Alt + S for Stock
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        $('.nav-item[data-page="stock"]').click();
    }
    
    // Alt + O for Orders
    if (e.altKey && e.key === 'o') {
        e.preventDefault();
        $('.nav-item[data-page="orders"]').click();
    }
    
    // Alt + L for Logout
    if (e.altKey && e.key === 'l') {
        e.preventDefault();
        if (localStorage.getItem('isLoggedIn') === 'true') {
            $('#logoutBtn').click();
        }
    }
});

// Performance monitoring
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    }
}

// Call performance logging after page load
$(window).on('load', logPerformance);

// Settings Navigation Functions
function setupSettingsNavigation() {
    $('.settings-nav-item').on('click', function(e) {
        e.preventDefault();
        
        const section = $(this).data('section');
        
        // Update active navigation
        $('.settings-nav-item').removeClass('active');
        $(this).addClass('active');
        
        // Show target settings section
        $('.settings-section').addClass('hidden');
        $(`#${section}-settings`).removeClass('hidden');
    });

    // Save All Settings Button
    $('.bg-green-600:contains("Save All Settings")').on('click', function() {
        showNotification('Saving all settings...', 'info');
        setTimeout(() => {
            showNotification('Settings saved successfully', 'success');
        }, 1500);
    });

    // Individual setting actions
    setupSettingsActions();
}

function setupSettingsActions() {
    // Toggle switches
    $('.switch input').on('change', function() {
        const settingName = $(this).closest('.flex').find('.font-medium').text();
        const isEnabled = $(this).is(':checked');
        showNotification(`${settingName} ${isEnabled ? 'enabled' : 'disabled'}`, 'success', 2000);
    });

    // Settings form inputs
    $('.settings-section input, .settings-section select').on('change', function() {
        const settingLabel = $(this).closest('div').find('label').text();
        if (settingLabel) {
            showNotification(`${settingLabel} updated`, 'info', 2000);
        }
    });

    // Action buttons in settings
    $('.settings-section button').on('click', function(e) {
        e.preventDefault();
        const buttonText = $(this).text().trim();
        
        switch(true) {
            case buttonText.includes('Create Backup'):
                showNotification('Creating backup...', 'info');
                setTimeout(() => {
                    showNotification('Backup created successfully', 'success');
                }, 3000);
                break;
            case buttonText.includes('Restore Backup'):
                if (confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
                    showNotification('Restoring from backup...', 'info');
                    setTimeout(() => {
                        showNotification('Backup restored successfully', 'success');
                    }, 4000);
                }
                break;
            case buttonText.includes('Configure'):
                showNotification(`${buttonText} dialog would open here`, 'info');
                break;
            case buttonText.includes('Restart System'):
                if (confirm('Are you sure you want to restart the system? This will temporarily interrupt service.')) {
                    showNotification('System restart initiated...', 'warning');
                    setTimeout(() => {
                        showNotification('System restart completed', 'success');
                    }, 5000);
                }
                break;
            case buttonText.includes('Clear Cache'):
                showNotification('Clearing system cache...', 'info');
                setTimeout(() => {
                    showNotification('Cache cleared successfully', 'success');
                }, 2000);
                break;
        }
    });
}

// Data Storage (In real app, this would be API calls)
let stockData = [
    {id: 1, name: 'Paracetamol 500mg', sku: 'PAR500', category: 'Tablets', stock: 850, minLevel: 100, expiry: '2025-06-15', status: 'In Stock'},
    {id: 2, name: 'Amoxicillin 250mg', sku: 'AMX250', category: 'Capsules', stock: 45, minLevel: 50, expiry: '2024-12-30', status: 'Low Stock'},
    {id: 3, name: 'Cough Syrup 100ml', sku: 'CS100', category: 'Syrups', stock: 0, minLevel: 25, expiry: '2025-03-20', status: 'Out of Stock'}
];

let userData = [
    {id: 1, name: 'John Doe', email: 'john.doe@pharmaconnect.com', role: 'Administrator', department: 'IT Department', lastLogin: '2024-01-15 10:30 AM', status: 'Active', empId: 'EMP001'},
    {id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@pharmaconnect.com', role: 'Inventory Manager', department: 'Operations', lastLogin: '2024-01-15 09:45 AM', status: 'Active', empId: 'EMP002'},
    {id: 3, name: 'Michael Rodriguez', email: 'michael.rodriguez@pharmaconnect.com', role: 'Supplier Coordinator', department: 'Procurement', lastLogin: '2024-01-14 04:20 PM', status: 'Inactive', empId: 'EMP003'}
];

let orderData = [
    {id: 1, orderId: '#ORD-2024-001', customer: 'Apollo Clinic', email: 'apollo@clinic.com', products: 5, total: 12450, status: 'Pending', priority: 'Urgent', date: '2024-01-15'},
    {id: 2, orderId: '#ORD-2024-002', customer: 'Metro Hospital', email: 'orders@metro.com', products: 12, total: 28950, status: 'Shipped', priority: 'High', date: '2024-01-14'},
    {id: 3, orderId: '#ORD-2024-003', customer: 'City Medical', email: 'supply@citymed.com', products: 8, total: 18750, status: 'Processing', priority: 'Normal', date: '2024-01-13'}
];

let rolesData = [
    {id: 1, name: 'Administrator', description: 'Full access to all system modules', status: 'Active'},
    {id: 2, name: 'Inventory Manager', description: 'Manages stock and products', status: 'Active'},
    {id: 3, name: 'Supplier Coordinator', description: 'Handles supplier interactions', status: 'Inactive'},
    {id: 4, name: 'Order Processor', description: 'Processes and tracks orders', status: 'Active'},
    {id: 5, name: 'Report Analyst', description: 'Generates and analyzes reports', status: 'Inactive'}
];

let currentPage = 1;
let itemsPerPage = 10;

// Modal Functions
function showModal(title, content, size = 'medium') {
    const modalSizes = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
        xlarge: 'max-w-6xl'
    };
    
    const modal = `
        <div id="crudModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg ${modalSizes[size]} w-full mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    $('#modalContainer').html(modal);
}

function closeModal() {
    $('#modalContainer').empty();
}

// Stock Management Functions
function setupStockManagement() {
    renderStockTable();
    
    // Add Stock Button
    $('#addStockBtn').on('click', function() {
        showAddStockModal();
    });

    // Search functionality
    $('#stockSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterStockTable(searchTerm);
    });

    // Category filter
    $('#categoryFilter').on('change', function() {
        filterStockTable();
    });

    // Status filter
    $('#statusFilter').on('change', function() {
        filterStockTable();
    });

    // Clear filters
    $('#clearFilters').on('click', function() {
        $('#stockSearch').val('');
        $('#categoryFilter').val('');
        $('#statusFilter').val('');
        renderStockTable();
        showNotification('Filters cleared', 'success');
    });

    // Select all checkbox
    $('#selectAll').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('#stockTableBody input[type="checkbox"]').prop('checked', isChecked);
    });

    // Edit buttons
    $('#stockTableBody').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const itemId = parseInt(row.data('id'));
        showEditStockModal(itemId);
    });

    // Delete buttons
    $('#stockTableBody').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const itemId = parseInt(row.data('id'));
        const productName = stockData.find(item => item.id === itemId)?.name;
        
        if (confirm(`Are you sure you want to delete ${productName}?`)) {
            deleteStockItem(itemId);
        }
    });
}

function renderStockTable(data = stockData) {
    const tableBody = $('#stockTableBody');
    tableBody.empty();
    
    data.forEach(item => {
        const statusClass = item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                           item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800';
        
        const row = `
            <tr data-id="${item.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded border-gray-300">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <i class="fas fa-pills text-indigo-600"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${item.name}</div>
                            <div class="text-sm text-gray-500">SKU: ${item.sku}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.stock} units</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.minLevel} units</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.expiry}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${item.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function filterStockTable(searchTerm = '') {
    if (!searchTerm) {
        searchTerm = $('#stockSearch').val().toLowerCase();
    }
    
    const category = $('#categoryFilter').val();
    const status = $('#statusFilter').val();
    
    let filteredData = stockData.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) || 
            item.sku.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || item.category.toLowerCase() === category.toLowerCase();
        
        const matchesStatus = !status || item.status.toLowerCase().replace(/\s+/g, '-') === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderStockTable(filteredData);
}

function showAddStockModal() {
    const form = `
        <form id="addStockForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input type="text" id="productName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input type="text" id="productSku" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="productCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="">Select Category</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Capsules">Capsules</option>
                        <option value="Syrups">Syrups</option>
                        <option value="Injections">Injections</option>
                        <option value="Ointments">Ointments</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                    <input type="number" id="currentStock" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
                    <input type="number" id="minLevel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input type="date" id="expiryDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Stock</button>
            </div>
        </form>
    `;
    
    showModal('Add New Stock', form);
    
    $('#addStockForm').on('submit', function(e) {
        e.preventDefault();
        addStockItem();
    });
}

function showEditStockModal(itemId) {
    const item = stockData.find(stock => stock.id === itemId);
    if (!item) return;
    
    const form = `
        <form id="editStockForm">
            <input type="hidden" id="editItemId" value="${item.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input type="text" id="editProductName" value="${item.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input type="text" id="editProductSku" value="${item.sku}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="editProductCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Tablets" ${item.category === 'Tablets' ? 'selected' : ''}>Tablets</option>
                        <option value="Capsules" ${item.category === 'Capsules' ? 'selected' : ''}>Capsules</option>
                        <option value="Syrups" ${item.category === 'Syrups' ? 'selected' : ''}>Syrups</option>
                        <option value="Injections" ${item.category === 'Injections' ? 'selected' : ''}>Injections</option>
                        <option value="Ointments" ${item.category === 'Ointments' ? 'selected' : ''}>Ointments</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                    <input type="number" id="editCurrentStock" value="${item.stock}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
                    <input type="number" id="editMinLevel" value="${item.minLevel}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input type="date" id="editExpiryDate" value="${item.expiry}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Stock</button>
            </div>
        </form>
    `;
    
    showModal('Edit Stock Item', form);
    
    $('#editStockForm').on('submit', function(e) {
        e.preventDefault();
        updateStockItem();
    });
}

function addStockItem() {
    const newItem = {
        id: Date.now(),
        name: $('#productName').val(),
        sku: $('#productSku').val(),
        category: $('#productCategory').val(),
        stock: parseInt($('#currentStock').val()),
        minLevel: parseInt($('#minLevel').val()),
        expiry: $('#expiryDate').val(),
        status: getStockStatus(parseInt($('#currentStock').val()), parseInt($('#minLevel').val()))
    };
    
    stockData.push(newItem);
    renderStockTable();
    closeModal();
    showNotification('Stock item added successfully', 'success');
}

function updateStockItem() {
    const itemId = parseInt($('#editItemId').val());
    const itemIndex = stockData.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        const currentStock = parseInt($('#editCurrentStock').val());
        const minLevel = parseInt($('#editMinLevel').val());
        
        stockData[itemIndex] = {
            ...stockData[itemIndex],
            name: $('#editProductName').val(),
            sku: $('#editProductSku').val(),
            category: $('#editProductCategory').val(),
            stock: currentStock,
            minLevel: minLevel,
            expiry: $('#editExpiryDate').val(),
            status: getStockStatus(currentStock, minLevel)
        };
        
        renderStockTable();
        closeModal();
        showNotification('Stock item updated successfully', 'success');
    }
}

function deleteStockItem(itemId) {
    const itemIndex = stockData.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        const productName = stockData[itemIndex].name;
        stockData.splice(itemIndex, 1);
        renderStockTable();
        showNotification(`${productName} deleted successfully`, 'success');
    }
}

function getStockStatus(currentStock, minLevel) {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= minLevel) return 'Low Stock';
    return 'In Stock';
}

// Products Management Functions
function setupProductsManagement() {
    // Add Product Button
    $('#addProductBtn').on('click', function() {
        showNotification('Add Product functionality would open here', 'info');
    });

    // Search functionality
    $('#productSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterProductCards(searchTerm);
    });

    // Filter functions
    $('#productCategoryFilter, #productStatusFilter, #priceRangeFilter').on('change', function() {
        filterProductCards();
    });

    // Clear filters
    $('#clearProductFilters').on('click', function() {
        $('#productSearch').val('');
        $('#productCategoryFilter').val('');
        $('#productStatusFilter').val('');
        $('#priceRangeFilter').val('');
        $('.bg-white.border').show();
        showNotification('Filters cleared', 'success');
    });

    // Grid/List view toggle
    $('#gridView').on('click', function() {
        $(this).addClass('text-indigo-600 bg-indigo-50').removeClass('text-gray-500');
        $('#listView').addClass('text-gray-500').removeClass('text-indigo-600 bg-indigo-50');
        $('#productsGrid').show();
        showNotification('Grid view activated', 'info');
    });

    $('#listView').on('click', function() {
        $(this).addClass('text-indigo-600 bg-indigo-50').removeClass('text-gray-500');
        $('#gridView').addClass('text-gray-500').removeClass('text-indigo-600 bg-indigo-50');
        showNotification('List view would be implemented here', 'info');
    });

    // Product card actions
    $('#productsGrid').on('click', '.fa-edit', function() {
        const productCard = $(this).closest('.bg-white.border');
        const productName = productCard.find('h4').text();
        showNotification(`Edit ${productName} functionality would open here`, 'info');
    });

    $('#productsGrid').on('click', '.fa-eye', function() {
        const productCard = $(this).closest('.bg-white.border');
        const productName = productCard.find('h4').text();
        showNotification(`View ${productName} details would open here`, 'info');
    });
}

// User Management Functions
function setupUserManagement() {
    renderUserTable();
    
    // Add User Button
    $('#addUserBtn').on('click', function() {
        showAddUserModal();
    });

    // Search functionality
    $('#userSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterUserTable(searchTerm);
    });

    // Filter functions
    $('#roleFilter, #userStatusFilter').on('change', function() {
        filterUserTable();
    });

    // Clear filters
    $('#clearUserFilters').on('click', function() {
        $('#userSearch').val('');
        $('#roleFilter').val('');
        $('#userStatusFilter').val('');
        renderUserTable();
        showNotification('Filters cleared', 'success');
    });

    // Select all checkbox
    $('#selectAllUsers').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('#userTableBody input[type="checkbox"]').prop('checked', isChecked);
    });

    // User actions
    $('#userTableBody').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const userId = parseInt(row.data('id'));
        showEditUserModal(userId);
    });

    $('#userTableBody').on('click', '.fa-eye', function() {
        const row = $(this).closest('tr');
        const userId = parseInt(row.data('id'));
        showViewUserModal(userId);
    });

    $('#userTableBody').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const userId = parseInt(row.data('id'));
        const userName = userData.find(user => user.id === userId)?.name;
        
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            deleteUser(userId);
        }
    });
}

function renderUserTable(data = userData) {
    const tableBody = $('#userTableBody');
    tableBody.empty();
    
    data.forEach(user => {
        const statusClass = user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        const row = `
            <tr data-id="${user.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded border-gray-300">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                                ${initials}
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500">Employee ID: ${user.empId}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.role}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.department}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.lastLogin}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${user.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function filterUserTable(searchTerm = '') {
    if (!searchTerm) {
        searchTerm = $('#userSearch').val().toLowerCase();
    }
    
    const role = $('#roleFilter').val();
    const status = $('#userStatusFilter').val();
    
    let filteredData = userData.filter(user => {
        const matchesSearch = !searchTerm || 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm) ||
            user.empId.toLowerCase().includes(searchTerm);
        
        const matchesRole = !role || user.role.toLowerCase().replace(/\s+/g, '-') === role;
        const matchesStatus = !status || user.status.toLowerCase() === status;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    renderUserTable(filteredData);
}

function showAddUserModal() {
    const form = `
        <form id="addUserForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" id="userName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="userEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input type="text" id="userEmpId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select id="userRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="">Select Role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Supplier Coordinator">Supplier Coordinator</option>
                        <option value="Order Processor">Order Processor</option>
                        <option value="Report Analyst">Report Analyst</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input type="text" id="userDepartment" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="userStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add User</button>
            </div>
        </form>
    `;
    
    showModal('Add New User', form);
    
    $('#addUserForm').on('submit', function(e) {
        e.preventDefault();
        addUser();
    });
}

function showEditUserModal(userId) {
    const user = userData.find(u => u.id === userId);
    if (!user) return;
    
    const form = `
        <form id="editUserForm">
            <input type="hidden" id="editUserId" value="${user.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" id="editUserName" value="${user.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="editUserEmail" value="${user.email}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input type="text" id="editUserEmpId" value="${user.empId}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select id="editUserRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Administrator" ${user.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                        <option value="Inventory Manager" ${user.role === 'Inventory Manager' ? 'selected' : ''}>Inventory Manager</option>
                        <option value="Supplier Coordinator" ${user.role === 'Supplier Coordinator' ? 'selected' : ''}>Supplier Coordinator</option>
                        <option value="Order Processor" ${user.role === 'Order Processor' ? 'selected' : ''}>Order Processor</option>
                        <option value="Report Analyst" ${user.role === 'Report Analyst' ? 'selected' : ''}>Report Analyst</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input type="text" id="editUserDepartment" value="${user.department}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="editUserStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update User</button>
            </div>
        </form>
    `;
    
    showModal('Edit User', form);
    
    $('#editUserForm').on('submit', function(e) {
        e.preventDefault();
        updateUser();
    });
}

function showViewUserModal(userId) {
    const user = userData.find(u => u.id === userId);
    if (!user) return;
    
    const content = `
        <div class="space-y-4">
            <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                    ${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${user.name}</h3>
                    <p class="text-gray-600">${user.role}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-500">Email</label>
                    <p class="text-gray-900">${user.email}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Employee ID</label>
                    <p class="text-gray-900">${user.empId}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Department</label>
                    <p class="text-gray-900">${user.department}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Last Login</label>
                    <p class="text-gray-900">${user.lastLogin}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Status</label>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${user.status}</span>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button onclick="closeModal()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Close</button>
                <button onclick="closeModal(); showEditUserModal(${user.id})" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Edit User</button>
            </div>
        </div>
    `;
    
    showModal('User Details', content);
}

function addUser() {
    const newUser = {
        id: Date.now(),
        name: $('#userName').val(),
        email: $('#userEmail').val(),
        empId: $('#userEmpId').val(),
        role: $('#userRole').val(),
        department: $('#userDepartment').val(),
        status: $('#userStatus').val(),
        lastLogin: 'Never'
    };
    
    userData.push(newUser);
    renderUserTable();
    closeModal();
    showNotification('User added successfully', 'success');
}

function updateUser() {
    const userId = parseInt($('#editUserId').val());
    const userIndex = userData.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        userData[userIndex] = {
            ...userData[userIndex],
            name: $('#editUserName').val(),
            email: $('#editUserEmail').val(),
            empId: $('#editUserEmpId').val(),
            role: $('#editUserRole').val(),
            department: $('#editUserDepartment').val(),
            status: $('#editUserStatus').val()
        };
        
        renderUserTable();
        closeModal();
        showNotification('User updated successfully', 'success');
    }
}

function deleteUser(userId) {
    const userIndex = userData.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        const userName = userData[userIndex].name;
        userData.splice(userIndex, 1);
        renderUserTable();
        showNotification(`${userName} deleted successfully`, 'success');
    }
}

// Supplier Management Functions
function setupSupplierManagement() {
    // Add Supplier Button
    $('#addSupplierBtn').on('click', function() {
        showNotification('Add Supplier functionality would open here', 'info');
    });

    // Supplier card actions
    $('.grid .bg-white').on('click', '.fa-edit', function() {
        const supplierCard = $(this).closest('.bg-white');
        const supplierName = supplierCard.find('h3').text();
        showNotification(`Edit ${supplierName} functionality would open here`, 'info');
    });

    $('.grid .bg-white').on('click', '.fa-eye', function() {
        const supplierCard = $(this).closest('.bg-white');
        const supplierName = supplierCard.find('h3').text();
        showNotification(`View ${supplierName} details would open here`, 'info');
    });
}

// Orders Management Functions
function setupOrdersManagement() {
    renderOrderTable();
    
    // Add Order Button
    $('#addOrderBtn').on('click', function() {
        showAddOrderModal();
    });

    // Search functionality
    $('#orderSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterOrderTable(searchTerm);
    });

    // Filter functions
    $('#orderStatusFilter, #priorityFilter, #dateRangeFilter').on('change', function() {
        filterOrderTable();
    });

    // Clear filters
    $('#clearOrderFilters').on('click', function() {
        $('#orderSearch').val('');
        $('#orderStatusFilter').val('');
        $('#priorityFilter').val('');
        $('#dateRangeFilter').val('');
        renderOrderTable();
        showNotification('Filters cleared', 'success');
    });

    // Select all checkbox
    $('#selectAllOrders').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('#orderTableBody input[type="checkbox"]').prop('checked', isChecked);
    });

    // Order actions
    $('#orderTableBody').on('click', '.fa-eye', function() {
        const row = $(this).closest('tr');
        const orderId = parseInt(row.data('id'));
        showViewOrderModal(orderId);
    });

    $('#orderTableBody').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const orderId = parseInt(row.data('id'));
        showEditOrderModal(orderId);
    });

    $('#orderTableBody').on('click', '.fa-check', function() {
        const row = $(this).closest('tr');
        const orderId = parseInt(row.data('id'));
        approveOrder(orderId);
    });

    $('#orderTableBody').on('click', '.fa-truck', function() {
        const row = $(this).closest('tr');
        const orderId = parseInt(row.data('id'));
        trackOrder(orderId);
    });
}

function renderOrderTable(data = orderData) {
    const tableBody = $('#orderTableBody');
    tableBody.empty();
    
    data.forEach(order => {
        const statusClasses = {
            'Pending': 'bg-orange-100 text-orange-800',
            'Shipped': 'bg-green-100 text-green-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        
        const priorityClasses = {
            'Urgent': 'bg-red-100 text-red-800',
            'High': 'bg-yellow-100 text-yellow-800',
            'Normal': 'bg-gray-100 text-gray-800',
            'Low': 'bg-blue-100 text-blue-800'
        };
        
        const customerInitials = order.customer.split(' ').map(n => n[0]).join('').toUpperCase();
        
        const row = `
            <tr data-id="${order.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded border-gray-300">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-indigo-600">${order.orderId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-xs font-medium text-blue-600">${customerInitials}</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${order.customer}</div>
                            <div class="text-sm text-gray-500">${order.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.products} items</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹${order.total.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[order.status]}">${order.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClasses[order.priority]}">${order.priority}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${order.status === 'Pending' ? '<button class="text-green-600 hover:text-green-900 mr-3"><i class="fas fa-check"></i></button>' : ''}
                    ${order.status === 'Shipped' ? '<button class="text-purple-600 hover:text-purple-900"><i class="fas fa-truck"></i></button>' : ''}
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function filterOrderTable(searchTerm = '') {
    if (!searchTerm) {
        searchTerm = $('#orderSearch').val().toLowerCase();
    }
    
    const status = $('#orderStatusFilter').val();
    const priority = $('#priorityFilter').val();
    const dateRange = $('#dateRangeFilter').val();
    
    let filteredData = orderData.filter(order => {
        const matchesSearch = !searchTerm || 
            order.orderId.toLowerCase().includes(searchTerm) || 
            order.customer.toLowerCase().includes(searchTerm) ||
            order.email.toLowerCase().includes(searchTerm);
        
                 const matchesStatus = !status || order.status.toLowerCase() === status;
         const matchesPriority = !priority || order.priority.toLowerCase() === priority;
        
        // Simple date filtering for demo
        let matchesDate = true;
        if (dateRange) {
            const orderDate = new Date(order.date);
            const today = new Date();
            
            switch(dateRange) {
                case 'today':
                    matchesDate = orderDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = orderDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = orderDate >= monthAgo;
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
    
    renderOrderTable(filteredData);
}

function showAddOrderModal() {
    const form = `
        <form id="addOrderForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input type="text" id="orderCustomer" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                    <input type="email" id="orderEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Number of Products</label>
                    <input type="number" id="orderProducts" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                    <input type="number" id="orderTotal" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select id="orderPriority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="orderStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Order</button>
            </div>
        </form>
    `;
    
    showModal('Create New Order', form);
    
    $('#addOrderForm').on('submit', function(e) {
        e.preventDefault();
        addOrder();
    });
}

function showViewOrderModal(orderId) {
    const order = orderData.find(o => o.id === orderId);
    if (!order) return;
    
    const content = `
        <div class="space-y-4">
            <div class="border-b pb-4">
                <h3 class="text-xl font-bold text-gray-900">${order.orderId}</h3>
                <p class="text-gray-600">Order Details</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-500">Customer</label>
                    <p class="text-gray-900">${order.customer}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Email</label>
                    <p class="text-gray-900">${order.email}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Products</label>
                    <p class="text-gray-900">${order.products} items</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Total Amount</label>
                    <p class="text-gray-900 font-semibold">₹${order.total.toLocaleString()}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Status</label>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">${order.status}</span>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Priority</label>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">${order.priority}</span>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500">Order Date</label>
                    <p class="text-gray-900">${order.date}</p>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button onclick="closeModal()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Close</button>
                <button onclick="closeModal(); showEditOrderModal(${order.id})" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Edit Order</button>
            </div>
        </div>
    `;
    
    showModal('Order Details', content);
}

function showEditOrderModal(orderId) {
    const order = orderData.find(o => o.id === orderId);
    if (!order) return;
    
    const form = `
        <form id="editOrderForm">
            <input type="hidden" id="editOrderId" value="${order.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input type="text" id="editOrderCustomer" value="${order.customer}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                    <input type="email" id="editOrderEmail" value="${order.email}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Number of Products</label>
                    <input type="number" id="editOrderProducts" value="${order.products}" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                    <input type="number" id="editOrderTotal" value="${order.total}" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select id="editOrderPriority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Normal" ${order.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                        <option value="High" ${order.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Urgent" ${order.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                        <option value="Low" ${order.priority === 'Low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="editOrderStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Order</button>
            </div>
        </form>
    `;
    
    showModal('Edit Order', form);
    
    $('#editOrderForm').on('submit', function(e) {
        e.preventDefault();
        updateOrder();
    });
}

function addOrder() {
    const newOrder = {
        id: Date.now(),
        orderId: `#ORD-2024-${String(orderData.length + 1).padStart(3, '0')}`,
        customer: $('#orderCustomer').val(),
        email: $('#orderEmail').val(),
        products: parseInt($('#orderProducts').val()),
        total: parseFloat($('#orderTotal').val()),
        status: $('#orderStatus').val(),
        priority: $('#orderPriority').val(),
        date: new Date().toISOString().split('T')[0]
    };
    
    orderData.push(newOrder);
    renderOrderTable();
    closeModal();
    showNotification('Order created successfully', 'success');
}

function updateOrder() {
    const orderId = parseInt($('#editOrderId').val());
    const orderIndex = orderData.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orderData[orderIndex] = {
            ...orderData[orderIndex],
            customer: $('#editOrderCustomer').val(),
            email: $('#editOrderEmail').val(),
            products: parseInt($('#editOrderProducts').val()),
            total: parseFloat($('#editOrderTotal').val()),
            status: $('#editOrderStatus').val(),
            priority: $('#editOrderPriority').val()
        };
        
        renderOrderTable();
        closeModal();
        showNotification('Order updated successfully', 'success');
    }
}

function approveOrder(orderId) {
    const orderIndex = orderData.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        orderData[orderIndex].status = 'Processing';
        renderOrderTable();
        showNotification(`Order ${orderData[orderIndex].orderId} approved and moved to processing`, 'success');
    }
}

function trackOrder(orderId) {
    const order = orderData.find(o => o.id === orderId);
    if (!order) return;
    
    const trackingInfo = `
        <div class="space-y-4">
            <div class="border-b pb-4">
                <h3 class="text-xl font-bold text-gray-900">Order Tracking</h3>
                <p class="text-gray-600">${order.orderId}</p>
            </div>
            <div class="space-y-3">
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                        <p class="font-medium text-gray-900">Order Confirmed</p>
                        <p class="text-sm text-gray-500">${order.date} 10:00 AM</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                        <p class="font-medium text-gray-900">Processing</p>
                        <p class="text-sm text-gray-500">${order.date} 11:30 AM</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                        <p class="font-medium text-gray-900">Shipped</p>
                        <p class="text-sm text-gray-500">${order.date} 2:15 PM</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                        <p class="font-medium text-gray-900">Out for Delivery</p>
                        <p class="text-sm text-gray-500">Expected today by 6:00 PM</p>
                    </div>
                </div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-sm text-blue-800"><strong>Tracking Number:</strong> TRK${order.id}${Date.now().toString().slice(-4)}</p>
                <p class="text-sm text-blue-800"><strong>Carrier:</strong> FastDelivery Express</p>
            </div>
            <div class="flex justify-end">
                <button onclick="closeModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
            </div>
        </div>
    `;
    
    showModal('Order Tracking', trackingInfo);
}

// Roles Management Functions
function setupRolesManagement() {
    renderRolesTable();
    
    // Add Role Button
    $('#addRoleBtn').on('click', function() {
        showAddRoleModal();
    });

    // Search functionality
    $('input[placeholder="Search by name..."]').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterRolesTable(searchTerm);
    });

    // Role actions
    $('tbody').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const roleId = parseInt(row.data('id'));
        showEditRoleModal(roleId);
    });

    $('tbody').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const roleId = parseInt(row.data('id'));
        const roleName = rolesData.find(role => role.id === roleId)?.name;
        
        if (confirm(`Are you sure you want to delete ${roleName} role?`)) {
            deleteRole(roleId);
        }
    });
}

function renderRolesTable(data = rolesData) {
    const tableBody = $('tbody');
    if (tableBody.length === 0) return;
    
    tableBody.empty();
    
    data.forEach(role => {
        const statusClass = role.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        
        const row = `
            <tr data-id="${role.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${role.name}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${role.description}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${role.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function filterRolesTable(searchTerm) {
    const filteredData = rolesData.filter(role => {
        return role.name.toLowerCase().includes(searchTerm) || 
               role.description.toLowerCase().includes(searchTerm);
    });
    
    renderRolesTable(filteredData);
}

function showAddRoleModal() {
    const form = `
        <form id="addRoleForm">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                    <input type="text" id="roleName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="roleDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="roleStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Role</button>
            </div>
        </form>
    `;
    
    showModal('Add New Role', form);
    
    $('#addRoleForm').on('submit', function(e) {
        e.preventDefault();
        addRole();
    });
}

function showEditRoleModal(roleId) {
    const role = rolesData.find(r => r.id === roleId);
    if (!role) return;
    
    const form = `
        <form id="editRoleForm">
            <input type="hidden" id="editRoleId" value="${role.id}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                    <input type="text" id="editRoleName" value="${role.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="editRoleDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>${role.description}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select id="editRoleStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                        <option value="Active" ${role.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${role.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Role</button>
            </div>
        </form>
    `;
    
    showModal('Edit Role', form);
    
    $('#editRoleForm').on('submit', function(e) {
        e.preventDefault();
        updateRole();
    });
}

function addRole() {
    const newRole = {
        id: Date.now(),
        name: $('#roleName').val(),
        description: $('#roleDescription').val(),
        status: $('#roleStatus').val()
    };
    
    rolesData.push(newRole);
    renderRolesTable();
    closeModal();
    showNotification('Role added successfully', 'success');
}

function updateRole() {
    const roleId = parseInt($('#editRoleId').val());
    const roleIndex = rolesData.findIndex(role => role.id === roleId);
    
    if (roleIndex !== -1) {
        rolesData[roleIndex] = {
            ...rolesData[roleIndex],
            name: $('#editRoleName').val(),
            description: $('#editRoleDescription').val(),
            status: $('#editRoleStatus').val()
        };
        
        renderRolesTable();
        closeModal();
        showNotification('Role updated successfully', 'success');
    }
}

function deleteRole(roleId) {
    const roleIndex = rolesData.findIndex(role => role.id === roleId);
    if (roleIndex !== -1) {
        const roleName = rolesData[roleIndex].name;
        rolesData.splice(roleIndex, 1);
        renderRolesTable();
        showNotification(`${roleName} role deleted successfully`, 'success');
    }
}

// Reports Management Functions
function setupReportsManagement() {
    // Generate Report Button
    $('.bg-indigo-600').on('click', function() {
        if ($(this).find('span').text().includes('Generate')) {
            showNotification('Generate Report functionality would open here', 'info');
        }
    });

    // Export All Button
    $('.bg-green-600').on('click', function() {
        if ($(this).find('span').text().includes('Export')) {
            showNotification('Exporting all reports...', 'info');
            setTimeout(() => {
                showNotification('Reports exported successfully', 'success');
            }, 2000);
        }
    });

    // Individual report actions
    $('.bg-white.rounded-lg.shadow-md').on('click', '.fa-eye', function() {
        const reportName = $(this).closest('.p-3').find('.font-medium').text();
        showNotification(`View ${reportName} would open here`, 'info');
    });

    $('.bg-white.rounded-lg.shadow-md').on('click', '.fa-download', function() {
        const reportName = $(this).closest('.p-3').find('.font-medium').text();
        showNotification(`Downloading ${reportName}...`, 'info');
        setTimeout(() => {
            showNotification(`${reportName} downloaded successfully`, 'success');
        }, 1500);
    });
}

// Utility Functions
function filterTable(tableBodySelector, searchTerm) {
    $(tableBodySelector + ' tr').each(function() {
        const text = $(this).text().toLowerCase();
        if (text.includes(searchTerm)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterByCategory(tableBodySelector, category, categories) {
    if (!category) {
        $(tableBodySelector + ' tr').show();
        return;
    }
    
    $(tableBodySelector + ' tr').each(function() {
        const rowCategory = $(this).find('td:nth-child(3)').text().toLowerCase();
        if (rowCategory.includes(category.toLowerCase())) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterByStatus(tableBodySelector, status) {
    if (!status) {
        $(tableBodySelector + ' tr').show();
        return;
    }
    
    $(tableBodySelector + ' tr').each(function() {
        const statusElement = $(this).find('.px-2.inline-flex');
        const rowStatus = statusElement.text().toLowerCase().replace(/\s+/g, '-');
        if (rowStatus.includes(status)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterProductCards(searchTerm = '') {
    const category = $('#productCategoryFilter').val();
    const status = $('#productStatusFilter').val();
    const priceRange = $('#priceRangeFilter').val();
    
    if (!searchTerm) {
        searchTerm = $('#productSearch').val().toLowerCase();
    }
    
    $('.bg-white.border').each(function() {
        let show = true;
        const cardText = $(this).text().toLowerCase();
        
        // Search filter
        if (searchTerm && !cardText.includes(searchTerm)) {
            show = false;
        }
        
        // Category filter
        if (category && !cardText.includes(category.toLowerCase())) {
            show = false;
        }
        
        // Status filter
        if (status) {
            const statusBadge = $(this).find('.px-2.py-1');
            const cardStatus = statusBadge.text().toLowerCase();
            if (!cardStatus.includes(status.toLowerCase())) {
                show = false;
            }
        }
        
        // Price filter
        if (priceRange) {
            const priceText = $(this).find('.text-2xl.font-bold').text();
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            
            switch(priceRange) {
                case '0-50':
                    if (price > 50) show = false;
                    break;
                case '50-200':
                    if (price < 50 || price > 200) show = false;
                    break;
                case '200-500':
                    if (price < 200 || price > 500) show = false;
                    break;
                case '500+':
                    if (price < 500) show = false;
                    break;
            }
        }
        
        if (show) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterUserTable() {
    const role = $('#roleFilter').val();
    const status = $('#userStatusFilter').val();
    
    $('#userTableBody tr').each(function() {
        let show = true;
        
        if (role) {
            const userRole = $(this).find('td:nth-child(4)').text().toLowerCase();
            if (!userRole.includes(role.toLowerCase().replace('-', ' '))) {
                show = false;
            }
        }
        
        if (status) {
            const statusBadge = $(this).find('.px-2.inline-flex');
            const userStatus = statusBadge.text().toLowerCase();
            if (!userStatus.includes(status)) {
                show = false;
            }
        }
        
        if (show) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterOrderTable() {
    const status = $('#orderStatusFilter').val();
    const priority = $('#priorityFilter').val();
    const dateRange = $('#dateRangeFilter').val();
    
    $('#orderTableBody tr').each(function() {
        let show = true;
        
        if (status) {
            const statusBadge = $(this).find('td:nth-child(6) .px-2');
            const orderStatus = statusBadge.text().toLowerCase();
            if (!orderStatus.includes(status)) {
                show = false;
            }
        }
        
        if (priority) {
            const priorityBadge = $(this).find('td:nth-child(7) .px-2');
            const orderPriority = priorityBadge.text().toLowerCase();
            if (!orderPriority.includes(priority)) {
                show = false;
            }
        }
        
        // Date range filtering would require more complex logic with actual dates
        if (dateRange) {
            // For demo purposes, just show a notification
            if (show) {
                showNotification(`Filtering by ${dateRange} - demo mode`, 'info', 2000);
            }
        }
        
        if (show) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterRolesTable(searchTerm) {
    $('tbody tr').each(function() {
        const text = $(this).text().toLowerCase();
        if (text.includes(searchTerm)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

// Real Pagination Functions
function setupPagination() {
    $('.relative.z-0.inline-flex').on('click', 'button', function(e) {
        e.preventDefault();
        
        const currentPageElement = $('.bg-indigo-50.border-indigo-500');
        let newPage = currentPage;
        
        if ($(this).find('i').hasClass('fa-chevron-left')) {
            // Previous page
            if (currentPage > 1) {
                newPage = currentPage - 1;
            }
        } else if ($(this).find('i').hasClass('fa-chevron-right')) {
            // Next page
            const maxPage = Math.ceil(getCurrentDataLength() / itemsPerPage);
            if (currentPage < maxPage) {
                newPage = currentPage + 1;
            }
        } else if ($(this).text().trim().match(/^\d+$/)) {
            // Specific page number
            newPage = parseInt($(this).text().trim());
        }
        
        if (newPage !== currentPage) {
            currentPage = newPage;
            updatePagination();
            
            // Re-render the current page with pagination
            const currentPageData = getCurrentPageData();
            renderCurrentPageTable(currentPageData);
            
            showNotification(`Loading page ${currentPage}...`, 'info', 1000);
        }
    });
}

function getCurrentDataLength() {
    const currentPageId = $('.nav-item.active').find('span').text().toLowerCase();
    switch(currentPageId) {
        case 'stock management': return stockData.length;
        case 'user management': return userData.length;
        case 'orders management': return orderData.length;
        case 'roles management': return rolesData.length;
        default: return 10;
    }
}

function getCurrentPageData() {
    const currentPageId = $('.nav-item.active').find('span').text().toLowerCase();
    let fullData = [];
    
    switch(currentPageId) {
        case 'stock management': fullData = stockData; break;
        case 'user management': fullData = userData; break;
        case 'orders management': fullData = orderData; break;
        case 'roles management': fullData = rolesData; break;
        default: return [];
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fullData.slice(startIndex, endIndex);
}

function renderCurrentPageTable(data) {
    const currentPageId = $('.nav-item.active').find('span').text().toLowerCase();
    
    switch(currentPageId) {
        case 'stock management': renderStockTable(data); break;
        case 'user management': renderUserTable(data); break;
        case 'orders management': renderOrderTable(data); break;
        case 'roles management': renderRolesTable(data); break;
    }
}

function updatePagination() {
    const totalItems = getCurrentDataLength();
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginationContainer = $('.relative.z-0.inline-flex');
    if (paginationContainer.length === 0) return;
    
    paginationContainer.empty();
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'opacity-50 cursor-not-allowed' : '';
    paginationContainer.append(`
        <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${prevDisabled}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        const activeClass = isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';
        
        paginationContainer.append(`
            <button class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${activeClass}">
                ${i}
            </button>
        `);
    }
    
    // Next button
    const nextDisabled = currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : '';
    paginationContainer.append(`
        <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${nextDisabled}">
            <i class="fas fa-chevron-right"></i>
        </button>
    `);
    
    // Update pagination info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const paginationInfo = $('.text-sm.text-gray-700');
    if (paginationInfo.length > 0) {
        paginationInfo.text(`Showing ${startItem} to ${endItem} of ${totalItems} results`);
    }
}

// Real Export/Download Functions
function setupExportFunctions() {
    // Export buttons
    $('button:contains("Export"), .fa-download').on('click', function(e) {
        e.preventDefault();
        const currentPageId = $('.nav-item.active').find('span').text().toLowerCase();
        exportToCSV(currentPageId);
    });
    
    // Print buttons
    $('button:contains("Print"), .fa-print').on('click', function(e) {
        e.preventDefault();
        printCurrentPage();
    });
}

function exportToCSV(pageType) {
    let data = [];
    let filename = '';
    
    switch(pageType) {
        case 'stock management':
            data = stockData;
            filename = 'stock_data.csv';
            break;
        case 'user management':
            data = userData;
            filename = 'user_data.csv';
            break;
        case 'orders management':
            data = orderData;
            filename = 'orders_data.csv';
            break;
        case 'roles management':
            data = rolesData;
            filename = 'roles_data.csv';
            break;
        default:
            showNotification('No data to export', 'warning');
            return;
    }
    
    if (data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    showNotification('Preparing export...', 'info');
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(key => {
            const value = row[key];
            // Wrap in quotes if contains comma, quote, or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        showNotification(`${filename} downloaded successfully`, 'success');
    }, 1000);
}

function exportToJSON(pageType) {
    let data = [];
    let filename = '';
    
    switch(pageType) {
        case 'stock management':
            data = stockData;
            filename = 'stock_data.json';
            break;
        case 'user management':
            data = userData;
            filename = 'user_data.json';
            break;
        case 'orders management':
            data = orderData;
            filename = 'orders_data.json';
            break;
        case 'roles management':
            data = rolesData;
            filename = 'roles_data.json';
            break;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${filename} downloaded successfully`, 'success');
}

function printCurrentPage() {
    const currentPageTitle = $('.nav-item.active span').text();
    const printWindow = window.open('', '_blank');
    
    let tableContent = '';
    const currentPageId = $('.nav-item.active').find('span').text().toLowerCase();
    
    switch(currentPageId) {
        case 'stock management':
            tableContent = generateStockPrintContent();
            break;
        case 'user management':
            tableContent = generateUserPrintContent();
            break;
        case 'orders management':
            tableContent = generateOrderPrintContent();
            break;
        case 'roles management':
            tableContent = generateRolesPrintContent();
            break;
    }
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentPageTitle} - Pharma Connect</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
                .date { color: #6b7280; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Pharma Connect</div>
                <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
            <h1>${currentPageTitle}</h1>
            ${tableContent}
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Print dialog opened', 'info');
}

function generateStockPrintContent() {
    let content = '<table><thead><tr><th>Product Name</th><th>SKU</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Expiry</th><th>Status</th></tr></thead><tbody>';
    
    stockData.forEach(item => {
        content += `
            <tr>
                <td>${item.name}</td>
                <td>${item.sku}</td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>${item.minLevel}</td>
                <td>${item.expiry}</td>
                <td>${item.status}</td>
            </tr>
        `;
    });
    
    content += '</tbody></table>';
    return content;
}

function generateUserPrintContent() {
    let content = '<table><thead><tr><th>Name</th><th>Email</th><th>Employee ID</th><th>Role</th><th>Department</th><th>Status</th></tr></thead><tbody>';
    
    userData.forEach(user => {
        content += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.empId}</td>
                <td>${user.role}</td>
                <td>${user.department}</td>
                <td>${user.status}</td>
            </tr>
        `;
    });
    
    content += '</tbody></table>';
    return content;
}

function generateOrderPrintContent() {
    let content = '<table><thead><tr><th>Order ID</th><th>Customer</th><th>Email</th><th>Products</th><th>Total</th><th>Status</th><th>Priority</th><th>Date</th></tr></thead><tbody>';
    
    orderData.forEach(order => {
        content += `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customer}</td>
                <td>${order.email}</td>
                <td>${order.products}</td>
                <td>₹${order.total.toLocaleString()}</td>
                <td>${order.status}</td>
                <td>${order.priority}</td>
                <td>${order.date}</td>
            </tr>
        `;
    });
    
    content += '</tbody></table>';
    return content;
}

function generateRolesPrintContent() {
    let content = '<table><thead><tr><th>Role Name</th><th>Description</th><th>Status</th></tr></thead><tbody>';
    
    rolesData.forEach(role => {
        content += `
            <tr>
                <td>${role.name}</td>
                <td>${role.description}</td>
                <td>${role.status}</td>
            </tr>
        `;
    });
    
    content += '</tbody></table>';
    return content;
}

// Additional Interactive Features
function setupAdditionalFeatures() {
    // Statistics cards click interaction
    $('.border-l-4').on('click', function() {
        const title = $(this).find('.text-sm.font-medium').text();
        const value = $(this).find('.text-2xl.font-semibold').text();
        showNotification(`${title}: ${value} - Click for detailed view`, 'info');
    });

    // Table row hover effects
    $('tbody tr').hover(
        function() {
            $(this).addClass('bg-gray-50');
        },
        function() {
            $(this).removeClass('bg-gray-50');
        }
    );

    // Status badge interactions
    $('.px-2.inline-flex').on('click', function(e) {
        e.stopPropagation();
        const status = $(this).text();
        showNotification(`Status: ${status} - Click to change status`, 'info');
    });

    // Search input focus effects
    $('input[type="text"]').on('focus', function() {
        $(this).closest('.relative').addClass('ring-2 ring-indigo-500 ring-opacity-20');
    }).on('blur', function() {
        $(this).closest('.relative').removeClass('ring-2 ring-indigo-500 ring-opacity-20');
    });

    // Dropdown effects
    $('select').on('focus', function() {
        $(this).addClass('ring-2 ring-indigo-500 ring-opacity-20');
    }).on('blur', function() {
        $(this).removeClass('ring-2 ring-indigo-500 ring-opacity-20');
    });
}

// Dynamic Content Updates
function updateDashboardStats() {
    // Simulate real-time updates
    setInterval(() => {
        // Update random statistics
        const statCards = $('.text-2xl.font-semibold');
        if (statCards.length > 0) {
            const randomCard = statCards.eq(Math.floor(Math.random() * statCards.length));
            const currentValue = parseInt(randomCard.text().replace(/[^\d]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
            
            if (newValue > 0) {
                const formattedValue = randomCard.text().replace(/[\d,]+/, newValue.toLocaleString());
                randomCard.text(formattedValue);
                
                // Add pulse animation
                randomCard.addClass('animate-pulse');
                setTimeout(() => {
                    randomCard.removeClass('animate-pulse');
                }, 1000);
            }
        }
    }, 30000); // Update every 30 seconds
}

// Enhanced Search with Highlighting
function highlightSearchResults(container, searchTerm) {
    if (!searchTerm) {
        $(container).find('.highlight').removeClass('highlight');
        return;
    }
    
    $(container).find('*').each(function() {
        const element = $(this);
        if (element.children().length === 0) {
            const text = element.text();
            if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
                const highlightedText = text.replace(
                    new RegExp(`(${searchTerm})`, 'gi'),
                    '<span class="highlight bg-yellow-200">$1</span>'
                );
                element.html(highlightedText);
            }
        }
    });
}

// Bulk Operations
function setupBulkOperations() {
    // Add bulk action buttons when items are selected
    $('input[type="checkbox"]').on('change', function() {
        const checkedBoxes = $('tbody input[type="checkbox"]:checked');
        const bulkActionsContainer = $('#bulkActions');
        
        if (checkedBoxes.length > 0) {
            if (bulkActionsContainer.length === 0) {
                const bulkActions = `
                    <div id="bulkActions" class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-50">
                        <div class="flex items-center space-x-3">
                            <span class="text-sm font-medium">${checkedBoxes.length} items selected</span>
                            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm" onclick="bulkDelete()">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                            <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm" onclick="bulkExport()">
                                <i class="fas fa-download mr-1"></i>Export
                            </button>
                            <button class="text-gray-500 hover:text-gray-700" onclick="clearSelection()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
                $('body').append(bulkActions);
            } else {
                bulkActionsContainer.find('span').text(`${checkedBoxes.length} items selected`);
            }
        } else {
            $('#bulkActions').remove();
        }
    });
}

// Bulk operation functions
window.bulkDelete = function() {
    const checkedBoxes = $('tbody input[type="checkbox"]:checked');
    if (confirm(`Are you sure you want to delete ${checkedBoxes.length} items?`)) {
        checkedBoxes.closest('tr').fadeOut(300, function() {
            $(this).remove();
        });
        $('#bulkActions').remove();
        showNotification(`${checkedBoxes.length} items deleted successfully`, 'success');
    }
};

window.bulkExport = function() {
    const checkedBoxes = $('tbody input[type="checkbox"]:checked');
    showNotification(`Exporting ${checkedBoxes.length} selected items...`, 'info');
    setTimeout(() => {
        showNotification('Export completed successfully', 'success');
        $('#bulkActions').remove();
        checkedBoxes.prop('checked', false);
    }, 2000);
};

window.clearSelection = function() {
    $('input[type="checkbox"]').prop('checked', false);
    $('#bulkActions').remove();
};

// Initialize settings navigation when settings page is loaded
function loadPageData(pageId) {
    // Simulate loading page-specific data
    console.log(`Loading data for ${pageId} page`);
    
    // In a real app, you would make API calls here
    switch(pageId) {
        case 'stock':
            setupStockManagement();
            break;
        case 'products':
            setupProductsManagement();
            break;
        case 'user':
            setupUserManagement();
            break;
        case 'supplier':
            setupSupplierManagement();
            break;
        case 'orders':
            setupOrdersManagement();
            break;
        case 'roles':
            setupRolesManagement();
            break;
        case 'reports':
            setupReportsManagement();
            break;
        case 'settings':
            setupSettingsNavigation();
            break;
        default:
            break;
    }
    
         // Setup common functions for all pages
     setupPagination();
     setupExportFunctions();
     setupAdditionalFeatures();
     setupBulkOperations();
}

// Export functions for global access (if needed)
window.PharmaConnect = {
    showNotification,
    closeNotification,
    showPage,
    loadDashboardData,
    setupSettingsNavigation
};