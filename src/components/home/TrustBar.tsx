"use client";

import React from "react";

const techLogos = [
  { name: "React", url: "https://www.vectorlogo.zone/logos/reactjs/reactjs-ar21.svg" },
  { name: "Next.js", url: "https://www.vectorlogo.zone/logos/nextjs/nextjs-ar21.svg" },
  { name: "Supabase", url: "https://www.vectorlogo.zone/logos/supabase/supabase-ar21.svg" },
  { name: "Tailwind", url: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-ar21.svg" },
  { name: "TypeScript", url: "https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg" },
  { name: "PostgreSQL", url: "https://www.vectorlogo.zone/logos/postgresql/postgresql-ar21.svg" },
  { name: "MongoDB", url: "https://www.vectorlogo.zone/logos/mongodb/mongodb-ar21.svg" },
  { name: "Docker", url: "https://www.vectorlogo.zone/logos/docker/docker-ar21.svg" },
  { name: "Redis", url: "https://www.vectorlogo.zone/logos/redis/redis-ar21.svg" },
  { name: "Python", url: "https://www.vectorlogo.zone/logos/python/python-ar21.svg" },
  { name: "Node.js", url: "https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg" },
  { name: "GitHub", url: "https://www.vectorlogo.zone/logos/github/github-ar21.svg" }
];

export function TrustBar() {
  return (
    <section style={{ 
      background: "#FFFFFF", 
      padding: "var(--container-padding) 0", 
      borderTop: "1px solid var(--border-primary)",
      borderBottom: "1px solid var(--border-primary)",
      overflow: "hidden"
    }}>
      <div className="section-container">
        <p style={{ 
          textAlign: "center", 
          fontSize: "11px", 
          fontWeight: 700, 
          color: "var(--text-secondary)", 
          textTransform: "uppercase", 
          letterSpacing: "2px", 
          marginBottom: "32px" 
        }}>
          Master the Industry&apos;s Most In-Demand Technologies
        </p>
        
        <div className="logo-slider">
          <div className="logo-track">
            {[...techLogos, ...techLogos].map((logo, i) => (
              <div key={i} className="logo-item" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 clamp(20px, 5vw, 60px)" }}>
                <img 
                  src={logo.url} 
                  alt={`${logo.name} logo technology`} 
                  loading="lazy"
                  decoding="async"
                  style={{ 
                    height: "clamp(24px, 5vw, 44px)", 
                    width: "auto", 
                    transition: "all 0.3s ease",
                    filter: "grayscale(1) opacity(0.6)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.filter = "grayscale(0) opacity(1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter = "grayscale(1) opacity(0.6)";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .logo-slider {
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .logo-track {
          display: flex;
          width: calc(250px * 16);
          animation: scrollLogos 40s linear infinite;
        }
        .logo-item {
          width: 250px;
          flex-shrink: 0;
        }
        @keyframes scrollLogos {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * 8)); }
        }
        .logo-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
