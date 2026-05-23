import React, { useState, useEffect } from "react";
import UploadZone from "./components/UploadZone";
import JobDescInput from "./components/JobDescInput";
import ScoreGauge from "./components/ScoreGauge";
import SkillsGrid from "./components/SkillsGrid";
import ScanHistory from "./components/ScanHistory";
import LoadingOverlay from "./components/LoadingOverlay";

const API_BASE_URL = "http://localhost:8000";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("skills"); // skills | resumeText | jobDesc

  // Fetch scan history on startup
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please upload your PDF resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the job description first.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Server failed to analyze the document.");
      }

      const result = await response.json();
      setScanResult(result);
      setActiveTab("skills");
      fetchHistory(); // Refresh history panel list
    } catch (error) {
      alert(`Scan failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScan = async (scanId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${scanId}`);
      if (!response.ok) throw new Error("Could not fetch scan details.");
      const result = await response.json();
      setScanResult(result);
      setActiveTab("skills");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${scanId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // If current scan detail displayed is deleted, reset screen to setup mode
        if (scanResult && scanResult.id === scanId) {
          handleReset();
        }
        fetchHistory();
      } else {
        alert("Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete call failed:", error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setScanResult(null);
  };

  return (
    <div className="app-container">
      {isLoading && <LoadingOverlay />}

      <div className="main-content">
        {/* Header bar */}
        <header className="app-header">
          <div className="brand-section">
            <div className="brand-logo-icon">🚀</div>
            <div className="brand-title-group">
              <h1>AI Resume Analyzer</h1>
              <p>Tailor your experience and match job profiles locally</p>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setIsHistoryOpen(true)}>
              📁 View Archive ({historyList.length})
            </button>
            {scanResult && (
              <button className="btn btn-primary" onClick={handleReset}>
                🔄 Scan New Resume
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Display Screens */}
        {!scanResult ? (
          /* SETUP INPUTS MODE */
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="workspace-grid">
              <UploadZone
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
              />
              <JobDescInput
                value={jobDescription}
                onChange={setJobDescription}
              />
            </div>
            
            <div className="trigger-bar">
              <button 
                className="btn btn-primary scan-btn"
                onClick={handleScan}
                disabled={!selectedFile || !jobDescription}
                style={{ opacity: (!selectedFile || !jobDescription) ? 0.6 : 1 }}
              >
                🔍 Analyze Profile
              </button>
            </div>
          </div>
        ) : (
          /* SCAN RESULTS MODE */
          <div className="dashboard-grid">
            {/* Left Score Card and breakdowns */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <ScoreGauge score={scanResult.ats_score} />

              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📊 Analytics Breakdown
                </h3>
                <div className="breakdown-list">
                  
                  {/* Similarity Progress */}
                  <div className="breakdown-item">
                    <div className="breakdown-info">
                      <span className="breakdown-name">Vocabulary Similarity</span>
                      <span className="breakdown-value">{scanResult.text_similarity}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${scanResult.text_similarity}%`, 
                          background: "linear-gradient(90deg, #6366f1, #a5b4fc)" 
                        }} 
                      />
                    </div>
                  </div>

                  {/* Keyword progress */}
                  <div className="breakdown-item">
                    <div className="breakdown-info">
                      <span className="breakdown-name">Keyword Match Rate</span>
                      <span className="breakdown-value">{scanResult.keyword_score}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${scanResult.keyword_score}%`, 
                          background: "linear-gradient(90deg, #10b981, #34d399)" 
                        }} 
                      />
                    </div>
                  </div>

                  {/* Structural Score progress */}
                  <div className="breakdown-item">
                    <div className="breakdown-info">
                      <span className="breakdown-name">Layout & Structure</span>
                      <span className="breakdown-value">{scanResult.structure_score}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${scanResult.structure_score}%`, 
                          background: "linear-gradient(90deg, #f59e0b, #fbbf24)" 
                        }} 
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Report Detail Area */}
            <div className="report-panel glass-panel">
              <div className="tabs-navigation">
                <button
                  className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
                  onClick={() => setActiveTab("skills")}
                >
                  Skills & suggestions
                </button>
                <button
                  className={`tab-btn ${activeTab === "resumeText" ? "active" : ""}`}
                  onClick={() => setActiveTab("resumeText")}
                >
                  Parsed Resume PDF
                </button>
                <button
                  className={`tab-btn ${activeTab === "jobDesc" ? "active" : ""}`}
                  onClick={() => setActiveTab("jobDesc")}
                >
                  Job Requirements
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "skills" && (
                  <SkillsGrid
                    matched={scanResult.skills_matched}
                    missing={scanResult.skills_missing}
                    structureScore={scanResult.structure_score}
                    similarityScore={scanResult.text_similarity}
                  />
                )}

                {activeTab === "resumeText" && (
                  <div className="text-viewer-box">
                    <div className="viewer-header">Extracted Text Content</div>
                    <div className="viewer-content">
                      {scanResult.resume_text}
                    </div>
                  </div>
                )}

                {activeTab === "jobDesc" && (
                  <div className="text-viewer-box">
                    <div className="viewer-header">Target Requirements</div>
                    <div className="viewer-content">
                      {scanResult.job_description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide history sidebar */}
      <ScanHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelectScan={handleSelectScan}
        onDeleteScan={handleDeleteScan}
      />
    </div>
  );
}
