// Pharma Connect Dashboard JavaScript - Enhanced with Full Functionality
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
    setupDataTables();
    setupPagination();
    setupFilters();
    setupModals();
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
}

// Global Data Storage
const AppData = {
    currentPage: 1,
    itemsPerPage: 10,
    currentFilters: {},
    currentView: 'grid',
    stockData: generateMockStockData(),
    productsData: generateMockProductsData(),
    usersData: generateMockUsersData(),
    ordersData: generateMockOrdersData(),
    rolesData: generateMockRolesData(),
    suppliersData: generateMockSuppliersData()
};

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
    
    // Add buttons
    $('#addStockBtn').on('click', () => openModal('stock'));
    $('#addProductBtn').on('click', () => openModal('product'));
    $('#addUserBtn').on('click', () => openModal('user'));
    $('#addOrderBtn').on('click', () => openModal('order'));
    $('#addSupplierBtn').on('click', () => openModal('supplier'));
    $('#addRoleBtn').on('click', () => openModal('role'));
    
    // Search inputs
    $('#stockSearch').on('input', debounce(() => handleSearch('stock'), 300));
    $('#productSearch').on('input', debounce(() => handleSearch('products'), 300));
    $('#userSearch').on('input', debounce(() => handleSearch('users'), 300));
    $('#orderSearch').on('input', debounce(() => handleSearch('orders'), 300));
    
    // Filter dropdowns
    $('#categoryFilter, #statusFilter').on('change', () => handleFilter('stock'));
    $('#productCategoryFilter, #productStatusFilter, #priceRangeFilter').on('change', () => handleFilter('products'));
    $('#roleFilter, #userStatusFilter').on('change', () => handleFilter('users'));
    $('#orderStatusFilter, #priorityFilter, #dateRangeFilter').on('change', () => handleFilter('orders'));
    
    // Clear filters
    $('#clearFilters').on('click', () => clearFilters('stock'));
    $('#clearProductFilters').on('click', () => clearFilters('products'));
    $('#clearUserFilters').on('click', () => clearFilters('users'));
    $('#clearOrderFilters').on('click', () => clearFilters('orders'));
    
    // View toggles
    $('#gridView').on('click', () => toggleView('grid'));
    $('#listView').on('click', () => toggleView('list'));
    
    // Export buttons
    $('.export-btn').on('click', handleExport);
    
    // Report download buttons
    $(document).on('click', '.text-green-600', function() {
        if ($(this).find('.fas.fa-download').length) {
            handleReportDownload($(this));
        }
    });
    
    // Select all checkboxes
    $('#selectAll').on('change', handleSelectAll);
    $('#selectAllUsers').on('change', handleSelectAll);
    $('#selectAllOrders').on('change', handleSelectAll);
    
    // Settings navigation
    setupSettingsNavigation();
    
    // Notification bell
    $('.fas.fa-bell').parent().addClass('bell-notification cursor-pointer');
    $('.bell-notification').on('click', showNotifications);
    
    // ESC key to close modals
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal').hide();
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

// Search Functionality
function handleSearch(entityType) {
    const searchTerm = $(`#${entityType}Search`).val().toLowerCase();
    AppData.currentFilters.search = searchTerm;
    AppData.currentPage = 1;
    refreshData(entityType);
}

// Filter Functionality
function handleFilter(entityType) {
    const filters = {};
    
    // Get all filter values for the entity type
    if (entityType === 'stock') {
        filters.category = $('#categoryFilter').val();
        filters.status = $('#statusFilter').val();
    } else if (entityType === 'products') {
        filters.category = $('#productCategoryFilter').val();
        filters.status = $('#productStatusFilter').val();
        filters.priceRange = $('#priceRangeFilter').val();
    } else if (entityType === 'users') {
        filters.role = $('#roleFilter').val();
        filters.status = $('#userStatusFilter').val();
    } else if (entityType === 'orders') {
        filters.status = $('#orderStatusFilter').val();
        filters.priority = $('#priorityFilter').val();
        filters.dateRange = $('#dateRangeFilter').val();
    }
    
    AppData.currentFilters = { ...AppData.currentFilters, ...filters };
    AppData.currentPage = 1;
    refreshData(entityType);
}

