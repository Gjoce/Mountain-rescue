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
const storage = firebase.storage();
const db = firebase.firestore();

const submitBtn = document.getElementById('submitBtn');
const injuryForm = document.getElementById('injuryForm');
const signatureModal = new bootstrap.Modal(document.getElementById('signatureModal'));
const canvas = document.getElementById('signaturePad');
const signaturePad = new SignaturePad(canvas);

let capturedPhotoBlob;

// Prevent form submission and show signature modal
injuryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    signatureModal.show(); // Show the signature pad modal
});

// Clear the signature pad when the clear button is clicked
document.getElementById('clear-btn').addEventListener('click', function () {
    signaturePad.clear();
});

// When signature is confirmed, allow form submission
document.getElementById('confirmSignature').addEventListener('click', async function () {
    if (!signaturePad.isEmpty()) {
        // Get form data
        const name = document.getElementById('name').value;
        const skiRun = document.getElementById('ski_run').value;
        const birthDate = document.getElementById('birth_date').value;
        const medicalComment = document.getElementById('medical_comment').value;

        // Get rescuer name and UID from localStorage
        const rescuerName = localStorage.getItem('userName');
        const userUID = localStorage.getItem('userUID');

        // Get selected injury points
        const selectedInjuryPoints = Array.from(document.querySelectorAll('input[name="injury_points"]:checked'))
            .map(checkbox => checkbox.value);

        // Handle signature
        const signatureDataURL = signaturePad.toDataURL();
        const skiCardPhoto = document.getElementById('ski_card_photo').files[0];

        try {
            // Create a unique ID for this injury report
            const injuryId = db.collection('injuries').doc().id;

            // Save ski card photo to Firebase Storage with a unique name
            const photoRef = firebase.storage().ref(`injuries/${rescuerName}/photos/${injuryId}_ski_card.jpg`);
            const photoSnapshot = await photoRef.put(skiCardPhoto);
            const photoURL = await photoSnapshot.ref.getDownloadURL();

            // Save signature as an image in Firebase Storage with a unique name
            const signatureBlob = await (await fetch(signatureDataURL)).blob();
            const signatureRef = firebase.storage().ref(`injuries/${rescuerName}/signatures/${injuryId}_signature.png`);
            const signatureSnapshot = await signatureRef.put(signatureBlob);
            const signatureURL = await signatureSnapshot.ref.getDownloadURL();

            // Save injury report in Firestore
            await firebase.firestore().collection('injuries').add({
                uid: userUID,
                injury_id: injuryId,
                patient_name: name,
                ski_run: skiRun,
                rescuer_name: rescuerName,
                birth_date: birthDate,
                medical_comment: medicalComment,
                ski_card_photo: photoURL,
                injury_points: selectedInjuryPoints,
                rescuer_signature: signatureURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Injury reported successfully!');
            injuryForm.reset(); // Reset the form after submission
            signaturePad.clear(); // Clear the signature pad after submission
            signatureModal.hide(); // Hide the signature modal
        } catch (error) {
            console.error('Error submitting injury:', error);
            alert('Failed to submit injury.');
        }
    } else {
        alert('Please provide a signature.');
    }
});
