document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    if (email === '' || password === '') {
        errorMsg.textContent = 'Both fields are required.';
        return;
    }

    // Add your validation logic here
    // For demonstration, let's assume the valid password is "123456"
    const validEmail = 'test@example.com';
    const validPassword = '123456';

    if (password !== validPassword) {
        errorMsg.textContent = 'Invalid email or password.';
        return;
    }

    // Save login status in local storage
    localStorage.setItem('isLoggedIn', 'true');

    // Redirect to main root
    window.location.href = 'main.html';
});
