import React from "react";

export default function SkillsGrid({ matched, missing, structureScore, similarityScore }) {
  // Generate smart, actionable resume suggestions based on score analytics
  const getSuggestions = () => {
    const list = [];
    let count = 1;

    if (missing && missing.length > 0) {
      // Pick top 3 missing skills for focused learning/addition
      const keySkills = missing.slice(0, 4).join(", ");
      list.push({
        id: count++,
        type: "missing-skills",
        title: "Incorporate Missing Core Skills",
        desc: `Your resume is missing some crucial tools/technologies required by the job: [ ${keySkills} ]. We recommend adding descriptions of projects or work history where you have utilized these skills to pass the initial keyword check.`,
        icon: "💡"
      });
    }

    if (similarityScore < 60) {
      list.push({
        id: count++,
        type: "similarity",
        title: "Enhance Technical Context and Terminology",
        desc: "Your overall resume vocabulary has a low contextual match with the job description. Rewrite your bullet points to closely echo the phrasing and action verbs used in the job post (e.g. use 'Managed cloud instances' instead of 'worked on servers').",
        icon: "✍️"
      });
    }

    if (structureScore < 100) {
      list.push({
        id: count++,
        type: "structure",
        title: "Optimize Resume Layout Sections",
        desc: "Ensure your resume clearly demarcates standard sections (Contact details, Technical Skills, Professional Experience, Education, and Projects). ATS scanners utilize structural anchors to parse dates and achievements correctly.",
        icon: "📋"
      });
    }

    if (list.length === 0) {
      list.push({
        id: count++,
        type: "success",
        title: "Outstanding Profile Match!",
        desc: "Your skills and terminology perfectly align with the target profile. Ensure your PDF formatting is clean, single-column, and error-free before submitting. Best of luck!",
        icon: "🎉"
      });
    }

    return list;
  };

  const suggestions = getSuggestions();

  return (
    <div className="skills-tab-content">
      {/* Dynamic Skill Cards */}
      <div className="workspace-grid" style={{ gap: "1.5rem" }}>
        <div className="skills-card-group matched glass-panel" style={{ padding: "1.5rem" }}>
          <h3>
            <span style={{ color: "var(--success)" }}>✔</span> Matched Skills ({matched ? matched.length : 0})
          </h3>
          {matched && matched.length > 0 ? (
            <div className="skills-wrap" style={{ marginTop: "1rem" }}>
              {matched.map((skill, idx) => (
                <span key={idx} className="skill-badge match">
                  ✨ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="skills-empty-text" style={{ marginTop: "1rem" }}>
              No overlapping technical skills detected. Try pasting a more detailed job description.
            </p>
          )}
        </div>

        <div className="skills-card-group missing glass-panel" style={{ padding: "1.5rem" }}>
          <h3>
            <span style={{ color: "var(--warning)" }}>⚠</span> Missing Target Skills ({missing ? missing.length : 0})
          </h3>
          {missing && missing.length > 0 ? (
            <div className="skills-wrap" style={{ marginTop: "1rem" }}>
              {missing.map((skill, idx) => (
                <span key={idx} className="skill-badge missing">
                  + {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="skills-empty-text" style={{ marginTop: "1rem" }}>
              Amazing! You possess all primary technical skills mentioned in the job description!
            </p>
          )}
        </div>
      </div>

      {/* Structured Suggestions Board */}
      <div className="suggestions-container" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
          Actionable Resume Enhancements
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          {suggestions.map((item) => (
            <div key={item.id} className={`suggestion-item ${item.type === "success" ? "success" : ""}`}>
              <div className="suggestion-bullet">
                {item.icon}
              </div>
              <div className="suggestion-text">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
