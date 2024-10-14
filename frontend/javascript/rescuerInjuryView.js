let currentPage = 1;
const limit = 5;
const userId = localStorage.getItem('userUID'); // Get UID from local storage

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM__9j2n3QBf0Cb_NxDRncnx8u6i1QP_E",
  authDomain: "mountain-rescue-863ea.firebaseapp.com",
  projectId: "mountain-rescue-863ea",
  storageBucket: "mountain-rescue-863ea.appspot.com",
  messagingSenderId: "792489098952",
  appId: "1:792489098952:web:cc5fd5ee1cf43ab18faffd"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to check authentication and role
async function checkAuth() {
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    
    window.location.href = 'index.html'; // Redirect to login page
    return false; // Not authenticated
  }

  // Validate the authToken with the backend
  try {
    const response = await fetch(`http://localhost:3000/api/login`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || data.isAdmin) {
      window.location.href = 'index.html'; // Redirect if not a rescuer or is admin
      return false; // Not authorized
    }

    return true; // Authenticated and authorized
  } catch (error) {
    console.error('Error validating token:', error);
    alert('An error occurred while checking access. Please try again.');
    window.location.href = 'index.html'; // Redirect on error
    return false; // Not authorized
  }
}


// Fetch rescuer injuries
function fetchRescuerInjuries(page = 1) {
  checkAuth();
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
              hour12: false
            })
          : 'N/A';

        const row = document.createElement('tr');

        // Conditional rendering for action status
        const actionContent = injury.status === 'approved' 
          ? 'Injury Approved' 
          : injury.status === 'rejected' 
          ? 'Injury Rejected' 
          : 'Pending';  // Default to 'Pending' if no status is set

        row.innerHTML = `
          <td>${injury.patient_name}</td>
          <td>${injury.ski_run}</td>
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

// Show injury details modal
function showInjuryDetailsModal(injury) {
  const modalDetails = document.getElementById('modal-injury-details');

  modalDetails.setAttribute('data-injury-id', injury.id); // Set the ID

  // Format injury_points array
  const injuryPoints = Array.isArray(injury.injury_points)
    ? injury.injury_points.map((inj, index) => `${index + 1}. (side: ${inj.side}) (injury point: ${inj.point}) (type: ${inj.type})`).join('<br>')
    : 'No injury points available';

  // Conditionally display admin signature and name only if the injury is approved
  const adminSignatureDisplay = injury.status === 'approved' && injury.admin_signature 
    ? `<strong>Admin Signature:</strong> 
       <a href="${injury.admin_signature}" target="_blank">
         <img src="${injury.admin_signature}" alt="Admin Signature" width="100">
       </a><br>
       <strong>Approved by:</strong> ${injury.admin_name}<br>`
    : ''; // Display admin name

  // Populate modal details
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
        hour12: false
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
      <img src="${injury.rescuer_signature}" alt="Rescuer Signature" width="100">
    </a><br>
    <br>
    ${adminSignatureDisplay}
  `;

  // Show the modal
  const injuryModal = new bootstrap.Modal(document.getElementById('injuryDetailsModal'));
  injuryModal.show();

  // Set up PDF generation button
  const pdfButton = document.querySelector('.generate-pdf'); // Ensure you are selecting the correct button
  if (pdfButton) {
    pdfButton.onclick = () => generatePDF(injury.id); // Safely assign the click handler
  } else {
    console.error("PDF button not found.");
  }
}

