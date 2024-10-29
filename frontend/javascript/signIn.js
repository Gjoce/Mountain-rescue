const firebaseConfig = {
  apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
  authDomain: "mountain-rescue-863ea.firebaseapp.com",
  projectId: "mountain-rescue-863ea",
  storageBucket: "mountain-rescue-863ea.appspot.com",
  messagingSenderId: "792489098952",
  appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );

    const user = userCredential.user;
    const uid = user.uid;
    const idToken = await user.getIdToken();

    await db.collection("users").doc(uid).set(
      {
        email: user.email,
        uid: uid,
      },
      { merge: true }
    );

    localStorage.setItem("userUID", uid);

    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      localStorage.setItem("userName", userData.name || "");
    }

    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("authToken", idToken);

      if (data.isAdmin) {
        window.location.href = "admin_panel.html";
      } else {
        window.location.href = "user_panel.html";
      }
    } else {
      const errorData = await response.json();
      document.getElementById("login-error").textContent =
        "Login failed. Invalid credentials or user not found.";
    }
  } catch (error) {
    document.getElementById("login-error").textContent =
      "Login failed. Please try again.";
  }
});
