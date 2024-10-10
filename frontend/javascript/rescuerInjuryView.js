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
    injuriesList.innerHTML = ''; // Clear the table before appending new data

    // Log data for debugging
    console.log('Fetched rescuer data:', data);

    // Populate the table with the injury data
    if (data.data && data.data.length > 0) {
      data.data.forEach(injury => {
        const timestamp = injury.timestamp ? new Date(injury.timestamp._seconds * 1000).toLocaleString() : 'N/A';

        // Create the main row
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${injury.id}</td>
          <td>${injury.ski_run}</td>
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
          </td>
        `;

        injuriesList.appendChild(row);
        injuriesList.appendChild(detailsRow);

        // Toggle display of details row on click
        row.addEventListener('click', () => {
          detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
        });
      });
    } else {
      injuriesList.innerHTML = `<tr><td colspan="3">No injuries found.</td></tr>`;
    }

    // Update pagination
    updatePagination(data.currentPage, data.totalPages);
  })
  .catch(error => console.error('Error fetching rescuer injuries:', error));
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
