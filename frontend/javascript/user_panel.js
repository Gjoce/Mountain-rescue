const firebaseConfig = {
  apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
  authDomain: "mountain-rescue-863ea.firebaseapp.com",
  projectId: "mountain-rescue-863ea",
  storageBucket: "mountain-rescue-863ea.appspot.com",
  messagingSenderId: "792489098952",
  appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

async function checkAuth() {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/login`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + authToken,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      window.location.href = "index.html";
      return;
    }

    if (data.isAdmin) {
      window.location.href = "index.html";
    } else {
      console.log("Rescuer access granted.");
    }
  } catch (error) {
    console.error("Error validating token:", error);
    alert("An error occurred while checking access. Please try again.");
    window.location.href = "index.html";
  }
}

checkAuth();

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

document.getElementById("logout").addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userUID");
      localStorage.removeItem("userName");

      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    });
});
