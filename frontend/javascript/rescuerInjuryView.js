// Fetch injuries for this user (rescuer)
const userId = localStorage.getItem('userUID'); // Replace with actual logic to get UID
fetch(`http://localhost:3000/api/injuries/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(response => response.json())
.then(data => {
  const injuriesList = document.getElementById('injuries-list');

  data.forEach(injury => {
    const timestamp = injury.timestamp ? new Date(injury.timestamp._seconds * 1000).toLocaleString() : 'N/A';

    // Create the basic row (Injury ID, Ski Run, Timestamp)
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
        <strong>Injury Points:</strong> ${injury.injury_points} <br>
        <strong>Medical Comment:</strong> ${injury.medical_comment} <br>
        <strong>Birth Date:</strong> ${injury.birth_date} <br>
        <strong>Ski Card Photo:</strong> <img src="data:image/jpeg;base64,${injury.ski_card_photo}" alt="Ski Card Photo" width="100">
      </td>
    `;

    // Append rows to the table
    injuriesList.appendChild(row);
    injuriesList.appendChild(detailsRow);

    // Toggle display of details row on click
    row.addEventListener('click', () => {
      detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
    });
  });
})
.catch(error => console.error('Error fetching injuries:', error));

const authToken = localStorage.getItem('authToken');
if (!authToken) {
    alert('You must be logged in to access this page.');
    window.location.href = 'index.html'; // Redirect to login page
}