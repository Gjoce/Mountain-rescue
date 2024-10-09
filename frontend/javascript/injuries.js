// Firebase configuration (replace with your actual Firebase config)
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

// Now you can use Firebase services
const storage = firebase.storage();
const db = firebase.firestore();

// Signature pad setup
const canvas = document.getElementById('signaturePad');
const signaturePad = new SignaturePad(canvas);

// Clear signature button
document.getElementById('clear-btn').addEventListener('click', () => signaturePad.clear());

// Form submission logic
document.getElementById('injuryForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data
    const skiRun = document.getElementById('ski_run').value;
    const birthDate = document.getElementById('birth_date').value;
    const medicalComment = document.getElementById('medical_comment').value;

    // Get rescuer name from localStorage
    const rescuerName = localStorage.getItem('userName');

    // Get selected injury points
    const selectedInjuryPoints = Array.from(document.querySelectorAll('input[name="injury_points"]:checked'))
        .map(checkbox => checkbox.value);

    // Check if the signature pad is empty
    if (signaturePad.isEmpty()) {
        alert('Please provide a signature.');
        return; // Stop the submission if the signature is empty
    }

    // Handle signature
    const signatureDataURL = signaturePad.toDataURL();
    const skiCardPhoto = document.getElementById('ski_card_photo').files[0];

    try {
        // Save ski card photo to Firebase Storage
        const photoRef = firebase.storage().ref(`injuries/${rescuerName}_ski_card.jpg`);
        const photoSnapshot = await photoRef.put(skiCardPhoto);
        const photoURL = await photoSnapshot.ref.getDownloadURL();

        // Save signature as an image in Firebase Storage
        const signatureBlob = await (await fetch(signatureDataURL)).blob();
        const signatureRef = firebase.storage().ref(`injuries/${rescuerName}_signature.png`);
        const signatureSnapshot = await signatureRef.put(signatureBlob);
        const signatureURL = await signatureSnapshot.ref.getDownloadURL();
        const userUID = localStorage.getItem('userUID');

        // Save injury report in Firestore
        await firebase.firestore().collection('injuries').add({
            uid: userUID,  // Assuming you're storing the user UID somewhere
            ski_run: skiRun,
            rescuer_name: rescuerName, // Add rescuer name to the injury report
            birth_date: birthDate,
            medical_comment: medicalComment,
            ski_card_photo: photoURL,
            injury_points: selectedInjuryPoints,
            rescuer_signature: signatureURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Injury reported successfully!');
    } catch (error) {
        console.error('Error submitting injury:', error);
        alert('Failed to submit injury.');
    }
});
