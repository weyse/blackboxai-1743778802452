document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginBtn = document.getElementById('loginText');
    const spinner = document.getElementById('loginSpinner');
    
    // Show loading state
    loginBtn.textContent = 'Memproses...';
    spinner.classList.remove('hidden');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
        } else {
            window.location.href = '/staff/dashboard.html';
        }
        
    } catch (error) {
        alert(error.message);
        loginBtn.textContent = 'Masuk';
        spinner.classList.add('hidden');
    }
});

// Check for existing token
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                if (data.user.role === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/staff/dashboard.html';
                }
            }
        });
    }
});