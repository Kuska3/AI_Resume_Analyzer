import React, { useState, useRef } from "react";

export default function UploadZone({ onFileSelected, selectedFile }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endswith(".pdf")) {
      alert("Unsupported file format. Please upload a PDF resume.");
      return;
    }
    onFileSelected(file);
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>
          <span className="panel-icon">📄</span> Upload Resume
        </h2>
        <span className="file-specs">Supports PDF up to 10MB</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept=".pdf"
        onChange={handleChange}
      />

      {selectedFile ? (
        <div className="uploader-box" onClick={triggerInput}>
          <div className="selected-file-badge">
            <span className="file-icon">📁</span>
            <div className="file-info">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{formatFileSize(selectedFile.size)}</div>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Click to upload a different PDF
          </p>
        </div>
      ) : (
        <div
          className={`uploader-box ${isDragActive ? "drag-over" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
        >
          <div className="upload-icon-pulse">📤</div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Drag & drop your PDF resume here
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            or click to browse local files
          </p>
        </div>
      )}
    </div>
  );
}