function clearFilters(entityType) {
    // Clear all filter dropdowns for the entity type
    if (entityType === 'stock') {
        $('#categoryFilter, #statusFilter').val('');
        $('#stockSearch').val('');
    } else if (entityType === 'products') {
        $('#productCategoryFilter, #productStatusFilter, #priceRangeFilter').val('');
        $('#productSearch').val('');
    } else if (entityType === 'users') {
        $('#roleFilter, #userStatusFilter').val('');
        $('#userSearch').val('');
    } else if (entityType === 'orders') {
        $('#orderStatusFilter, #priorityFilter, #dateRangeFilter').val('');
        $('#orderSearch').val('');
    }
    
    AppData.currentFilters = {};
    AppData.currentPage = 1;
    refreshData(entityType);
    showNotification('Filters cleared successfully.', 'info');
}

// Pagination Setup
function setupPagination() {
    $(document).on('click', '.pagination-btn', function() {
        const action = $(this).data('action');
        const entityType = getCurrentEntityType();
        
        if (action === 'prev' && AppData.currentPage > 1) {
            AppData.currentPage--;
        } else if (action === 'next') {
            const totalPages = Math.ceil(getFilteredData(entityType).length / AppData.itemsPerPage);
            if (AppData.currentPage < totalPages) {
                AppData.currentPage++;
            }
        } else if (typeof action === 'number') {
            AppData.currentPage = action;
        }
        
        refreshData(entityType);
    });
}

// View Toggle Functions
function toggleView(viewType) {
    AppData.currentView = viewType;
    
    if (viewType === 'grid') {
        $('#gridView').addClass('text-indigo-600 bg-indigo-50');
        $('#listView').removeClass('text-indigo-600 bg-indigo-50');
        // Implement grid view layout
    } else {
        $('#listView').addClass('text-indigo-600 bg-indigo-50');
        $('#gridView').removeClass('text-indigo-600 bg-indigo-50');
        // Implement list view layout
    }
    
    const entityType = getCurrentEntityType();
    refreshData(entityType);
    showNotification(`Switched to ${viewType} view`, 'info');
}

// Data Tables Setup
function setupDataTables() {
    // Initialize data tables for all entities
    refreshData('stock');
    refreshData('products');
    refreshData('users');
    refreshData('orders');
}

// Modal Functions
function setupModals() {
    // Create modal HTML if not exists
    if (!$('#entityModal').length) {
        $('body').append(createModalHTML());
    }
    
    // Setup modal event handlers
    $('#entityModal').on('click', '.close-modal', closeModal);
    $('#entityModal').on('submit', '#entityForm', handleFormSubmit);
}

function openModal(entityType, item = null) {
    const modal = $('#entityModal');
    const modalTitle = modal.find('#modalTitle');
    const modalForm = modal.find('#entityForm');
    
    // Set modal title
    modalTitle.text(item ? `Edit ${capitalizeFirst(entityType)}` : `Add New ${capitalizeFirst(entityType)}`);
    
    // Generate form fields based on entity type
    modalForm.html(generateFormFields(entityType, item));
    
    // Show modal
    modal.removeClass('hidden').addClass('flex');
    
    // Focus first input
    modalForm.find('input, select, textarea').first().focus();
}

function closeModal() {
    $('#entityModal').addClass('hidden').removeClass('flex');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const entityType = formData.get('entityType');
    const itemId = formData.get('itemId');
    
    // Simulate saving data
    setTimeout(() => {
        if (itemId) {
            showNotification(`${capitalizeFirst(entityType)} updated successfully!`, 'success');
        } else {
            showNotification(`${capitalizeFirst(entityType)} added successfully!`, 'success');
        }
        
        closeModal();
        refreshData(entityType);
    }, 1000);
}

