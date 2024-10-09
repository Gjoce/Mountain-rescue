// Check if the user is logged in
const authToken = localStorage.getItem('authToken');
if (!authToken) {
    alert('You must be logged in to access this page.');
    window.location.href = 'index.html'; // Redirect to login page
}

// Logout function
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html'; // Redirect to login page
});