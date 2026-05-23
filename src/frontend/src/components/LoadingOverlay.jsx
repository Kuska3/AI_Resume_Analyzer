import React, { useEffect, useState } from "react";

const STAGES = [
  "Uploading PDF document...",
  "Extracting raw text characters...",
  "Tokenizing programmer keywords...",
  "Applying TF-IDF cosine matching...",
  "Structuring score report...",
  "Finalizing analytical recommendations..."
];

export default function LoadingOverlay() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-overlay">
      <div className="scanner-beam-box">
        📄
      </div>
      <div className="loading-text">Analyzing Resume...</div>
      <div className="loading-subtext">{STAGES[stageIndex]}</div>
    </div>
  );
}
