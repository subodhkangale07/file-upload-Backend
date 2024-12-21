# File Upload and Download App

This is a simple React app that allows users to upload and download files from a backend server. It provides the functionality to:
- Select a file and upload it to the server.
- Download an uploaded file by providing its unique ID.
- View a list of all uploaded files.

## Features

- **File Upload**: Upload files to the backend server using the `POST` method with `multipart/form-data`.
- **File Download**: Download a file by entering its file ID.
- **Display Uploaded Files**: View a list of all uploaded files with their names and unique IDs.

## Technologies Used

- **Frontend**: React.js, Axios
- **Backend**: Node.js, Express.js (for API), Multer (for file handling)
- **Environment Variables**: React app uses `.env` file to store the backend API URL.

## Prerequisites

- Node.js installed on your system.
- A backend server running that handles file uploads and downloads.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/file-upload-download-app.git
cd file-upload-download-app