// Generate PDF function
function generatePDF(injuryId) {
  // Fetch the injury details
  db.collection('injuries').doc(injuryId).get()
    .then(doc => {
      if (!doc.exists) {
        alert('No injury found with the provided ID');
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
        admin_name 
      } = injury;

      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      const pdfDoc = new jsPDF();

      // Set up PDF title
      pdfDoc.setFontSize(18);
      pdfDoc.text('Injury Report', 10, 10);
      pdfDoc.setFontSize(12);
      
      // Add patient and rescuer information
      pdfDoc.text(`Patient Name: ${patient_name}`, 10, 20);
      pdfDoc.text(`Birth Date: ${birth_date}`, 10, 30); // Added birth date
      pdfDoc.text(`Ski Run: ${ski_run}`, 10, 40);
      pdfDoc.text(`Rescuer: ${rescuer_name}`, 10, 50);
     

      // Format the timestamp for the PDF using your specified format
      const formattedTimestamp = timestamp 
        ? new Date(timestamp.seconds * 1000).toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false
          })
        : 'N/A';

      pdfDoc.text(`Timestamp: ${formattedTimestamp}`, 10, 70);

      // Add Medical Information section
      pdfDoc.text('Medical Information', 10, 80);
      // Format injury points
      const injuryPointsText = Array.isArray(injury_points) && injury_points.length > 0
        ? injury_points.map((pt, i) => `${i + 1}. (side: ${pt.side}) (injury point: ${pt.point}) (type: ${pt.type})`).join('\n')
        : 'No injury points available';

      pdfDoc.text(`Injured:\n${injuryPointsText}`, 10, 90);
      pdfDoc.text(`Medical Comment: ${medical_comment}`, 10, 100);

      // Add images (ski card photo and rescuer signature)
      const addImageToPDF = (imageUrl, yPosition) => {
        return fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
              reader.onloadend = () => {
                pdfDoc.addImage(reader.result, 'JPEG', 10, yPosition, 50, 50); // Adjust position and size
                resolve();
              };
              reader.onerror = () => reject('Error reading image');
              reader.readAsDataURL(blob); // Convert blob to base64
            });
          });
      };

      const promises = [];
      if (ski_card_photo) promises.push(addImageToPDF(ski_card_photo, 120)); // Position ski card photo
      if (rescuer_signature) promises.push(addImageToPDF(rescuer_signature, 180)); // Position rescuer signature

      // Wait for all images to be added, then save the PDF
      Promise.all(promises)
        .then(() => {
          // Add admin information if the injury is approved
          if (injury.status === 'approved' && admin_signature && admin_name) {
            pdfDoc.addPage(); // New page for admin information
            pdfDoc.text('Admin Information', 10, 10);
            pdfDoc.text(`Admin Name: ${admin_name}`, 10, 20);
            
            // Add admin signature
            return fetch(admin_signature)
              .then(response => response.blob())
              .then(blob => {
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                  reader.onloadend = () => {
                    pdfDoc.addImage(reader.result, 'PNG', 10, 30, 50, 50); // Adjust size as needed
                    resolve();
                  };
                  reader.onerror = () => reject('Error reading admin signature');
                  reader.readAsDataURL(blob);
                });
              });
          }
        })
        .then(() => {
          // Add generation date at the bottom
          const dateGenerated = new Date().toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false
          });
          pdfDoc.text(`Generated on: ${dateGenerated}`, 10, pdfDoc.internal.pageSize.height - 10);
          pdfDoc.save(`${patient_name}_Injury_Report.pdf`);
        })
        .catch(error => {
          console.error('Error adding images to PDF:', error);
          alert('Could not generate PDF with images.');
        });
    })
    .catch(error => {
      console.error('Error fetching injury details:', error);
      alert('Could not fetch injury details for PDF generation.');
    });
}

// Initialize the page with injuries data
fetchRescuerInjuries(currentPage);

// Update pagination dynamically
function updatePagination(currentPage, totalPages) {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = ''; // Clear the pagination

  if (totalPages <= 1) {
    return; // Don't show pagination for a single page
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    if (i === currentPage) {
      pageItem.classList.add('active');
    }

    const pageLink = document.createElement('a');
    pageLink.classList.add('page-link');
    pageLink.textContent = i;
    pageLink.href = '#';
    pageLink.addEventListener('click', (event) => {
      event.preventDefault();
      currentPage = i;
      fetchRescuerInjuries(currentPage);
    });

    pageItem.appendChild(pageLink);
    paginationElement.appendChild(pageItem);
  }
}
