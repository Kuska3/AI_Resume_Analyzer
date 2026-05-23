import React from "react";

const SAMPLE_JD_TEMPLATES = [
  {
    title: "React Developer",
    text: "Position: React Developer\nRequirements:\n- 2+ years of professional web development experience.\n- Expert in JavaScript, TypeScript, and React.js.\n- Strong expertise in HTML5, CSS3, Tailwind CSS.\n- Familiarity with REST APIs, Git, Docker, and AWS deployments."
  },
  {
    title: "Python API Engineer",
    text: "Position: Python API Engineer\nRequirements:\n- Strong expertise in Python programming.\n- Hands-on experience developing REST APIs using FastAPI or Django.\n- Good knowledge of PostgreSQL databases, SQLite, and Redis caching.\n- Competence in CI/CD pipeline automation, Docker, and AWS."
  }
];

export default function JobDescInput({ value, onChange }) {
  const loadTemplate = (text) => {
    onChange(text);
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <h2>
          <span className="panel-icon">💼</span> Job Description
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {SAMPLE_JD_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", borderRadius: "5px" }}
              onClick={() => loadTemplate(tmpl.text)}
            >
              + {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="jd-textarea"
        placeholder="Paste the Job Description or requirements here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "0.5rem"
        }}
      >
        <span>Keep it detailed for better contextual matching</span>
        <span>{value ? value.length : 0} characters</span>
      </div>
    </div>
  );
}
