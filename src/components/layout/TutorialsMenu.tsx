"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

interface TutorialsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialData = [
  {
    category: "HTML and CSS",
    items: [
      { name: "HTML", href: "/tutorials/html" },
      { name: "CSS", href: "/tutorials/css" },
      { name: "RWD", href: "/tutorials/rwd" },
      { name: "Bootstrap", href: "/tutorials/bootstrap" },
      { name: "Sass", href: "/tutorials/sass" },
      { name: "Colors", href: "/tutorials/colors" },
      { name: "Icons", href: "/tutorials/icons" },
      { name: "SVG", href: "/tutorials/svg" },
      { name: "Canvas", href: "/tutorials/canvas" },
      { name: "Graphics", href: "/tutorials/graphics" },
      { name: "UTF-8 and Emojis", href: "/tutorials/utf8" },
      { name: "How To", href: "/tutorials/howto" },
    ]
  },
  {
    category: "JavaScript",
    items: [
      { name: "JavaScript", href: "/tutorials/javascript" },
      { name: "React", href: "/tutorials/react" },
      { name: "jQuery", href: "/tutorials/jquery" },
      { name: "Vue", href: "/tutorials/vue" },
      { name: "Angular", href: "/tutorials/angular" },
      { name: "AngularJS", href: "/tutorials/angularjs" },
      { name: "JSON", href: "/tutorials/json" },
      { name: "AJAX", href: "/tutorials/ajax" },
      { name: "AppML", href: "/tutorials/appml" },
      { name: "TypeScript", href: "/tutorials/typescript" },
      { name: "Next.js", href: "/tutorials/nextjs" },
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Python", href: "/tutorials/python" },
      { name: "SQL", href: "/tutorials/sql" },
      { name: "MySQL", href: "/tutorials/mysql" },
      { name: "PHP", href: "/tutorials/php" },
      { name: "Java", href: "/tutorials/java" },
      { name: "C", href: "/tutorials/c" },
      { name: "C++", href: "/tutorials/cpp" },
      { name: "C#", href: "/tutorials/csharp" },
      { name: "R", href: "/tutorials/r" },
      { name: "Kotlin", href: "/tutorials/kotlin" },
      { name: "Rust", href: "/tutorials/rust" },
      { name: "Go", href: "/tutorials/go" },
      { name: "Django", href: "/tutorials/django" },
      { name: "PostgreSQL", href: "/tutorials/postgresql" },
      { name: "Node.js", href: "/tutorials/nodejs" },
      { name: "MongoDB", href: "/tutorials/mongodb" },
      { name: "Git", href: "/tutorials/git" },
      { name: "Bash", href: "/tutorials/bash" },
    ]
  },
  {
    category: "Data Analytics",
    items: [
      { name: "AI", href: "/tutorials/ai" },
      { name: "Generative AI", href: "/tutorials/generative-ai" },
      { name: "ChatGPT-4", href: "/tutorials/chatgpt-4" },
      { name: "Machine Learning", href: "/tutorials/ml" },
      { name: "DSA", href: "/tutorials/dsa" },
      { name: "Data Science", href: "/tutorials/data-science" },
      { name: "NumPy", href: "/tutorials/numpy" },
      { name: "Pandas", href: "/tutorials/pandas" },
      { name: "SciPy", href: "/tutorials/scipy" },
      { name: "Matplotlib", href: "/tutorials/matplotlib" },
      { name: "Statistics", href: "/tutorials/statistics" },
      { name: "Excel", href: "/tutorials/excel" },
      { name: "Google Sheets", href: "/tutorials/google-sheets" },
    ]
  }
];

export function TutorialsMenu({ isOpen, onClose }: TutorialsMenuProps) {
  const [filter, setFilter] = React.useState("");

  const filteredData = tutorialData.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            background: "#282A35",
            color: "white",
            zIndex: 999,
            padding: "clamp(24px, 5vw, 40px) 0 60px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto"
          }}
        >
          <div className="section-container">
            <div className="tutorials-menu-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", gap: "20px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>Tutorials</h2>
              
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, justifyContent: "flex-end" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                  <input 
                    type="text" 
                    placeholder="Filter tutorials..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ 
                      background: "rgba(255,255,255,0.1)", 
                      border: "none", 
                      color: "white", 
                      padding: "10px 20px 10px 44px", 
                      borderRadius: "12px",
                      width: "100%",
                      fontSize: "0.95rem",
                      outline: "none"
                    }}
                  />
                  <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
                  {filter && (
                    <button 
                      onClick={() => setFilter("")}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.5 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.7 }}>
                  <X size={32} />
                </button>
              </div>
            </div>

            <div className="tutorials-grid">
              {filteredData.length > 0 ? (
                filteredData.map((section) => (
                  <div key={section.category}>
                    <h3 style={{ 
                      color: "#FFF4A3", 
                      fontSize: "1.2rem", 
                      fontWeight: 800, 
                      marginBottom: "20px",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      {section.category}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {section.items.map((item) => (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          onClick={onClose}
                          style={{ 
                            color: "white", 
                            textDecoration: "none", 
                            fontSize: "1rem", 
                            fontWeight: 500,
                            opacity: 0.8,
                            transition: "opacity 0.2s, color 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.color = "#04AA6D";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.8";
                            e.currentTarget.style.color = "white";
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0" }}>
                  <p style={{ fontSize: "1.2rem", color: "var(--text-tertiary)" }}>No tutorials matching &quot;{filter}&quot;</p>
                  <button 
                    onClick={() => setFilter("")}
                    style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: 700, cursor: "pointer", marginTop: "12px" }}
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            <div className="tutorials-footer">
               <div>
                  <h3 style={{ color: "#FFF4A3", fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>Web Building</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Create a Website</Link>
                    <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Web Templates</Link>
                    <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Web Development</Link>
                  </div>
               </div>
               <div className="certificate-promo">
                  <div>
                    <h4 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Get Certified</h4>
                    <p style={{ opacity: 0.7 }}>Upgrade your skills and get documented proof of your knowledge.</p>
                  </div>
                  <Link href="/certifications" className="btn-primary" style={{ padding: "14px 32px", textAlign: "center" }}>
                    Explore Certificates
                  </Link>
               </div>
            </div>
          </div>
          <style>{`
            .tutorials-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 40px;
            }
            .tutorials-footer {
              margin-top: 60px;
              border-top: 1px solid rgba(255,255,255,0.1);
              padding-top: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 40px;
            }
            .certificate-promo {
              grid-column: span 3;
              background: rgba(255,255,255,0.05);
              border-radius: 24px;
              padding: 32px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
            }

            @media (max-width: 1200px) {
              .tutorials-grid { grid-template-columns: repeat(3, 1fr); }
              .tutorials-footer { grid-template-columns: 1fr; }
              .certificate-promo { grid-column: span 1; }
            }
            @media (max-width: 900px) {
              .tutorials-grid { grid-template-columns: repeat(2, 1fr); }
              .tutorials-menu-header { flex-direction: column; align-items: flex-start !important; }
              .tutorials-menu-header h2 { margin-bottom: 0; }
              .certificate-promo { flex-direction: column; text-align: center; }
              .certificate-promo .btn-primary { width: 100%; }
            }
            @media (max-width: 480px) {
              .tutorials-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
