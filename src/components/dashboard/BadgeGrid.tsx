import React from 'react';

interface BadgeGridProps {
  unlockedBadges: {
    htmlHero: boolean;
    cssChampion: boolean;
    jsJedi: boolean;
    pythonPathfinder: boolean;
    sqlSage: boolean;
    gitGuardian: boolean;
  };
}

export function BadgeGrid({ unlockedBadges }: BadgeGridProps) {
  const badges = [
    { 
      id: "html", 
      label: "HTML Hero", 
      desc: "Complete any HTML lesson", 
      active: unlockedBadges.htmlHero, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gHtml" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#f04e23" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gHtml)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <path d="M50 25 L75 35 L70 68 L50 82 L30 68 L25 35 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" />
          <text x="50" y="59" fill="#fff" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">H</text>
        </svg>
      )
    },
    { 
      id: "css", 
      label: "CSS Champion", 
      desc: "Complete any CSS lesson", 
      active: unlockedBadges.cssChampion, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gCss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gCss)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <path d="M28 65 L28 40 L40 50 L50 35 L60 50 L72 40 L72 65 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="50" cy="35" r="3" fill="#fff" />
          <circle cx="28" cy="40" r="3" fill="#fff" />
          <circle cx="72" cy="40" r="3" fill="#fff" />
          <text x="50" y="60" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CSS</text>
        </svg>
      )
    },
    { 
      id: "js", 
      label: "JS Jedi", 
      desc: "Complete any JavaScript lesson", 
      active: unlockedBadges.jsJedi, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gJs" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gJs)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <path d="M55 24 L32 50 L48 50 L42 76 L68 46 L50 46 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      id: "python", 
      label: "Python Pathfinder", 
      desc: "Complete any Python lesson", 
      active: unlockedBadges.pythonPathfinder, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gPy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gPy)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" />
          <path d="M50 35 L55 50 L50 65 L45 50 Z" fill="#fff" />
        </svg>
      )
    },
    { 
      id: "sql", 
      label: "SQL Sage", 
      desc: "Complete any SQL lesson", 
      active: unlockedBadges.sqlSage, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gSql" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gSql)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <path d="M35 35 C35 30, 65 30, 65 35 C65 40, 35 40, 35 35 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2" />
          <path d="M35 35 L35 50 C35 55, 65 55, 65 50 L65 35" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M35 50 L35 65 C35 70, 65 70, 65 65 L65 50" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      )
    },
    { 
      id: "git", 
      label: "Git Guardian", 
      desc: "Complete Git beginner guide", 
      active: unlockedBadges.gitGuardian, 
      renderBadge: () => (
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gGit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#gGit)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <line x1="35" y1="35" x2="35" y2="65" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <line x1="35" y1="50" x2="65" y2="35" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="35" cy="35" r="7" fill="#fff" />
          <circle cx="35" cy="65" r="7" fill="#fff" />
          <circle cx="65" cy="35" r="7" fill="#fff" />
        </svg>
      )
    },
  ];

  return (
    <div style={{ 
      background: "var(--bg-card)", 
      padding: "24px", 
      borderRadius: "var(--radius-xl)", 
      border: "1px solid var(--border-primary)",
      boxShadow: "var(--shadow-sm)"
    }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Unlockable Badges
      </h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "20px", fontWeight: 500 }}>
        Learn in each path to unlock gorgeous vector developer badges!
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {badges.map((ach, i) => (
          <div 
            key={i} 
            style={{ 
              textAlign: "center", 
              position: "relative",
              cursor: "help"
            }}
            title={`${ach.label}\n${ach.desc}\n(${ach.active ? "UNLOCKED! 🎉" : "LOCKED 🔒"})`}
          >
            <div style={{ 
              width: "60px", 
              height: "60px", 
              margin: "0 auto 8px",
              filter: ach.active ? "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" : "grayscale(1) opacity(0.3)",
              transform: "scale(1)",
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }} className={ach.active ? "badge-hover" : ""}>
              {ach.renderBadge()}
            </div>
            <div style={{ 
              fontSize: "0.65rem", 
              color: ach.active ? "var(--text-primary)" : "var(--text-tertiary)", 
              fontWeight: 700,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap"
            }}>
              {ach.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
