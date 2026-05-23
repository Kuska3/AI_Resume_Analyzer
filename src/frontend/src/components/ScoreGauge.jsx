import React, { useEffect, useState } from "react";

export default function ScoreGauge({ score }) {
  const [offset, setOffset] = useState(502.4); // Circumference for r=80 (2 * pi * r = 502.4)
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate stroke dashoffset
    const percentage = score / 100;
    const progress = 502.4 - percentage * 502.4;
    
    // Quick delay for smooth entrance transition
    const timer = setTimeout(() => {
      setOffset(progress);
    }, 100);

    // Animate display number
    let start = 0;
    const end = Math.round(score);
    if (end === 0) {
      setDisplayScore(0);
      return () => clearTimeout(timer);
    }
    
    const duration = 1200; // Match CSS transition timing
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const numTimer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(numTimer);
      }
    }, stepTime);

    return () => {
      clearTimeout(timer);
      clearInterval(numTimer);
    };
  }, [score]);

  // Determine color and status word based on score
  let strokeColor = "url(#gauge-gradient-excellent)";
  let statusText = "Excellent Fit";
  let badgeClass = "score-excellent";

  if (score < 50) {
    strokeColor = "url(#gauge-gradient-danger)";
    statusText = "Needs Revision";
    badgeClass = "score-danger";
  } else if (score < 75) {
    strokeColor = "url(#gauge-gradient-warning)";
    statusText = "Good Match";
    badgeClass = "score-warning";
  }

  return (
    <div className="score-card glass-panel">
      <h2>ATS Match Score</h2>
      
      <div className="gauge-wrapper">
        <svg className="svg-gauge" width="200" height="200" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="gauge-gradient-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="gauge-gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <circle className="gauge-bg" cx="100" cy="100" r="80" />
          <circle
            className="gauge-fill"
            cx="100"
            cy="100"
            r="80"
            stroke={strokeColor}
            strokeDasharray="502.4"
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gauge-center-text">
          <div className="gauge-number">{displayScore}</div>
          <div className="gauge-percent">%</div>
          <div className="gauge-label">Score</div>
        </div>
      </div>

      <div className={`score-badge ${badgeClass}`}>
        {statusText}
      </div>
    </div>
  );
}
