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

// Stock Management Functions
function setupStockManagement() {
    // Add Stock Button
    $('#addStockBtn').on('click', function() {
        showNotification('Add Stock functionality would open here', 'info');
    });

    // Search functionality
    $('#stockSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterTable('#stockTableBody', searchTerm);
    });

    // Category filter
    $('#categoryFilter').on('change', function() {
        const category = $(this).val();
        filterByCategory('#stockTableBody', category, 'Tablets,Capsules,Syrups');
    });

    // Status filter
    $('#statusFilter').on('change', function() {
        const status = $(this).val();
        filterByStatus('#stockTableBody', status);
    });

    // Clear filters
    $('#clearFilters').on('click', function() {
        $('#stockSearch').val('');
        $('#categoryFilter').val('');
        $('#statusFilter').val('');
        $('#stockTableBody tr').show();
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
        const productName = row.find('.text-sm.font-medium').text();
        showNotification(`Edit ${productName} functionality would open here`, 'info');
    });

    // Delete buttons
    $('#stockTableBody').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const productName = row.find('.text-sm.font-medium').text();
        if (confirm(`Are you sure you want to delete ${productName}?`)) {
            row.fadeOut(300, function() {
                $(this).remove();
            });
            showNotification(`${productName} deleted successfully`, 'success');
        }
    });
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
    // Add User Button
    $('#addUserBtn').on('click', function() {
        showNotification('Add User functionality would open here', 'info');
    });

    // Search functionality
    $('#userSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterTable('#userTableBody', searchTerm);
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
        $('#userTableBody tr').show();
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
        const userName = row.find('.text-sm.font-medium').text();
        showNotification(`Edit ${userName} functionality would open here`, 'info');
    });

    $('#userTableBody').on('click', '.fa-eye', function() {
        const row = $(this).closest('tr');
        const userName = row.find('.text-sm.font-medium').text();
        showNotification(`View ${userName} profile would open here`, 'info');
    });

    $('#userTableBody').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const userName = row.find('.text-sm.font-medium').text();
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            row.fadeOut(300, function() {
                $(this).remove();
            });
            showNotification(`${userName} deleted successfully`, 'success');
        }
    });
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
    // Add Order Button
    $('#addOrderBtn').on('click', function() {
        showNotification('Create New Order functionality would open here', 'info');
    });

    // Search functionality
    $('#orderSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterTable('#orderTableBody', searchTerm);
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
        $('#orderTableBody tr').show();
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
        const orderID = row.find('.text-indigo-600').text();
        showNotification(`View ${orderID} details would open here`, 'info');
    });

    $('#orderTableBody').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const orderID = row.find('.text-indigo-600').text();
        showNotification(`Edit ${orderID} functionality would open here`, 'info');
    });

    $('#orderTableBody').on('click', '.fa-check', function() {
        const row = $(this).closest('tr');
        const orderID = row.find('.text-indigo-600').text();
        const statusBadge = row.find('.px-2.inline-flex');
        statusBadge.removeClass('bg-orange-100 text-orange-800').addClass('bg-green-100 text-green-800').text('Completed');
        showNotification(`${orderID} marked as completed`, 'success');
    });

    $('#orderTableBody').on('click', '.fa-truck', function() {
        const row = $(this).closest('tr');
        const orderID = row.find('.text-indigo-600').text();
        showNotification(`Track ${orderID} shipping would open here`, 'info');
    });
}

// Roles Management Functions
function setupRolesManagement() {
    // Add Role Button
    $('#addRoleBtn').on('click', function() {
        showNotification('Add New Role functionality would open here', 'info');
    });

    // Search functionality
    $('input[placeholder="Search by name..."]').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterRolesTable(searchTerm);
    });

    // Role actions
    $('.bg-white.divide-y').on('click', '.fa-edit', function() {
        const row = $(this).closest('tr');
        const roleName = row.find('.text-sm.font-medium').text();
        showNotification(`Edit ${roleName} role functionality would open here`, 'info');
    });

    $('.bg-white.divide-y').on('click', '.fa-trash', function() {
        const row = $(this).closest('tr');
        const roleName = row.find('.text-sm.font-medium').text();
        if (confirm(`Are you sure you want to delete ${roleName} role?`)) {
            row.fadeOut(300, function() {
                $(this).remove();
            });
            showNotification(`${roleName} role deleted successfully`, 'success');
        }
    });
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

// Pagination Functions
function setupPagination() {
    $('.relative.z-0.inline-flex').on('click', 'button', function(e) {
        e.preventDefault();
        
        // Remove active state from all buttons
        $(this).siblings().removeClass('bg-indigo-50 border-indigo-500 text-indigo-600')
               .addClass('bg-white border-gray-300 text-gray-500');
        
        // Add active state to clicked button (if it's a number)
        if ($(this).text().trim().match(/^\d+$/)) {
            $(this).removeClass('bg-white border-gray-300 text-gray-500')
                   .addClass('bg-indigo-50 border-indigo-500 text-indigo-600');
            
            showNotification(`Loading page ${$(this).text()}...`, 'info', 1500);
        } else {
            const direction = $(this).find('i').hasClass('fa-chevron-left') ? 'previous' : 'next';
            showNotification(`Loading ${direction} page...`, 'info', 1500);
        }
    });
}

// Export/Download Functions
function setupExportFunctions() {
    // Export buttons
    $('button:contains("Export"), .fa-download').parent().on('click', function(e) {
        e.preventDefault();
        const currentPage = $('.nav-item.active span').text();
        showNotification(`Exporting ${currentPage} data...`, 'info');
        
        setTimeout(() => {
            showNotification(`${currentPage} data exported successfully`, 'success');
        }, 2000);
    });
    
    // Print buttons
    $('button:contains("Print"), .fa-print').parent().on('click', function(e) {
        e.preventDefault();
        showNotification('Opening print dialog...', 'info');
        setTimeout(() => {
            window.print();
        }, 500);
    });
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