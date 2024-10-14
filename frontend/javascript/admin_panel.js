// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
    authDomain: "mountain-rescue-863ea.firebaseapp.com",
    projectId: "mountain-rescue-863ea",
    storageBucket: "mountain-rescue-863ea.appspot.com",
    messagingSenderId: "792489098952",
    appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore (if required)
const db = firebase.firestore();

// Function to check authentication and role
async function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('You must be logged in to access this page.');
        window.location.href = 'index.html'; // Redirect to login page
        return;
    }

    // Validate the authToken with the backend
    try {
        const response = await fetch(`http://localhost:3000/api/login`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + authToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            
            window.location.href = 'index.html'; // Redirect if not admin
            return;
        }

        // Check if user is an admin
        if (!data.isAdmin) {
            
            window.location.href = 'index.html'; // Redirect if not admin
        } else {
            console.log('Admin access granted.');
        }
    } catch (error) {
        console.error('Error validating token:', error);
        alert('An error occurred while checking access. Please try again.');
        window.location.href = 'index.html'; // Redirect to login if error occurs
    }
}

// Call the checkAuth function
checkAuth();

// Firebase Authentication State Check (to ensure the user is authenticated)
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        alert('You must be logged in to access this page.');
        window.location.href = 'index.html'; // Redirect to login page if not authenticated
    }
});

// Logout function
document.getElementById('logout').addEventListener('click', () => {
    // Sign out the Firebase user
    firebase.auth().signOut().then(() => {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userUID');
        localStorage.removeItem('userName');

        // Redirect to login page after sign out
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    });
});
