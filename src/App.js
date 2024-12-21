import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [fileName, setFileName] = useState(""); // Store filename for downloads
  const [files, setFiles] = useState([]);
  const [fileUrl, setFileUrl] = useState("");


  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload File
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Server Response:", res.data);  // Log the response to ensure fileName and fileUrl are returned
  
      if (res.status === 201) {
        alert("File uploaded successfully!");
        setFileId(res.data.fileId);
        setFileName(res.data.fileName); // Display the uploaded file name
        setFileUrl(res.data.fileUrl);   // Store the file URL for later use
        fetchFiles();  // Reload the list of files after upload
      } else {
        alert(`Upload failed with status ${res.status}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Failed to upload file: ${err.message}`);
    }
  };
  

  // Download File
  const handleDownload = async () => {
    try {
      // Make GET request to download the file with responseType: "blob"
      const response = await axios.get(`${API_URL}/api/files/${fileId}`, { 
        responseType: "blob" 
      });
  
      // Create a URL from the blob data
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
  
      // Create an invisible anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);  // Set the file name for download
      
      // Append the link to the document and trigger the click event to download
      document.body.appendChild(link);
      link.click();
      
      // Clean up by removing the link
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert(`Failed to download file: ${error.response ? error.response.data.error : error.message}`);
    }
  };
  

  // Fetch all uploaded files
  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/files");
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  // Fetch files on initial render
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <h2>File Upload and Download</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <br />
      <input
        type="text"
        placeholder="Enter File ID to Download"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />
      <button onClick={handleDownload}>Download</button>

      {/* Display all uploaded files */}
      <div className="uploaded-files">
        <h2>Uploaded Files</h2>
        {files.length === 0 ? (
  <p>No files uploaded yet.</p>
) : (
  <ul>
    {files.map((file) => (
      <li key={file._id}>
        <p><strong>File Name:</strong> {file.filename}</p>  {/* Ensure you're using the correct field */}
        <p><strong>File ID:</strong> {file._id}</p>
      </li>
    ))}
  </ul>
)}

      </div>
    </div>
  );
};

export default App;
