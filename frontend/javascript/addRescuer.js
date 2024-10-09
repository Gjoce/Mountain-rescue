// Check if the user is logged in
const authToken = localStorage.getItem('authToken');
if (!authToken) {
    alert('You must be logged in as an admin to access this page.');
    window.location.href = 'index.html'; // Redirect to login page
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const isAdmin = e.target.isAdmin.checked;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` // Use the stored auth token
            },
            body: JSON.stringify({ name, email, password, isAdmin })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Rescuer registered successfully!');
        } else {
            throw new Error(data.message || 'Failed to register rescuer.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-error').textContent = 'Registration failed: ' + error.message;
    }
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUID');
    window.location.href = 'index.html'; // Redirect to login page
});