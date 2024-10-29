Mountain Rescue App
===================

The **Mountain Rescue App** is a comprehensive tool designed to streamline the reporting and management of injuries in mountain rescue operations. This application provides dedicated interfaces for both **Admins** and **Rescuers**, helping to ensure efficient and organized record-keeping and approval processes. The app uses Firebase for database management and storage.

Table of Contents
-----------------

*   [Features](#features)
    
*   [Roles and Access](#roles-and-access)
    
*   [Technologies Used](#technologies-used)
    
*   [Installation](#installation)
    
*   [Usage](#usage)
    
    *   [Admin Interface](#admin-interface)
        
    *   [Rescuer Interface](#rescuer-interface)
        
*   [Database Structure](#database-structure)
    
*   [PDF Reporting](#pdf-reporting)
    
    

Features
--------

*   **Rescuer Injury Reporting**: Rescuers can file reports of injuries encountered during rescue missions, including attaching photos, descriptions, and signatures.
    
*   **Admin Approval**: Admins review injury reports, approve or deny them, and add their signature upon approval.
    
*   **PDF Generation**: Both admins and rescuers can generate PDF reports of approved injuries containing full injury details.
    
*   **Role-Based Access**: Admins have access to all rescuer-submitted injuries, while rescuers can only view and manage their own reports.
    

Roles and Access
----------------

### Admin

*   Add and manage rescuers.
    
*   View, approve, or deny all injury reports.
    
*   Sign approved injury reports.
    
*   Generate a PDF for any approved injury report with a signature.
    

### Rescuer

*   File new injury reports with relevant details, photos, and a signature.
    
*   View only the injury reports they have submitted.
    
*   Generate PDFs for injury reports that have been approved and signed by an admin.
    

Technologies Used
-----------------

*   **Frontend**: HTML, JS, CSS
    
*   **Backend**: Node.js(Express.js), Firebase (Firestore for database, Firebase Storage for media storage)
    
*   **Authentication**: Firebase Authentication
    
*   **PDF Generation**: jspdf
    

Installation
------------

To set up the project locally, follow these steps:

1.  Cone the repository
   ```bash
    git clone repo
    npm install
   ```
    
3.  **Set up Firebase**:
    
    *   Configure Firebase Authentication, Firestore, and Storage.
        
    *   Replace Firebase configuration in your project with your project-specific credentials.
    *   Make sure to add your `FIREBASE_CONFIG` in your `.env`
        
4.  Start the server
   ```bash
  npm start
  ```
    

Usage
-----

### Admin Interface

The admin interface allows administrators to:

1.  **Manage Rescuers**: Admins can add, edit, or remove rescuers in the system.
    
2.  **View All Injury Reports**: Admins have full access to every submitted injury report.
    
3.  **Approve or Deny Injury Reports**: Admins can decide on the validity of an injury report.
    
4.  **Sign and PDF Reports**: Upon approval, admins can add their signature to the report, which allows PDF generation.
    

### Rescuer Interface

The rescuer interface is focused on submitting and managing personal injury reports:

1.  **File Injury Reports**: Rescuers fill out a form with injury details, attach photos, and provide a signature.
    
2.  **View Submitted Reports**: Rescuers can view their own submitted reports.
    
3.  **Generate PDF Reports**: If an injury report is approved by an admin, rescuers can generate a PDF of the report.
    

Database Structure
------------------

The database is structured as follows:

*   **Users Collection**: Stores rescuer and admin account information, including roles.
    
*   **Injuries Collection**: Each injury report includes fields for injury details, photos, signatures, approval status, and admin signature (if approved).
    

PDF Reporting
-------------

Both Admins and Rescuers can generate PDF reports of injury submissions, containing:

*   All injury details (description, date, rescuer details)
    
*   Photos and rescuer signature
    
*   Admin approval signature (if applicable)
    

Admins have access to generate PDFs for all reports, while rescuers can only generate PDFs for their own approved reports.
