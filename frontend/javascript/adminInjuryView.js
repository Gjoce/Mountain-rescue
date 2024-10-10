let currentPage = 1;
const limit = 5;

function fetchInjuries(page = 1) {
  fetch(`http://localhost:3000/api/injuries/admin?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    }
  })
  .then(response => response.json())
  .then(data => {
    const injuriesList = document.getElementById('injuries-list');
    injuriesList.innerHTML = ''; // Clear previous entries

    console.log('Fetched data:', data); // Log for debugging

    if (data.data && data.data.length > 0) {
      data.data.forEach(injury => {
        const timestamp = injury.timestamp ? new Date(injury.timestamp._seconds * 1000).toLocaleString() : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${injury.id}</td>
          <td>${injury.rescuer_name}</td>
          <td>${timestamp}</td>
        `;

        // Create the hidden details row
        const detailsRow = document.createElement('tr');
        detailsRow.classList.add('details-row');
        detailsRow.innerHTML = `
          <td colspan="3">
            <strong>Patient Name:</strong> ${injury.patient_name} <br>
            <strong>Injury Points:</strong> ${injury.injury_points} <br>
            <strong>Medical Comment:</strong> ${injury.medical_comment} <br>
            <strong>Birth Date:</strong> ${injury.birth_date} <br>
            <strong>Ski Run:</strong> ${injury.ski_run} <br>
            <strong>Ski Card Photo:</strong>
            <a href="${injury.ski_card_photo}" target="_blank">
              <img src="${injury.ski_card_photo}" alt="Ski Card Photo" width="100">
            </a>
            <br>
            <strong>Rescuer Signature:</strong>
            <a href="${injury.rescuer_signature}" target="_blank">
              <img src="${injury.rescuer_signature}" alt="Rescuer Signature" width="100">
            </a>
            <br>
            <button class="generate-pdf">Generate PDF</button>
          </td>
        `;

        injuriesList.appendChild(row);
        injuriesList.appendChild(detailsRow);

        // Toggle details visibility on row click
        row.addEventListener('click', () => {
          detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
        });

        // Handle PDF generation
        const pdfButton = detailsRow.querySelector('.generate-pdf');
        pdfButton.addEventListener('click', () => generatePDF(injury));
      });
    } else {
      injuriesList.innerHTML = `<tr><td colspan="3">No injuries found.</td></tr>`;
    }

    // Update pagination controls
    updatePagination(data.currentPage, data.totalPages);
  })
  .catch(error => console.error('Error fetching injuries:', error));
}

// Generate PDF function
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
  doc.text(`Injury Points: ${injury.injury_points}`, 20, 90);
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



// Call this function to update the pagination buttons (for example)
function updatePagination(currentPage, totalPages) {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = ''; // Clear previous pagination

  // Create previous button if applicable
  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML = 'Previous';
    prevButton.onclick = () => fetchInjuries(currentPage - 1);
    paginationElement.appendChild(prevButton);
  }

  // Generate numbered page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerHTML = i;
    pageButton.className = (i === currentPage) ? 'active-page' : ''; // Highlight current page
    pageButton.onclick = () => fetchInjuries(i); // Fetch injuries for the clicked page
    paginationElement.appendChild(pageButton);
  }

  // Create next button if applicable
  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next';
    nextButton.onclick = () => fetchInjuries(currentPage + 1);
    paginationElement.appendChild(nextButton);
  }
}

fetchInjuries(currentPage);
