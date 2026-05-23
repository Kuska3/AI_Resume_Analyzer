import React from "react";

export default function ScanHistory({ isOpen, onClose, historyList, onSelectScan, onDeleteScan }) {
  const getBadgeClass = (score) => {
    if (score < 50) return "danger";
    if (score < 75) return "warning";
    return "excellent";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}
      
      <div className={`history-drawer ${isOpen ? "open" : ""}`}>
        <div className="history-header">
          <h2>📁 Scan Archive</h2>
          <button className="btn-close-drawer" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="history-list">
          {historyList && historyList.length > 0 ? (
            historyList.map((item) => (
              <div key={item.id} className="history-item">
                <div 
                  className="history-item-details"
                  onClick={() => {
                    onSelectScan(item.id);
                    onClose();
                  }}
                >
                  <div className="history-role" title={item.job_title}>
                    {item.job_title}
                  </div>
                  <div className="history-meta">
                    <span>{item.filename}</span>
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className={`history-badge ${getBadgeClass(item.ats_score)}`}>
                    {Math.round(item.ats_score)}%
                  </div>
                  <button 
                    className="btn-danger-icon"
                    title="Delete Scan"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete scan for ${item.job_title}?`)) {
                        onDeleteScan(item.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="history-empty-text">
              Your scan archive is empty.<br />Analyze a resume to begin!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
