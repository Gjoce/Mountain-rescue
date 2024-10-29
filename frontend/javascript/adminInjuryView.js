let currentPage = 1;
const limit = 5;

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

async function checkAdminAuth() {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    window.location.href = "index.html";
    return false;
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

    if (!response.ok || !data.isAdmin) {
      window.location.href = "index.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    alert("An error occurred while checking access. Please try again.");
    window.location.href = "index.html";
    return false;
  }
}

function fetchInjuries(page = 1) {
  checkAdminAuth();
  fetch(
    `http://localhost:3000/api/injuries/admin?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("authToken"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const injuriesList = document.getElementById("injuries-list");
      injuriesList.innerHTML = "";

      if (data.data && data.data.length > 0) {
        data.data.forEach((injury) => {
          const timestamp = injury.timestamp
            ? new Date(injury.timestamp._seconds * 1000).toLocaleString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour12: false,
                }
              )
            : "N/A";

          const row = document.createElement("tr");

          const actionContent =
            !injury.status || injury.status === "pending"
              ? `  
          <div class="button-container">
            <button class="btn btn-success btn-sm" onclick="approveInjury(event, '${injury.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectInjury(event, '${injury.id}')">Reject</button>
          </div>
        `
              : injury.status === "approved"
              ? "Injury Approved"
              : "Injury Rejected";

          row.innerHTML = `
          <td>${injury.patient_name}</td>
          <td>${injury.rescuer_name}</td>
          <td>${timestamp}</td>
          <td id="action-${injury.id}">
            ${actionContent}
          </td>
        `;

          row.addEventListener("click", () => {
            showInjuryDetailsModal(injury);
          });

          injuriesList.appendChild(row);
        });
      } else {
        injuriesList.innerHTML = `<tr><td colspan="4">No injuries found.</td></tr>`;
      }

      updatePagination(data.currentPage, data.totalPages);
    })
    .catch((error) => console.error("Error fetching injuries:", error));
}

function generatePDF(injuryId) {
  db.collection("injuries")
    .doc(injuryId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        alert("No injury found with the provided ID");
        return;
      }

      const injury = doc.data();
      const {
        patient_name,
        birth_date,
        ski_run,
        rescuer_name,
        timestamp,
        ski_card_photo,
        rescuer_signature,
        injury_points,
        medical_comment,
        admin_signature,
        admin_name,
      } = injury;

      const { jsPDF } = window.jspdf;
      const pdfDoc = new jsPDF();

      pdfDoc.setFontSize(18);
      pdfDoc.text("Injury Report", 10, 10);
      pdfDoc.setFontSize(12);

      pdfDoc.text(`Patient Name: ${patient_name}`, 10, 20);
      pdfDoc.text(`Birth Date: ${birth_date}`, 10, 30);
      pdfDoc.text(`Ski Run: ${ski_run}`, 10, 40);
      pdfDoc.text(`Rescuer: ${rescuer_name}`, 10, 50);
      pdfDoc.text(`ID of Injury: ${injuryId}`, 10, 60);

      const formattedTimestamp = timestamp
        ? new Date(timestamp.seconds * 1000).toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour12: false,
          })
        : "N/A";

      pdfDoc.text(`Timestamp: ${formattedTimestamp}`, 10, 70);

      pdfDoc.text("Medical Information", 10, 80);

      const injuryPointsText =
        Array.isArray(injury_points) && injury_points.length > 0
          ? injury_points
              .map(
                (pt, i) =>
                  `${i + 1}. (side: ${pt.side}) (injury point: ${
                    pt.point
                  }) (type: ${pt.type})`
              )
              .join("\n")
          : "No injury points available";

      pdfDoc.text(`Injured:\n${injuryPointsText}`, 10, 90);
      pdfDoc.text(`Medical Comment: ${medical_comment}`, 10, 100);

      const addImageToPDF = (imageUrl, yPosition) => {
        return fetch(imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
              reader.onloadend = () => {
                pdfDoc.addImage(reader.result, "JPEG", 10, yPosition, 50, 50);
                resolve();
              };
              reader.onerror = () => reject("Error reading image");
              reader.readAsDataURL(blob);
            });
          });
      };

      const promises = [];
      if (ski_card_photo) promises.push(addImageToPDF(ski_card_photo, 120));
      if (rescuer_signature)
        promises.push(addImageToPDF(rescuer_signature, 180));

      Promise.all(promises)
        .then(() => {
          if (injury.status === "approved" && admin_signature && admin_name) {
            pdfDoc.addPage();
            pdfDoc.text("Admin Information", 10, 10);
            pdfDoc.text(`Admin Name: ${admin_name}`, 10, 20);

            return fetch(admin_signature)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                  reader.onloadend = () => {
                    pdfDoc.addImage(reader.result, "PNG", 10, 30, 50, 50);
                    resolve();
                  };
                  reader.onerror = () =>
                    reject("Error reading admin signature");
                  reader.readAsDataURL(blob);
                });
              });
          }
        })
        .then(() => {
          const dateGenerated = new Date().toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour12: false,
          });
          pdfDoc.text(
            `Generated on: ${dateGenerated}`,
            10,
            pdfDoc.internal.pageSize.height - 10
          );
          pdfDoc.save(`${patient_name}_Injury_Report.pdf`);
        })
        .catch((error) => {
          console.error("Error adding images to PDF:", error);
          alert("Could not generate PDF with images.");
        });
    })
    .catch((error) => {
      console.error("Error fetching injury details:", error);
      alert("Could not fetch injury details for PDF generation.");
    });
}

document.querySelector(".generate-pdf").addEventListener("click", function () {
  const modalDetails = document.getElementById("modal-injury-details");
  const injuryId = modalDetails.getAttribute("data-injury-id");
  if (!injuryId) {
    alert("No injury ID found. Please select an injury.");
    return;
  }
  generatePDF(injuryId);
});

function approveInjury(event, injuryId) {
  event.stopPropagation();

  const signatureModal = new bootstrap.Modal(
    document.getElementById("signatureModal")
  );
  const canvas = document.getElementById("signaturePad");
  const signaturePad = new SignaturePad(canvas);

  signatureModal.show();

  const confirmBtn = document.getElementById("confirm-btn");
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      if (!signaturePad.isEmpty()) {
        const adminSignatureData = signaturePad.toDataURL();
        const adminName = localStorage.getItem("userName");

        fetch(`http://localhost:3000/api/injuries/${injuryId}/approve`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("authToken"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_signature: adminSignatureData,
            admin_name: adminName,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const actionCell = document.getElementById(`action-${injuryId}`);
              actionCell.innerHTML = "Injury Approved";

              const adminSignatureElement =
                document.getElementById("adminSignature");
              const adminNameElement = document.getElementById("adminName");

              if (adminSignatureElement && adminNameElement) {
                adminSignatureElement.style.display = "block";
                adminNameElement.innerHTML = `Approved by: ${adminName}`;
              }
            } else {
              alert("Error approving injury: " + data.error);
            }
            signatureModal.hide();
            signaturePad.clear();
          })
          .catch((error) => {
            console.error("Error saving signature:", error);
            alert("Error saving signature.");
          });
      } else {
        alert("Please provide a signature before confirming.");
      }
    };
  }

  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) {
    clearBtn.onclick = function () {
      signaturePad.clear();
    };
  }
}

