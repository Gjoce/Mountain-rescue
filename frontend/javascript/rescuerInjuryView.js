let currentPage = 1;
const limit = 5;
const userId = localStorage.getItem('userUID'); // Get UID from local storage

function fetchRescuerInjuries(page = 1) {
  fetch(`http://localhost:3000/api/injuries/${userId}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    }
  })
  .then(response => response.json())
  .then(data => {
    const injuriesList = document.getElementById('injuries-list');
    injuriesList.innerHTML = ''; // Clear previous entries

    if (data.data && data.data.length > 0) {
      data.data.forEach(injury => {
        const timestamp = injury.timestamp 
        ? new Date(injury.timestamp._seconds * 1000).toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false // Set this to false for 24-hour format
          })
        : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${injury.patient_name}</td>
          <td>${injury.ski_run}</td>
          <td>${timestamp}</td>
        `;

        // Handle row click to show modal with injury details
        row.addEventListener('click', () => {
          showInjuryDetailsModal(injury);
        });

        injuriesList.appendChild(row);
      });
    } else {
      injuriesList.innerHTML = `<tr><td colspan="3">No injuries found.</td></tr>`;
    }

    updatePagination(data.currentPage, data.totalPages);
  })
  .catch(error => console.error('Error fetching injuries:', error));
}

function showInjuryDetailsModal(injury) {
  const modalDetails = document.getElementById('modal-injury-details');

  // Format injury_points array to display in the desired format: (side: ) (injury point: ) (type: )
  const injuryPoints = Array.isArray(injury.injury_points)
    ? injury.injury_points.map((inj, index) => `${index + 1}. (side: ${inj.side}) (injury point: ${inj.point}) (type: ${inj.type})`).join('<br>')
    : (typeof injury.injury_points === 'object' && injury.injury_points !== null)
    ? JSON.stringify(injury.injury_points)
    : injury.injury_points;

  // Center the basic information
  modalDetails.innerHTML = `
    <div style="text-align: center;">
      <strong>Basic Information</strong><br>
    </div>
      <strong>Patient Name:</strong> ${injury.patient_name} <br>
      <strong>Birth Date:</strong> ${injury.birth_date} <br>
      <strong>Ski Run:</strong> ${injury.ski_run} <br>
      <strong>Rescuer:</strong> ${injury.rescuer_name}<br>
      <strong>Timestamp:</strong> ${new Date(injury.timestamp._seconds * 1000).toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false // 24-hour format
        })}<br>
    
    <hr> <!-- Separation line after basic information -->
    
     <div style="text-align: center;">
      <strong>Medical Information</strong><br>
    </div>
    <strong>Injured:</strong><br> ${injuryPoints} <br> <!-- Display formatted injuries -->
    <strong>Medical Comment:</strong> ${injury.medical_comment} <br>

    <hr> <!-- Separation line after medical information -->
    
    <strong>Ski Card Photo:</strong>
    <a href="${injury.ski_card_photo}" target="_blank">
      <img src="${injury.ski_card_photo}" alt="Ski Card Photo" width="100">
    </a><br>
    <strong>Rescuer Signature:</strong>
    <a href="${injury.rescuer_signature}" target="_blank">
      <img src="${injury.rescuer_signature}" alt="Rescuer Signature" width="100">
    </a><br>
    <strong>Rescuer:</strong> ${injury.rescuer_name}<br>
    
  `;

  // Show the modal
  const injuryModal = new bootstrap.Modal(document.getElementById('injuryDetailsModal'));
  injuryModal.show();

  // Handle PDF generation
  const pdfButton = modalDetails.querySelector('.generate-pdf');
  pdfButton.addEventListener('click', () => generatePDF(injury));
}

// Generate PDF function with formal structure
function generatePDF(injury) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set the document title
  doc.setFontSize(18);
  doc.text('Injury Report', 105, 20, null, null, 'center');

  // Draw a line under the title
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Section 1: Patient Information
  doc.setFontSize(12);
  doc.text('Patient Information:', 20, 40);

  doc.setFontSize(10);
  doc.text(`Patient Name: ${injury.patient_name}`, 20, 50);
  doc.text(`Birth Date: ${injury.birth_date}`, 20, 60);

  // Section 2: Injury Details
  doc.setFontSize(12);
  doc.text('Injury Details:', 20, 80);

  doc.setFontSize(10);
  doc.text(`Injury Points: ${formatInjuryPoints(injury.injury_points)}`, 20, 90);
  doc.text(`Medical Comment: ${injury.medical_comment}`, 20, 100);
  doc.text(`Ski Run: ${injury.ski_run}`, 20, 110);

  // Section 3: Photos (links to images)
  doc.setFontSize(12);
  doc.text('Additional Information:', 20, 130);

  doc.setFontSize(10);
  if (injury.ski_card_photo) {
    doc.text('Ski Card Photo: ', 20, 140);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink('View Photo', 50, 140, { url: injury.ski_card_photo });
    doc.setTextColor(0, 0, 0); // Reset color to black
  } else {
    doc.text('Ski Card Photo: N/A', 20, 140);
  }

  if (injury.rescuer_signature) {
    doc.text('Rescuer Signature: ', 20, 150);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink('View Signature', 55, 150, { url: injury.rescuer_signature });
    doc.setTextColor(0, 0, 0); // Reset color to black
  } else {
    doc.text('Rescuer Signature: N/A', 20, 150);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 105, 280, null, null, 'center');

  // Save the PDF
  doc.save(`Injury_Report_${injury.id}.pdf`);
}

// Function to handle pagination
function updatePagination(currentPage, totalPages) {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = ''; // Clear previous pagination

  // Create previous button if applicable
  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML = 'Previous';
    prevButton.onclick = () => fetchRescuerInjuries(currentPage - 1);
    paginationElement.appendChild(prevButton);
  }

  // Generate numbered page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerHTML = i;
    pageButton.className = (i === currentPage) ? 'active-page' : ''; // Highlight current page
    pageButton.onclick = () => fetchRescuerInjuries(i);
    paginationElement.appendChild(pageButton);
  }

  // Create next button if applicable
  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next';
    nextButton.onclick = () => fetchRescuerInjuries(currentPage + 1);
    paginationElement.appendChild(nextButton);
  }
}

// Fetch initial data
fetchRescuerInjuries(currentPage);
