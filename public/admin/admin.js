document.addEventListener('DOMContentLoaded', () => {
    // Verify authentication
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '/auth/login.html';
        return;
    }

    // Display username
    if (user && user.username) {
        document.getElementById('usernameDisplay').textContent = user.username;
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login.html';
    });

    // Verify token periodically
    setInterval(() => {
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.valid) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/login.html';
            }
        });
    }, 300000); // Check every 5 minutes

    // Load dashboard data
    fetchDashboardData();
});

function fetchDashboardData() {
    const token = localStorage.getItem('authToken');
    
    fetch('/api/dashboard', {
        headers: {
            'Authorization': token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        return response.json();
    })
    .then(data => {
        // Update UI with dashboard data
        // Example: document.getElementById('visitorsCount').textContent = data.visitors;
    })
    .catch(error => {
        console.error('Dashboard error:', error);
    });
}