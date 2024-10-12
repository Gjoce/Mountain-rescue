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
        
        // Conditional rendering for action buttons
        // Show buttons if status is 'pending' or doesn't exist
        const actionContent = !injury.status || injury.status === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="approveInjury(event, '${injury.id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectInjury(event, '${injury.id}')">Reject</button>
        ` : injury.status === 'approved' ? 'Injury Approved' : 'Injury Rejected';

        row.innerHTML = `
          <td>${injury.patient_name}</td>
          <td>${injury.rescuer_name}</td>
          <td>${timestamp}</td>
          <td id="action-${injury.id}">
            ${actionContent}
          </td>
        `;

        // Handle row click to show modal with injury details
        row.addEventListener('click', () => {
          showInjuryDetailsModal(injury);
        });

        injuriesList.appendChild(row);
      });
    } else {
      injuriesList.innerHTML = `<tr><td colspan="4">No injuries found.</td></tr>`;
    }

    updatePagination(data.currentPage, data.totalPages);
  })
  .catch(error => console.error('Error fetching injuries:', error));
}

function approveInjury(event, injuryId) {
  event.stopPropagation(); // Prevent row click event from firing
  fetch(`http://localhost:3000/api/injuries/${injuryId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the action column to show approved status
      const actionCell = document.getElementById(`action-${injuryId}`);
      actionCell.innerHTML = 'Injury Approved';
    } else {
      alert('Error approving injury');
    }
  })
  .catch(error => console.error('Error:', error));
}

function rejectInjury(event, injuryId) {
  event.stopPropagation(); // Prevent row click event from firing
  fetch(`http://localhost:3000/api/injuries/${injuryId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the action column to show rejected status
      const actionCell = document.getElementById(`action-${injuryId}`);
      actionCell.innerHTML = 'Injury Rejected';
    } else {
      alert('Error rejecting injury');
    }
  })
  .catch(error => console.error('Error:', error));
}


// Show injury details in a modal
function showInjuryDetailsModal(injury) {
  const modalDetails = document.getElementById('modal-injury-details');

  const injuryPoints = Array.isArray(injury.injury_points)
    ? injury.injury_points.map((inj, index) => `${index + 1}. (side: ${inj.side}) (injury point: ${inj.point}) (type: ${inj.type})`).join('<br>')
    : injury.injury_points;

  modalDetails.innerHTML = `
    <div style="text-align: center;">
      <strong>Basic Information</strong><br>
    </div>
      <strong>Patient Name:</strong> ${injury.patient_name} <br>
      <strong>Birth Date:</strong> ${injury.birth_date} <br>
      <strong>Ski Run:</strong> ${injury.ski_run} <br>
      <strong>Rescuer:</strong> ${injury.rescuer_name}<br>
      <strong>ID of Injury:</strong> ${injury.id}<br>
      <strong>Timestamp:</strong> ${new Date(injury.timestamp._seconds * 1000).toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false
        })}<br>
    
    <hr> <!-- Separation line after basic information -->
    
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
      <img src="${injury.rescuer_signature}" alt="Rescuer Signature" width="100">
    </a><br>
  `;

  const injuryModal = new bootstrap.Modal(document.getElementById('injuryDetailsModal'));
  injuryModal.show();
}

// Update the pagination buttons
function updatePagination(currentPage, totalPages) {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = '';

  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML = 'Previous';
    prevButton.onclick = () => fetchInjuries(currentPage - 1);
    paginationElement.appendChild(prevButton);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerHTML = i;
    pageButton.className = (i === currentPage) ? 'active-page' : '';
    pageButton.onclick = () => fetchInjuries(i);
    paginationElement.appendChild(pageButton);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next';
    nextButton.onclick = () => fetchInjuries(currentPage + 1);
    paginationElement.appendChild(nextButton);
  }
}

// Initialize
fetchInjuries(currentPage);
