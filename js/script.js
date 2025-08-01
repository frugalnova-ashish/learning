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
}

// Initialize settings navigation when settings page is loaded
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
        case 'settings':
            setupSettingsNavigation();
            break;
        // Add more cases for other pages
        default:
            break;
    }
}

// Export functions for global access (if needed)
window.PharmaConnect = {
    showNotification,
    closeNotification,
    showPage,
    loadDashboardData,
    setupSettingsNavigation
};