// Export Functionality
function handleExport() {
    const entityType = $(this).data('entity') || getCurrentEntityType();
    
    if (entityType === 'reports') {
        // Export all reports
        const reportsData = generateReportsData();
        const csv = convertToCSV(reportsData, 'reports');
        downloadCSV(csv, `all_reports_${new Date().toISOString().split('T')[0]}.csv`);
        showNotification('All reports exported successfully!', 'success');
    } else {
        const data = getFilteredData(entityType);
        
        // Create CSV content
        const csv = convertToCSV(data, entityType);
        
        // Download CSV
        downloadCSV(csv, `${entityType}_export_${new Date().toISOString().split('T')[0]}.csv`);
        
        showNotification(`${capitalizeFirst(entityType)} data exported successfully!`, 'success');
    }
}

function handleReportDownload(button) {
    // Get report type from the button's context
    const reportCard = button.closest('.bg-gray-50, .p-3');
    const reportName = reportCard.find('.font-medium').text().toLowerCase().replace(/\s+/g, '_');
    
    // Generate mock report data
    const reportData = generateMockReportData(reportName);
    const csv = convertToCSV(reportData, reportName);
    
    downloadCSV(csv, `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    showNotification(`${reportName.replace(/_/g, ' ')} report downloaded successfully!`, 'success');
}

// CRUD Operations
function editItem(entityType, itemId) {
    const data = AppData[`${entityType}Data`];
    const item = data.find(item => item.id === itemId);
    
    if (item) {
        openModal(entityType, item);
    }
}

function deleteItem(entityType, itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        // Simulate deletion
        const data = AppData[`${entityType}Data`];
        const index = data.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            data.splice(index, 1);
            refreshData(entityType);
            showNotification(`${capitalizeFirst(entityType)} deleted successfully!`, 'success');
        }
    }
}

function viewItem(entityType, itemId) {
    const data = AppData[`${entityType}Data`];
    const item = data.find(item => item.id === itemId);
    
    if (item) {
        // Create and show view modal
        showItemDetails(entityType, item);
    }
}

function approveItem(entityType, itemId) {
    const data = AppData[`${entityType}Data`];
    const item = data.find(item => item.id === itemId);
    
    if (item) {
        item.status = 'approved';
        refreshData(entityType);
        showNotification(`${capitalizeFirst(entityType)} approved successfully!`, 'success');
    }
}

// Settings Functions
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
    
    // Setup settings form handlers
    $('.settings-section input, .settings-section select').on('change', function() {
        const setting = $(this).attr('id') || $(this).attr('name');
        const value = $(this).val() || $(this).is(':checked');
        
        // Save setting to localStorage
        localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
        
        showNotification('Setting saved successfully!', 'success');
    });
}

// Data Generation Functions
function generateMockStockData() {
    return [
        { id: 1, name: 'Paracetamol 500mg', category: 'tablets', stock: 850, minLevel: 100, expiry: '2025-06-15', status: 'in-stock', sku: 'PAR500' },
        { id: 2, name: 'Amoxicillin 250mg', category: 'capsules', stock: 45, minLevel: 50, expiry: '2024-12-30', status: 'low-stock', sku: 'AMX250' },
        { id: 3, name: 'Cough Syrup 100ml', category: 'syrups', stock: 0, minLevel: 25, expiry: '2025-03-20', status: 'out-of-stock', sku: 'CS100' },
        { id: 4, name: 'Vitamin D3 60K', category: 'vitamins', stock: 320, minLevel: 50, expiry: '2025-08-15', status: 'in-stock', sku: 'VD360K' },
        { id: 5, name: 'Insulin Injection', category: 'injections', stock: 15, minLevel: 20, expiry: '2024-11-30', status: 'expiring-soon', sku: 'INS100' }
    ];
}

function generateMockProductsData() {
    return [
        { id: 1, name: 'Paracetamol 500mg', category: 'prescription', price: 125, status: 'active', description: 'Pain reliever and fever reducer' },
        { id: 2, name: 'Amoxicillin 250mg', category: 'prescription', price: 285, status: 'active', description: 'Antibiotic for bacterial infections' },
        { id: 3, name: 'Cough Syrup 100ml', category: 'otc', price: 95, status: 'inactive', description: 'Relief from cough and cold symptoms' },
        { id: 4, name: 'Vitamin D3 60K', category: 'vitamins', price: 85, status: 'active', description: 'Vitamin D supplement capsules' }
    ];
}

function generateMockUsersData() {
    return [
        { id: 1, name: 'John Doe', email: 'john.doe@pharmaconnect.com', role: 'administrator', department: 'IT Department', lastLogin: '2024-01-15 10:30 AM', status: 'active', employeeId: 'EMP001' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@pharmaconnect.com', role: 'inventory-manager', department: 'Operations', lastLogin: '2024-01-15 09:45 AM', status: 'active', employeeId: 'EMP002' },
        { id: 3, name: 'Michael Rodriguez', email: 'michael.rodriguez@pharmaconnect.com', role: 'supplier-coordinator', department: 'Procurement', lastLogin: '2024-01-14 04:20 PM', status: 'inactive', employeeId: 'EMP003' }
    ];
}

function generateMockOrdersData() {
    return [
        { id: 1, orderId: '#ORD-2024-001', customer: 'Apollo Clinic', email: 'apollo@clinic.com', products: 5, total: 12450, status: 'pending', priority: 'urgent', date: '2024-01-15' },
        { id: 2, orderId: '#ORD-2024-002', customer: 'Metro Hospital', email: 'orders@metro.com', products: 12, total: 28950, status: 'shipped', priority: 'high', date: '2024-01-14' },
        { id: 3, orderId: '#ORD-2024-003', customer: 'City Medical', email: 'supply@citymed.com', products: 8, total: 18750, status: 'processing', priority: 'normal', date: '2024-01-13' }
    ];
}

function generateMockRolesData() {
    return [
        { id: 1, name: 'Administrator', description: 'Full access to all system modules', status: 'active' },
        { id: 2, name: 'Inventory Manager', description: 'Manages stock and products', status: 'active' },
        { id: 3, name: 'Supplier Coordinator', description: 'Handles supplier interactions', status: 'inactive' },
        { id: 4, name: 'Order Processor', description: 'Processes and tracks orders', status: 'active' },
        { id: 5, name: 'Report Analyst', description: 'Generates and analyzes reports', status: 'inactive' }
    ];
}

function generateMockSuppliersData() {
    return [
        { id: 1, name: 'PharmaCorp Ltd.', email: 'contact@pharmacorp.com', phone: '+91 98765 43210', location: 'Mumbai, Maharashtra', rating: 4.2, orders: 245, status: 'active' },
        { id: 2, name: 'BioMed Solutions', email: 'info@biomed.com', phone: '+91 87654 32109', location: 'Bangalore, Karnataka', rating: 4.8, orders: 189, status: 'active' },
        { id: 3, name: 'ChemLab Industries', email: 'orders@chemlab.com', phone: '+91 76543 21098', location: 'Hyderabad, Telangana', rating: 2.1, orders: 67, status: 'issues' }
    ];
}

function generateReportsData() {
    return [
        { reportType: 'Sales', period: 'Monthly', value: '₹150 Cr', date: '2024-01-01', category: 'Revenue' },
        { reportType: 'Inventory', period: 'Daily', value: '1,247 items', date: '2024-01-15', category: 'Stock' },
        { reportType: 'Orders', period: 'Weekly', value: '2,847 orders', date: '2024-01-15', category: 'Operations' },
        { reportType: 'Customers', period: 'Monthly', value: '432 active', date: '2024-01-01', category: 'Analytics' }
    ];
}

function generateMockReportData(reportName) {
    // Generate different data based on report type
    const baseData = [
        { metric: 'Total Revenue', value: '₹2,50,000', period: 'This Month', growth: '+12%' },
        { metric: 'Units Sold', value: '15,678', period: 'This Month', growth: '+8%' },
        { metric: 'Customer Count', value: '432', period: 'Active', growth: '+15%' },
        { metric: 'Profit Margin', value: '32.8%', period: 'Average', growth: '+2%' }
    ];
    
    return baseData.map((item, index) => ({
        ...item,
        reportName: reportName,
        id: index + 1,
        generatedDate: new Date().toISOString().split('T')[0]
    }));
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCurrentEntityType() {
    const currentPage = $('.page-content:not(.hidden)').attr('id');
    return currentPage ? currentPage.replace('-page', '') : 'dashboard';
}

function getFilteredData(entityType) {
    const data = AppData[`${entityType}Data`] || [];
    let filtered = [...data];
    
    // Apply search filter
    if (AppData.currentFilters.search) {
        filtered = filtered.filter(item => 
            Object.values(item).some(value => 
                String(value).toLowerCase().includes(AppData.currentFilters.search)
            )
        );
    }
    
    // Apply other filters
    Object.keys(AppData.currentFilters).forEach(key => {
        if (key !== 'search' && AppData.currentFilters[key]) {
            filtered = filtered.filter(item => 
                String(item[key]).toLowerCase() === AppData.currentFilters[key].toLowerCase()
            );
        }
    });
    
    return filtered;
}

function refreshData(entityType) {
    const data = getFilteredData(entityType);
    const startIndex = (AppData.currentPage - 1) * AppData.itemsPerPage;
    const endIndex = startIndex + AppData.itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    
    // Update table/grid based on entity type
    if (entityType === 'stock') {
        updateStockTable(pageData);
    } else if (entityType === 'products') {
        updateProductsGrid(pageData);
    } else if (entityType === 'users') {
        updateUsersTable(pageData);
    } else if (entityType === 'orders') {
        updateOrdersTable(pageData);
    }
    
    // Update pagination
    updatePagination(data.length, entityType);
}

function updateStockTable(data) {
    const tbody = $('#stockTableBody');
    tbody.empty();
    
    data.forEach(item => {
        const statusClass = item.status === 'in-stock' ? 'bg-green-100 text-green-800' : 
                           item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800';
        
        tbody.append(`
            <tr>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${capitalizeFirst(item.category)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.stock} units</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.minLevel} units</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.expiry}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${capitalizeFirst(item.status.replace('-', ' '))}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editItem('stock', ${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="viewItem('stock', ${item.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteItem('stock', ${item.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function updateProductsGrid(data) {
    const container = $('#productsGrid .grid');
    container.empty();
    
    data.forEach(item => {
        const statusClass = item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        
        container.append(`
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="p-3 bg-indigo-100 rounded-lg">
                            <i class="fas fa-pills text-indigo-600 text-xl"></i>
                        </div>
                        <span class="px-2 py-1 ${statusClass} text-xs font-semibold rounded-full">${capitalizeFirst(item.status)}</span>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">${item.name}</h4>
                    <p class="text-sm text-gray-600 mb-3">${item.description}</p>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-2xl font-bold text-indigo-600">₹${item.price}</span>
                        <span class="text-sm text-gray-500">per unit</span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <span>Category: ${capitalizeFirst(item.category)}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-sm transition duration-200" onclick="editItem('products', ${item.id})">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200" onclick="viewItem('products', ${item.id})">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                    </div>
                </div>
            </div>
        `);
    });
}

function updateUsersTable(data) {
    const tbody = $('#userTableBody');
    tbody.empty();
    
    data.forEach(item => {
        const statusClass = item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const initials = item.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        tbody.append(`
            <tr>
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
                            <div class="text-sm font-medium text-gray-900">${item.name}</div>
                            <div class="text-sm text-gray-500">Employee ID: ${item.employeeId}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${capitalizeFirst(item.role.replace('-', ' '))}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.department}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.lastLogin}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${capitalizeFirst(item.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editItem('users', ${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="viewItem('users', ${item.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteItem('users', ${item.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function updateOrdersTable(data) {
    const tbody = $('#orderTableBody');
    tbody.empty();
    
    data.forEach(item => {
        const statusClass = item.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                           item.status === 'shipped' ? 'bg-green-100 text-green-800' : 
                           item.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        
        const priorityClass = item.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                             item.priority === 'high' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
        
        const initials = item.customer.split(' ').map(n => n[0]).join('').toUpperCase();
        
        tbody.append(`
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded border-gray-300">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-indigo-600">${item.orderId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-xs font-medium text-blue-600">${initials}</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${item.customer}</div>
                            <div class="text-sm text-gray-500">${item.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.products} items</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹${item.total.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${capitalizeFirst(item.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClass}">${capitalizeFirst(item.priority)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="viewItem('orders', ${item.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="editItem('orders', ${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900" onclick="approveItem('orders', ${item.id})" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function updatePagination(totalItems, entityType) {
    const totalPages = Math.ceil(totalItems / AppData.itemsPerPage);
    const pagination = $(`#${entityType}-page .bg-white:last .hidden`).parent();
    
    // Update pagination info
    const start = (AppData.currentPage - 1) * AppData.itemsPerPage + 1;
    const end = Math.min(AppData.currentPage * AppData.itemsPerPage, totalItems);
    
    pagination.find('.text-sm').html(`
        Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalItems}</span> results
    `);
    
    // Update pagination buttons
    const nav = pagination.find('nav');
    nav.empty();
    
    // Previous button
    nav.append(`
        <button class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${AppData.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" data-action="prev" ${AppData.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `);
    
    // Page numbers
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const isActive = i === AppData.currentPage;
        nav.append(`
            <button class="pagination-btn ${isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} relative inline-flex items-center px-4 py-2 border text-sm font-medium" data-action="${i}">
                ${i}
            </button>
        `);
    }
    
    // Next button
    nav.append(`
        <button class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${AppData.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" data-action="next" ${AppData.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `);
}

// Additional utility functions
function createModalHTML() {
    return `
        <div id="entityModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modalTitle" class="text-2xl font-bold text-gray-800"></h2>
                    <button class="close-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="entityForm"></form>
            </div>
        </div>
    `;
}

function generateFormFields(entityType, item) {
    // Generate form fields based on entity type
    let fields = '';
    
    if (entityType === 'stock') {
        fields = `
            <input type="hidden" name="entityType" value="stock">
            <input type="hidden" name="itemId" value="${item ? item.id : ''}">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-2">Product Name</label>
                <input type="text" name="name" value="${item ? item.name : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="tablets" ${item && item.category === 'tablets' ? 'selected' : ''}>Tablets</option>
                    <option value="capsules" ${item && item.category === 'capsules' ? 'selected' : ''}>Capsules</option>
                    <option value="syrups" ${item && item.category === 'syrups' ? 'selected' : ''}>Syrups</option>
                    <option value="injections" ${item && item.category === 'injections' ? 'selected' : ''}>Injections</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-2">Stock Quantity</label>
                <input type="number" name="stock" value="${item ? item.stock : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
                <input type="date" name="expiry" value="${item ? item.expiry : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="flex space-x-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">Save</button>
                <button type="button" class="close-modal flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200">Cancel</button>
            </div>
        `;
    }
    // Add more entity types as needed
    
    return fields;
}

function convertToCSV(data, entityType) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showItemDetails(entityType, item) {
    // Create a detailed view modal
    const detailsHTML = `
        <div id="detailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-2xl max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">${capitalizeFirst(entityType)} Details</h2>
                    <button onclick="$('#detailsModal').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${Object.entries(item).map(([key, value]) => `
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-600">${capitalizeFirst(key.replace(/([A-Z])/g, ' $1'))}:</span>
                            <span class="text-gray-900">${value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 flex justify-end">
                    <button onclick="$('#detailsModal').remove()" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200">Close</button>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(detailsHTML);
}

function handleSelectAll() {
    const isChecked = $(this).is(':checked');
    const tableBody = $(this).closest('table').find('tbody');
    tableBody.find('input[type="checkbox"]').prop('checked', isChecked);
    
    const checkedCount = tableBody.find('input[type="checkbox"]:checked').length;
    if (checkedCount > 0) {
        showNotification(`${checkedCount} items selected`, 'info');
    }
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
            refreshData('stock');
            break;
        case 'products':
            refreshData('products');
            break;
        case 'users':
            refreshData('users');
            break;
        case 'orders':
            refreshData('orders');
            break;
        case 'settings':
            setupSettingsNavigation();
            break;
        default:
            break;
    }
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

// UI Functions
function toggleSidebar() {
    $('.sidebar').toggleClass('show');
}

function toggleUserDropdown() {
    $('#dropdownMenu').toggleClass('hidden');
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

// Export functions for global access
window.PharmaConnect = {
    showNotification,
    closeNotification,
    showPage,
    loadDashboardData,
    setupSettingsNavigation,
    editItem,
    deleteItem,
    viewItem,
    approveItem,
    handleExport
};