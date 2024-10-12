const injuryPoints = document.querySelectorAll('.injury-point');
const injuryTypeContainer = document.getElementById('injury-type-dropdowns');

// Create the dropdown HTML for injury type selection
const injuryTypes = `
    <label class="form-label">Select Injury Type:</label>
    <select class="form-select" name="injury_type">
        <option value="" disabled selected>Select Injury Type</option>
        <option value="Sprain">Sprain</option>
        <option value="Fracture">Fracture</option>
        <option value="Dislocation">Dislocation</option>
        <option value="Cut">Cut</option>
        <option value="Bruise">Bruise</option>
    </select>
`;

injuryPoints.forEach(point => {
    const label = document.querySelector(`label[for="${point.id}"]`);  // Find the label associated with this checkbox

    point.addEventListener('change', function() {
        const injuryId = point.id;

        // If checked, make the label bold and add the dropdown; if unchecked, remove the bold and the dropdown
        if (point.checked) {
            // Make the label bold
            if (label) {
                label.style.fontWeight = 'bold';
            }

            // Add the injury type dropdown
            const div = document.createElement('div');
            div.className = 'mb-3 injury-type';
            div.id = `dropdown-${injuryId}`;
            div.innerHTML = `<label for="${injuryId}-injury">${point.value} Injury Type:</label>` + injuryTypes;
            injuryTypeContainer.appendChild(div);
        } else {
            // Remove the bold style from the label
            if (label) {
                label.style.fontWeight = 'normal';
            }

            // Remove the injury type dropdown
            document.getElementById(`dropdown-${injuryId}`).remove();
        }
    });
});





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

// Check if user is authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Authenticated user:", user.email);
    } else {
        // User is not authenticated, redirect to login page
        alert("You need to log in first to submit the form.");
        window.location.href = "login.html"; // Redirect to login page
    }
});

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
    const user = firebase.auth().currentUser;  // Get the current authenticated user
    submitBtn.style.display = 'none'; // Hides the submit button

    

    if (user) {
        if (!signaturePad.isEmpty()) {
            // Get form data
            const name = document.getElementById('name').value;
            const skiRun = document.getElementById('ski_run').value;
            const birthDate = document.getElementById('birth_date').value;
            const medicalComment = document.getElementById('medical_comment').value;

            // Get rescuer name and UID from localStorage
            const rescuerName = localStorage.getItem('userName');
            const userUID = user.uid;  // Get UID from authenticated user

            
const selectedInjuryPoints = Array.from(document.querySelectorAll('input[name="injury_points"]:checked'))
.map(checkbox => {
    const injuryId = checkbox.id;  // Get the ID of the injury point
    const injuryTypeDropdown = document.querySelector(`#dropdown-${injuryId} select`);  // Find the corresponding dropdown
    const injuryType = injuryTypeDropdown ? injuryTypeDropdown.value : null;  // Get the selected injury type

    // Determine if it's a left or right body part by checking the ID
    const side = injuryId.endsWith('L') ? 'L' : injuryId.endsWith('R') ? 'R' : 'Center';  // Default to 'Center' for body parts without L/R

    return {
        point: checkbox.value,  // The value of the injury point (e.g., body part)
        side: side,  // Store whether it's 'L', 'R', or 'Center'
        type: injuryType  // The selected injury type (e.g., sprain, fracture, etc.)
    };
});


// Ensure that each selected point has a corresponding injury type

const incompleteInjury = selectedInjuryPoints.some(injury => !injury.type);
if (incompleteInjury) {
    alert("Please select an injury type for each selected injury point.");
    return;
}



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
               // Save injury report in Firestore with injury points and types
               await firebase.firestore().collection('injuries').add({
                uid: userUID,
                injury_id: injuryId,
                patient_name: name,
                ski_run: skiRun,
                rescuer_name: rescuerName,
                birth_date: birthDate,
                medical_comment: medicalComment,
                ski_card_photo: photoURL,
                injury_points: selectedInjuryPoints,  // Include the points with side and types
                rescuer_signature: signatureURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            


                injuryForm.reset(); // Reset the form after submission
                signaturePad.clear(); // Clear the signature pad after submission
                signatureModal.hide(); // Hide the signature modal
                const userDoc = await db.collection('users').doc(userUID).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin') {
                        window.location.href = "admin_panel.html";  // Redirect to admin panel
                    } else {
                        window.location.href = "user_panel.html";   // Redirect to user panel
                    }
                }
            } catch (error) {
                console.error('Error submitting injury:', error);
                alert('Failed to submit injury.');
            }
        } else {
            alert('Please provide a signature.');
        }
    } else {
        // If the user is not authenticated
        alert("You need to be logged in to submit this form.");
        window.location.href = "index.html";  // Optionally redirect to login page if not logged in
    }
});
