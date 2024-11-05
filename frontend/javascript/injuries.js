const injuryPoints = document.querySelectorAll(".injury-point");
const injuryTypeContainer = document.getElementById("injury-type-dropdowns");

const injuryTypes = `
    <label class="form-label">Izberite tip povrede:</label>
    <select class="form-select" name="injury_type">
        <option value="" disabled selected>Tip povrede</option>
        <option value="Uganuće">Uganuće</option>
        <option value="Prelom">Prelom</option>
        <option value="Iščašenje">Iščašenje</option>
        <option value="Posekotina">Posekotina</option>
        <option value="Modrica">Modrica</option>

    </select>
`;

injuryPoints.forEach((point) => {
  const label = document.querySelector(`label[for="${point.id}"]`);

  point.addEventListener("change", function () {
    const injuryId = point.id;

    if (point.checked) {
      if (label) {
        label.style.fontWeight = "bold";
      }

      const div = document.createElement("div");
      div.className = "mb-3 injury-type";
      div.id = `dropdown-${injuryId}`;
      div.innerHTML =
        `<label for="${injuryId}-injury">${point.value} :</label>` +
        injuryTypes;
      injuryTypeContainer.appendChild(div);
    } else {
      if (label) {
        label.style.fontWeight = "normal";
      }

      document.getElementById(`dropdown-${injuryId}`).remove();
    }
  });
});

const firebaseConfig = {
  apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
  authDomain: "mountain-rescue-863ea.firebaseapp.com",
  projectId: "mountain-rescue-863ea",
  storageBucket: "mountain-rescue-863ea.appspot.com",
  messagingSenderId: "792489098952",
  appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd",
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Authenticated user:", user.email);
  } else {
    alert("You need to log in first to submit the form.");
    window.location.href = "login.html";
  }
});

const submitBtn = document.getElementById("submitBtn");
const injuryForm = document.getElementById("injuryForm");
const signatureModal = new bootstrap.Modal(
  document.getElementById("signatureModal")
);
const canvas = document.getElementById("signaturePad");
const signaturePad = new SignaturePad(canvas);

let capturedPhotoBlob;

injuryForm.addEventListener("submit", function (e) {
  e.preventDefault();
  signatureModal.show();
});

document.getElementById("clear-btn").addEventListener("click", function () {
  signaturePad.clear();
});

document
  .getElementById("confirmSignature")
  .addEventListener("click", async function () {
    const user = firebase.auth().currentUser;
    submitBtn.style.display = "none";

    if (user) {
      if (!signaturePad.isEmpty()) {
        const name = document.getElementById("name").value;
        const skiRun = document.getElementById("ski_run").value;
        const birthDate = document.getElementById("birth_date").value;
        const medicalComment = document.getElementById("medical_comment").value;

        const rescuerName = localStorage.getItem("userName");
        const userUID = user.uid;

        const selectedInjuryPoints = Array.from(
          document.querySelectorAll('input[name="injury_points"]:checked')
        ).map((checkbox) => {
          const injuryId = checkbox.id;
          const injuryTypeDropdown = document.querySelector(
            `#dropdown-${injuryId} select`
          );
          const injuryType = injuryTypeDropdown
            ? injuryTypeDropdown.value
            : null;

          const side = injuryId.endsWith("L")
            ? "L"
            : injuryId.endsWith("R")
            ? "D"
            : "Center";
          return {
            point: checkbox.value,
            side: side,
            type: injuryType,
          };
        });

        const incompleteInjury = selectedInjuryPoints.some(
          (injury) => !injury.type
        );
        if (incompleteInjury) {
          alert("Please select an injury type for each selected injury point.");
          return;
        }

        const signatureDataURL = signaturePad.toDataURL();
        const skiCardPhoto = document.getElementById("ski_card_photo").files[0];

        try {
          const injuryId = db.collection("injuries").doc().id;

          const photoRef = firebase
            .storage()
            .ref(`injuries/${rescuerName}/photos/${injuryId}_ski_card.jpg`);
          const photoSnapshot = await photoRef.put(skiCardPhoto);
          const photoURL = await photoSnapshot.ref.getDownloadURL();

          const signatureBlob = await (await fetch(signatureDataURL)).blob();
          const signatureRef = firebase
            .storage()
            .ref(
              `injuries/${rescuerName}/signatures/${injuryId}_signature.png`
            );
          const signatureSnapshot = await signatureRef.put(signatureBlob);
          const signatureURL = await signatureSnapshot.ref.getDownloadURL();

          await firebase.firestore().collection("injuries").add({
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
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });

          injuryForm.reset();
          signaturePad.clear();
          signatureModal.hide();
          const userDoc = await db.collection("users").doc(userUID).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.role === "admin") {
              window.location.href = "admin_panel.html";
            } else {
              window.location.href = "user_panel.html";
            }
          }
        } catch (error) {
          console.error("Error submitting injury:", error);
          alert("Failed to submit injury.");
        }
      } else {
        alert("Please provide a signature.");
      }
    } else {
      alert("You need to be logged in to submit this form.");
      window.location.href = "index.html";
    }
  });