function rejectInjury(event, injuryId) {
  event.stopPropagation();
  fetch(`http://localhost:3000/api/injuries/${injuryId}/reject`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("authToken"),
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const actionCell = document.getElementById(`action-${injuryId}`);
        actionCell.innerHTML = "Injury Rejected";
      } else {
        alert("Error rejecting injury");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function showInjuryDetailsModal(injury) {
  const modalDetails = document.getElementById("modal-injury-details");

  modalDetails.setAttribute("data-injury-id", injury.id);

  const injuryPoints = Array.isArray(injury.injury_points)
    ? injury.injury_points
        .map(
          (inj, index) =>
            `${index + 1}. (side: ${inj.side}) (injury point: ${
              inj.point
            }) (type: ${inj.type})`
        )
        .join("<br>")
    : "No injury points available";

  const adminSignatureDisplay =
    injury.status === "approved" && injury.admin_signature
      ? `<strong>Admin Signature:</strong> 
       <a href="${injury.admin_signature}" target="_blank">
         <img src="${injury.admin_signature}" alt="Admin Signature" width="100">
       </a><br>
       <strong id="adminName">Approved by: ${injury.admin_name}</strong><br>`
      : "";

  modalDetails.innerHTML = `
    <div style="text-align: center;">
      <strong>Basic Information</strong><br>
    </div>
    <strong>Patient Name:</strong> ${injury.patient_name} <br>
    <strong>Birth Date:</strong> ${injury.birth_date} <br>
    <strong>Ski Run:</strong> ${injury.ski_run} <br>
    <strong>Rescuer:</strong> ${injury.rescuer_name}<br>
    <strong>ID of Injury:</strong> ${injury.id}<br>
    <strong>Timestamp:</strong> ${new Date(
      injury.timestamp._seconds * 1000
    ).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
    })}<br>

    <hr>

    <div style="text-align: center;">
      <strong>Medical Information</strong><br>
    </div>
    <strong>Injured:</strong><br> ${injuryPoints} <br>
    <strong>Medical Comment:</strong> ${injury.medical_comment} <br>

    <hr>

    <strong>Ski Card Photo:</strong>
    <a href="${injury.ski_card_photo}" target="_blank">
      <img src="${injury.ski_card_photo}" alt="Ski Card Photo" width="100">
    </a><br>

    <strong>Rescuer Signature:</strong>
    <a href="${injury.rescuer_signature}" target="_blank">
      <img src="${
        injury.rescuer_signature
      }" alt="Rescuer Signature" width="100">
    </a><br>
    <br>
    ${adminSignatureDisplay}
  `;

  const injuryModal = new bootstrap.Modal(
    document.getElementById("injuryDetailsModal")
  );
  injuryModal.show();
}

function updatePagination(currentPage, totalPages) {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = "";

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.innerHTML = "Previous";
    prevButton.onclick = () => fetchInjuries(currentPage - 1);
    paginationElement.appendChild(prevButton);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerHTML = i;
    pageButton.className = i === currentPage ? "active-page" : "";
    pageButton.onclick = () => fetchInjuries(i);
    paginationElement.appendChild(pageButton);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.innerHTML = "Next";
    nextButton.onclick = () => fetchInjuries(currentPage + 1);
    paginationElement.appendChild(nextButton);
  }
}

fetchInjuries(currentPage);
