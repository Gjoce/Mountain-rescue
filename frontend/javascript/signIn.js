// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
    authDomain: "mountain-rescue-863ea.firebaseapp.com",
    projectId: "mountain-rescue-863ea",
    storageBucket: "mountain-rescue-863ea.appspot.com",
    messagingSenderId: "792489098952",
    appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Initialize Firestore

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in with Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Get user information
        const user = userCredential.user; // This will contain the user object
        const uid = user.uid; // Get the user's UID
        const idToken = await user.getIdToken(); // Get the ID token

        // Store user UID in Firestore
        await db.collection('users').doc(uid).set({
            email: user.email,
            uid: uid,
            // You may add a name field here if it isn't stored already
        }, { merge: true });

        // Store the UID in localStorage
        localStorage.setItem('userUID', uid);  // Save UID to localStorage

        // Fetch user's name from Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            localStorage.setItem('userName', userData.name || ''); // Store the user's name in localStorage
        }

        // Send the ID token to the backend for verification
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', idToken); // Store the ID token

            // Redirect based on admin status
            if (data.isAdmin) {
                window.location.href = 'admin_panel.html'; // Admin panel URL
            } else {
                window.location.href = 'user_panel.html'; // Normal user panel URL
            }
        } else {
            const errorData = await response.json();
            document.getElementById('login-error').textContent = 'Login failed. ' + (errorData.message || 'Please check your credentials.');
        }
    } catch (error) {
        document.getElementById('login-error').textContent = 'An error occurred: ' + error.message;
    }
});
