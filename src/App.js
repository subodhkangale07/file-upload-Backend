import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [fileName, setFileName] = useState(""); 
  const [files, setFiles] = useState([]);
  const [fileUrl, setFileUrl] = useState(""); 

  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);  // File select kar rahe hain
  };

  // Upload File
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");  // Agar file select nahi ki gayi toh alert
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);  
  
    try {
      const res = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",  // File upload karte waqt content type set kar rahe hain
        },
      });
  
      console.log("Server Response:", res.data);  
  
      if (res.status === 201) {
        alert("File uploaded successfully!");  
        setFileId(res.data.fileId);  
        setFileName(res.data.fileName); 
        setFileUrl(res.data.fileUrl);   
        fetchFiles();  
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
      const response = await axios.get(`${API_URL}/api/files/${fileId}`, { 
        responseType: "blob"  // File blob type ke response ke saath download
      });
  
      // Blob se URL create kar rahe hain
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
  
      // Invisible link create karke download trigger kar rahe hain
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);  
      
      // Link ko document me append kar ke, click trigger kar rahe hain
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert(`Failed to download file: ${error.response ? error.response.data.error : error.message}`);  // Download error
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
        onChange={(e) => setFileId(e.target.value)}  // File ID input
      />
      <button onClick={handleDownload}>Download</button>  

      {/* Display all uploaded files */}
      <div className="uploaded-files">
        <h2>Uploaded Files</h2>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>  // Agar koi file nahi hui toh message
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file._id}>
                <p><strong>File Name:</strong> {file.filename}</p>  
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
