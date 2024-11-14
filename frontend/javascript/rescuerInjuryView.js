let currentPage = 1;
const limit = 5;
const userId = localStorage.getItem("userUID");

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
    return false;
  }

  try {
    const response = await fetch(
      `https://mountain-rescue.onrender.com/api/login`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + authToken,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.isAdmin) {
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

function fetchRescuerInjuries(page = 1) {
  checkAuth();
  fetch(
    `https://mountain-rescue.onrender.com/api/injuries/${userId}?page=${page}&limit=${limit}`,
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
            injury.status === "approved"
              ? "Povreda Prihvaćena"
              : injury.status === "rejected"
              ? "Povreda Odbijena"
              : "Na Čekanju";

          row.innerHTML = `
          <td>${injury.patient_name}</td>
          <td>${injury.ski_run}</td>
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
        injuriesList.innerHTML = `<tr><td colspan="4">Nisu pronađene povrede</td></tr>`;
      }

      updatePagination(data.currentPage, data.totalPages);
    })
    .catch((error) => console.error("Error fetching injuries:", error));
}

function showInjuryDetailsModal(injury) {
  const modalDetails = document.getElementById("modal-injury-details");

  modalDetails.setAttribute("data-injury-id", injury.id);

  const injuryPoints = Array.isArray(injury.injury_points)
    ? injury.injury_points
        .map(
          (inj, index) =>
            `${index + 1}. (strana: ${inj.side}) (povredene tačke: ${
              inj.point
            }) (tip: ${inj.type})`
        )
        .join("<br>")
    : "No injury points available";

  const adminSignatureDisplay =
    injury.status === "approved" && injury.admin_signature
      ? `<strong>Podpis nadređenog:</strong> 
       <a href="${injury.admin_signature}" target="_blank">
         <img src="${injury.admin_signature}" alt="Podpis Nadrednog" width="100">
       </a><br>
       <strong>Prihvaćeno od:</strong> ${injury.admin_name}<br>`
      : "";

  modalDetails.innerHTML = `
    <div style="text-align: center;">
      <strong>Osnovne informacije</strong><br>
    </div>
    <strong>Ime pacienta:</strong> ${injury.patient_name} <br>
    <strong>Datum rođenja:</strong> ${injury.birth_date} <br>
    <strong>Skijaška staza:</strong> ${injury.ski_run} <br>
    <strong>Spasilac:</strong> ${injury.rescuer_name}<br>
    <strong>Vreme unosa:</strong> ${new Date(
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
      <strong>Medicinske Informacije</strong><br>
    </div>
    <strong>Povređeni:</strong><br> ${injuryPoints} <br>
    <div style="max-width: 100%; overflow-wrap: break-word; word-wrap: break-word;">
  <strong>Komentar:</strong> ${injury.medical_comment} <br>
  <hr>
</div>


    <strong>Fotografija skijaške karte:</strong>
    <a href="${injury.ski_card_photo}" target="_blank">
      <img src="${
        injury.ski_card_photo
      }" alt="Fotografija skijaške karte" width="100">
    </a><br>

    <strong>Podpis spasioca:</strong>
    <a href="${injury.rescuer_signature}" target="_blank">
      <img src="${injury.rescuer_signature}" alt="Podpis spasioca" width="100">
    </a><br>
    <br>
    <hr>
    ${adminSignatureDisplay}
  `;

  const injuryModal = new bootstrap.Modal(
    document.getElementById("injuryDetailsModal")
  );
  injuryModal.show();

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
          ski_run,
          rescuer_name,
          timestamp,
          rescuer_signature,
          ski_card_photo,
          injury_points,
          medical_comment,
          admin_signature,
          admin_name,
          status,
        } = injury;

        const { jsPDF } = window.jspdf;
        const pdfDoc = new jsPDF();

        const logoImg = new Image();
        logoImg.src = "./images/logo.png";
        logoImg.onload = () => {
          pdfDoc.addImage(logoImg, "PNG", 10, 5, 40, 40);

          // Set font to Helvetica (supports extended characters)
          pdfDoc.setFont("helvetica");
          pdfDoc.setFontSize(14);
          pdfDoc.text("SPASILACKA SLUZBA JAHORINA", 60, 20);
          pdfDoc.text("POVREDNI LIST", 60, 30);

          // Injury Information Section
          pdfDoc.setFontSize(12);
          pdfDoc.text("PODATKE O POVREDI", 10, 50);
          pdfDoc.text(`Pacient: ${patient_name}`, 10, 60);
          pdfDoc.text(`Na stazi: ${ski_run}`, 10, 70);
          pdfDoc.text(`Spasilac: ${rescuer_name}`, 10, 80);

          pdfDoc.text(
            `Pocetak povrede: ${new Date(
              injury.timestamp.seconds * 1000
            ).toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour12: false,
            })}`,
            10,
            90
          );

          pdfDoc.text("Fotografija skijaške karte", 110, 50);

          pdfDoc.text("MEDICINSKE INFORMACIJE", 10, 120);

          let yPosition = 130;
          pdfDoc.text("Povrede:", 10, yPosition);

          if (Array.isArray(injury_points) && injury_points.length > 0) {
            injury_points.forEach((pt, i) => {
              yPosition += 10;
              pdfDoc.text(
                `${i + 1}. (strana: ${pt.side}) (povredene tacke: ${
                  pt.point
                }) (tip: ${pt.type})`,
                10,
                yPosition
              );
            });
          } else {
            yPosition += 10;
            pdfDoc.text("Nema dostupnih podataka o povredama", 10, yPosition);
          }
          const pageWidth = pdfDoc.internal.pageSize.width;
          const textWidth = pageWidth - 2 * 10;

          yPosition += 20;
          pdfDoc.text("Medicinski komentar:", 10, yPosition);

          yPosition += 10;

          pdfDoc.text(medical_comment, 10, yPosition, {
            maxWidth: textWidth,
          });

          pdfDoc.text("Spasilac:", 60, pdfDoc.internal.pageSize.height - 30);

          const addImageToPDF = (imageUrl, x, y, width, height) => {
            return fetch(imageUrl)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                  reader.onloadend = () => {
                    pdfDoc.addImage(reader.result, "JPEG", x, y, width, height);
                    resolve();
                  };
                  reader.onerror = () => reject("Error reading image");
                  reader.readAsDataURL(blob);
                });
              });
          };

          const promises = [];
          if (ski_card_photo)
            promises.push(addImageToPDF(ski_card_photo, 110, 55, 60, 80));
          if (rescuer_signature)
            promises.push(
              addImageToPDF(
                rescuer_signature,
                70,
                pdfDoc.internal.pageSize.height - 35,
                50,
                20
              ).then(() => {
                pdfDoc.text(
                  rescuer_name,
                  80,
                  pdfDoc.internal.pageSize.height - 20
                );
              })
            );
          if (status === "approved" && admin_signature && admin_name) {
            pdfDoc.text("Odobril:", 130, pdfDoc.internal.pageSize.height - 30);
            promises.push(
              addImageToPDF(
                admin_signature,
                150,
                pdfDoc.internal.pageSize.height - 35,
                50,
                20
              ).then(() => {
                pdfDoc.text(
                  admin_name,
                  160,
                  pdfDoc.internal.pageSize.height - 20
                );
              })
            );
          }

          Promise.all(promises)
            .then(() => {
              const dateGenerated = new Date().toLocaleDateString("en-GB");
              pdfDoc.text(
                `Datum: ${dateGenerated}`,
                10,
                pdfDoc.internal.pageSize.height - 30
              );

              pdfDoc.save(`${patient_name}_Injury_Report.pdf`);
            })
            .catch((error) => {
              console.error("Error adding images to PDF:", error);
              alert("Could not generate PDF with images.");
            });
        };
      })
      .catch((error) => {
        console.error("Error fetching injury details:", error);
        alert("Could not fetch injury details for PDF generation.");
      });
  }

  document
    .querySelector(".generate-pdf")
    .addEventListener("click", function () {
      const modalDetails = document.getElementById("modal-injury-details");
      const injuryId = modalDetails.getAttribute("data-injury-id");
      if (!injuryId) {
        alert("No injury ID found. Please select an injury.");
        return;
      }
      generatePDF(injuryId);
    });
}

fetchRescuerInjuries(currentPage);

function updatePagination(currentPage, totalPages) {
  const paginationElement = document.querySelector(".pagination");
  paginationElement.innerHTML = "";

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.innerHTML = "Nazad";
    prevButton.onclick = () => fetchRescuerInjuries(currentPage - 1);
    paginationElement.appendChild(prevButton);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerHTML = i;
    pageButton.className = i === currentPage ? "active-page" : "";
    pageButton.onclick = () => fetchRescuerInjuries(i);
    paginationElement.appendChild(pageButton);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.innerHTML = "Napred";
    nextButton.onclick = () => fetchRescuerInjuries(currentPage + 1);
    paginationElement.appendChild(nextButton);
  }
}

fetchRescuerInjuries(currentPage);
