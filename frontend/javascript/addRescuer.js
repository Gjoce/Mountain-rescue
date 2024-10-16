// Check if the user is logged in as an admin
const authToken = localStorage.getItem('authToken');
if (!authToken) {
    
    window.location.href = 'index.html'; // Redirect to login page
} else {
    // Validate the authToken with the backend to confirm admin status
    const checkAdminStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                
                window.location.href = 'index.html'; // Redirect if invalid
            } else {
                const data = await response.json();
                if (!data.isAdmin) {
                    
                    window.location.href = 'index.html'; // Redirect if not admin
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            alert('An error occurred while checking your status. Please try again.');
            window.location.href = 'index.html'; // Redirect on error
        }
    };

    checkAdminStatus(); // Call the function to check admin status
}

// Registration form submission
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

// Logout function
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUID');
    localStorage.removeItem('userName');
    window.location.href = 'index.html'; // Redirect to login page
});
