document.addEventListener('DOMContentLoaded', function() {
    // Show loader for 1 second to simulate loading
    setTimeout(function() {
        document.querySelector('.loader-container').classList.add('hidden');
    }, 1000);

    // Login functionality
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!username || !password) {
                showAlert('Por favor, preencha todos os campos.', 'danger');
                return;
            }
            
            // Simulate login (in a real application, you would send a request to the server)
            showLoader();
            
            // Simulate server response
            setTimeout(function() {
                hideLoader();
                // Redirect to dashboard (in a real application, this would happen after successful authentication)
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }

    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type');
            if (type === 'password') {
                passwordField.setAttribute('type', 'text');
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordField.setAttribute('type', 'password');
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Sidebar menu activation
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(menu => menu.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle submenu if exists
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                if (submenu.style.display === 'block') {
                    submenu.style.display = 'none';
                } else {
                    // Hide all other submenus
                    document.querySelectorAll('.submenu').forEach(sub => {
                        sub.style.display = 'none';
                    });
                    submenu.style.display = 'block';
                }
            }
        });
    });

    // Dashboard widgets initialization
    initializeCharts();
    initializeDataTables();
    setupNotifications();
    
    // Form validation
    const forms = document.querySelectorAll('form:not(#login-form)');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showAlert('Por favor, corrija os erros no formulário.', 'warning');
            }
        });
    });

    // Modal functionality
    setupModals();
    
    // Search functionality
    setupSearch();
});

// Helper functions
function showLoader() {
    document.querySelector('.loader-container').classList.remove('hidden');
}

function hideLoader() {
    document.querySelector('.loader-container').classList.add('hidden');
}

function showAlert(message, type) {
    const alertContainer = document.querySelector('.alert-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span class="close-alert"><i class="fas fa-times"></i></span>
        <p>${message}</p>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
    
    // Close button functionality
    alert.querySelector('.close-alert').addEventListener('click', function() {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    });
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container';
    document.body.appendChild(container);
    return container;
}

function validateForm(form) {
    let isValid = true;
    
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(error => error.remove());
    form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    
    // Check required fields
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            markFieldAsError(field, 'Este campo é obrigatório');
            isValid = false;
        }
    });
    
    // Check email fields
    form.querySelectorAll('input[type="email"]').forEach(field => {
        if (field.value && !validateEmail(field.value)) {
            markFieldAsError(field, 'Por favor, insira um e-mail válido');
            isValid = false;
        }
    });
    
    // Check password fields
    const passwordFields = form.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 1) {
        const password = passwordFields[0].value;
        const confirmPassword = passwordFields[1].value;
        
        if (password && confirmPassword && password !== confirmPassword) {
            markFieldAsError(passwordFields[1], 'As senhas não coincidem');
            isValid = false;
        }
    }
    
    return isValid;
}

function markFieldAsError(field, message) {
    field.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    field.parentNode.appendChild(errorMessage);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initializeCharts() {
    // Check if Chart.js is loaded and charts container exists
    if (typeof Chart === 'undefined' || !document.getElementById('charts-container')) return;
    
    // Sample data for charts
    const ctx1 = document.getElementById('usersChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Novos Usuários',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    const ctx2 = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Receita (R$)',
                data: [12500, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#4cc9f0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeDataTables() {
    // Check if DataTable is loaded
    if (typeof $.fn.DataTable === 'undefined') return;
    
    $('.data-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
        },
        responsive: true,
        pageLength: 10
    });
}

function setupNotifications() {
    const notificationBell = document.querySelector('.notification-bell');
    if (!notificationBell) return;
    
    notificationBell.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = document.querySelector('.notification-dropdown');
        dropdown.classList.toggle('show');
        
        // Mark as read when opened
        if (dropdown.classList.contains('show')) {
            notificationBell.querySelector('.notification-count').textContent = '0';
            notificationBell.querySelector('.notification-indicator').classList.add('hidden');
            
            // Mark all notifications as read
            dropdown.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
        }
    });
    
    // Close notification dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-dropdown')) {
            document.querySelector('.notification-dropdown')?.classList.remove('show');
        }
    });
}

function setupModals() {
    // Modal triggers
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        });
    });
    
    // Close modal buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
    
    // Click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // Live search functionality
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        
        if (query.length < 2) {
            document.querySelector('.search-results').classList.remove('show');
            return;
        }
        
        // Here you would typically make an AJAX request to a search endpoint
        // For demo purposes, we'll just show some static results
        showSearchResults(query);
    });
}

function showSearchResults(query) {
    const resultsContainer = document.querySelector('.search-results');
    
    // Simulate search results
    if (query.length >= 2) {
        resultsContainer.innerHTML = `
            <div class="search-result-item">
                <a href="user-profile.html?id=1">
                    <div class="avatar small">JD</div>
                    <div class="result-details">
                        <h4>João da Silva</h4>
                        <p>Usuário Premium</p>
                    </div>
                </a>
            </div>
            <div class="search-result-item">
                <a href="product-details.html?id=42">
                    <div class="result-icon"><i class="fas fa-box"></i></div>
                    <div class="result-details">
                        <h4>Produto Premium</h4>
                        <p>Categoria: Software</p>
                    </div>
                </a>
            </div>
            <div class="search-result-item">
                <a href="help.html?topic=payment">
                    <div class="result-icon"><i class="fas fa-question-circle"></i></div>
                    <div class="result-details">
                        <h4>Ajuda com Pagamentos</h4>
                        <p>Artigo de Suporte</p>
                    </div>
                </a>
            </div>
        `;
        resultsContainer.classList.add('show');
    } else {
        resultsContainer.classList.remove('show');
    }
}