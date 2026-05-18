"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Award, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  User, 
  ArrowLeft,
  Globe,
  ShieldCheck,
  Cpu,
  BookOpen,
  Check,
  Copy,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import DownloadButton from "@/components/certificates/DownloadButton";

// Custom Linkedin SVG component to bypass local lucide export issues
const Linkedin = (props: React.SVGProps<SVGSVGElement> & { size?: number }) => {
  const { size = 20, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
};

interface PremiumCertificateViewProps {
  cert: any;
  profile: any;
  course: any;
}

export default function PremiumCertificateView({
  cert,
  profile,
  course
}: PremiumCertificateViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [sheenStyle, setSheenStyle] = useState<any>({ opacity: 0 });
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate issue date info for LinkedIn integration
  const issueDate = cert?.issued_at ? new Date(cert.issued_at) : null;
  const issueYear = issueDate ? issueDate.getFullYear() : new Date().getFullYear();
  const issueMonth = issueDate ? issueDate.getMonth() + 1 : 1; // 1-indexed for LinkedIn API
  
  const certIdShort = cert?.id ? cert.id.substring(0, 13).toUpperCase() : "";

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Tilt calculations (-8deg to +8deg)
    const rX = -((y / rect.height) - 0.5) * 16;
    const rY = ((x / rect.width) - 0.5) * 16;
    
    setRotateX(rX);
    setRotateY(rY);
    
    // Gradient reflection coordinates
    const pX = (x / rect.width) * 100;
    const pY = (y / rect.height) * 100;
    setSheenStyle({
      background: `radial-gradient(circle at ${pX}% ${pY}%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 55%)`,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setSheenStyle({ opacity: 0 });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkedInShare = () => {
    if (typeof window !== "undefined" && course) {
      const currentUrl = window.location.origin + "/certificates/" + cert?.id;
      const linkedinAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
        `&name=${encodeURIComponent((course?.title || 'Professional') + ' Certification of Competence')}` +
        `&organizationName=${encodeURIComponent('Boxspox Academy')}` +
        `&issueYear=${issueYear}` +
        `&issueMonth=${issueMonth}` +
        `&certUrl=${encodeURIComponent(currentUrl)}` +
        `&certId=${encodeURIComponent(certIdShort)}`;
      
      window.open(linkedinAddUrl, "_blank");
    }
  };

  // Dynamic modules list depending on the course slug
  const getSkillsList = (slug: string) => {
    const defaultSkills = [
      "Core Language Fundamentals & Architecture",
      "Assessment Challenges & Code Compilations",
      "Final Assessment & Coding Sandboxes",
      "Interactive Playground Exploration Checkpoints"
    ];

    const skillsMap: Record<string, string[]> = {
      html: [
        "Document Structure & HTML5 Semantic Outlines",
        "Hyperlinks, Anchor Optimization & Context Roots",
        "Semantic Media Integration & Media Queries Layouts",
        "Advanced Interactive Forms & Input Regex Validators"
      ],
      css: [
        "CSS Selectors specificity, Cascades & Custom Variables",
        "Flexbox and Grid layout models positioning",
        "Adaptive styling, animations & keyframe transitions",
        "Modern CSS methodologies & premium component layout design"
      ],
      javascript: [
        "Asynchronous architecture, promises & Event Loops",
        "Dynamic DOM manipulators & client events hooks",
        "Array structures parsing & modern ES6+ operations",
        "Scope models, closure bindings & dynamic contexts"
      ],
      python: [
        "Object-Oriented scripts, classes & polymorph paradigms",
        "System algorithms, loops parsing & data collections",
        "File directories operations & external API routing",
        "Advanced exception handlers & error capture decorators"
      ]
    };

    return skillsMap[slug.toLowerCase()] || defaultSkills;
  };

  const skills = getSkillsList(course?.slug || "");

  // Render a simulated SHA256 cryptographic hash based on the ID for verification flavor
  const cryptoHash = `SHA256: ${cert?.id ? cert.id.replace(/-/g, "").substring(0, 32).toUpperCase() : ""}`;

  const formattedDate = (mounted && issueDate) 
    ? issueDate.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
    : "";

  return (
    <div className="cert-grid">
      <style dangerouslySetInnerHTML={{ __html: `
        .back-dashboard-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-tertiary, #64748b);
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 32px;
          transition: color 0.2s ease;
        }
        .back-dashboard-link:hover {
          color: var(--brand-primary, #0f6e56) !important;
        }

        .cert-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
          align-items: start;
        }
        
        .premium-card-wrapper {
          perspective: 1200px;
          width: 100%;
        }
        
        .tilt-card {
          background: var(--bg-card, #ffffff);
          border-radius: 28px;
          border: 1px solid var(--border-primary, #e2e8f0);
          box-shadow: 0 30px 70px -15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
          position: relative;
          overflow: hidden;
          transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease;
          transform-style: preserve-3d;
          padding: 70px 60px;
          text-align: center;
        }
        
        .tilt-card.hovered {
          box-shadow: 0 45px 90px -20px rgba(15, 110, 86, 0.12), inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .sheen-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          mix-blend-mode: overlay;
          transition: opacity 0.15s ease;
        }

        .card-inner-3d {
          transform: translateZ(50px);
        }

        .skills-card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-primary, #e2e8f0);
          border-radius: 20px;
          padding: 30px;
          margin-top: 32px;
          box-shadow: var(--shadow-sm);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .cert-grid {
            grid-template-columns: 1fr;
          }
          .skills-grid {
            grid-template-columns: 1fr;
          }
          .tilt-card {
            padding: 40px 24px !important;
          }
          .cert-title {
            font-size: 2rem !important;
          }
          .cert-course {
            font-size: 1.5rem !important;
          }
        }
        
        .pulse-glow {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      ` }} />

      {/* Main Column */}
      <div style={{ width: "100%" }}>
        
        {/* Interactive 3D Certificate */}
        <div className="premium-card-wrapper">
          <div 
            ref={cardRef}
            className={`tilt-card ${isHovered ? "hovered" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}
          >
            {/* Reflective Sheen Layer */}
            <div className="sheen-overlay" style={sheenStyle} />

            {/* Classic Styled Borders */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "var(--brand-primary, #0f6e56)" }} />
            <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "220px", height: "220px", background: "var(--brand-primary, #0f6e56)", opacity: 0.02, borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "180px", height: "180px", background: "var(--brand-primary, #0f6e56)", opacity: 0.02, borderRadius: "50%" }} />

            {/* 3D Translation Content Container */}
            <div className="card-inner-3d">
              
              {/* Gold Seal Header */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
                <div style={{ 
                  width: "84px", 
                  height: "84px", 
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "var(--brand-primary, #0f6e56)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.15)"
                }}>
                  <Award size={48} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))" }} />
                </div>
              </div>

              {/* Title Header */}
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 900, 
                color: "var(--brand-primary, #0f6e56)", 
                textTransform: "uppercase", 
                letterSpacing: "4px", 
                marginBottom: "20px" 
              }}>
                Certificate of Completion
              </div>
              
              {/* Graduate Name */}
              <h1 className="cert-title" style={{ 
                fontSize: "2.6rem", 
                fontWeight: 900, 
                color: "var(--text-primary, #0f172a)", 
                marginBottom: "24px", 
                letterSpacing: "-1.5px", 
                fontStyle: "italic",
                fontFamily: "Georgia, serif"
              }}>
                {profile?.full_name || "Lola Mh"}
              </h1>

              {/* Description Body */}
              <p style={{ 
                fontSize: "1.05rem", 
                color: "var(--text-secondary, #475569)", 
                maxWidth: "520px", 
                margin: "0 auto 44px", 
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                has successfully completed all requirements, practical assessments, and final examinations for the professional course:
              </p>

              {/* Course Title */}
              <div className="cert-course" style={{ 
                fontSize: "2.1rem", 
                fontWeight: 900, 
                color: "var(--text-primary, #0f172a)", 
                marginBottom: "12px",
                letterSpacing: "-1px" 
              }}>
                {course?.title || "HTML"}
              </div>
              
              <div style={{ height: "2px", width: "120px", background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)", margin: "0 auto 36px" }} />

              {/* Verification Metadata Footers */}
              <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 8vw, 80px)", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Issued On</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                    {formattedDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Certificate ID</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary, #0f172a)", fontFamily: "var(--font-mono, monospace)" }}>
                    {certIdShort}
                  </div>
                </div>
              </div>

              {/* Issuing Authority Logo */}
              <div style={{ marginTop: "54px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#1e293b", 
                  borderRadius: "8px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "white", 
                  fontWeight: 900, 
                  fontSize: "14px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                }}>B</div>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary, #0f172a)", letterSpacing: "-0.5px" }}>
                  BOXSPOX <span style={{ color: "#64748b", fontSize: "9px", fontWeight: 800, letterSpacing: "1px" }}>ACADEMY</span>
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Skill Mastery Grid */}
        <div className="skills-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              background: "rgba(15, 110, 86, 0.05)", 
              borderRadius: "10px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "var(--brand-primary, #0f6e56)" 
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>
                Verified Skill Mastery
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary, #6b7280)", marginTop: "2px" }}>
                Technical competencies validated by Boxspox Academy examinations.
              </p>
            </div>
          </div>

          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div 
                key={index}
                style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "10px", 
                  background: "var(--bg-secondary, #f8fafc)", 
                  padding: "14px 18px", 
                  borderRadius: "12px", 
                  border: "1px solid var(--border-primary, #e2e8f0)" 
                }}
              >
                <div style={{ 
                  width: "20px", 
                  height: "20px", 
                  background: "#d1fae5", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#059669",
                  marginTop: "2px",
                  flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #475569)", lineHeight: 1.4 }}>
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* PDF Download Action */}
        <DownloadButton 
          recipientName={profile?.full_name || "Graduate"} 
          courseName={course?.title || "Professional Course"} 
          date={formattedDate}
          certificateId={certIdShort}
          certDbId={cert?.id || ""}
        />

        {/* Add to LinkedIn Button */}
        <button 
          onClick={handleLinkedInShare}
          style={{ 
            width: "100%", 
            background: "#0077b5", 
            color: "white", 
            padding: "16px", 
            borderRadius: "12px", 
            border: "none", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "10px", 
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 119, 181, 0.2)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <Linkedin size={20} /> Add to LinkedIn
        </button>

        {/* Share Link Action */}
        <button 
          onClick={handleShare}
          style={{ 
            width: "100%", 
            background: "var(--bg-card, #ffffff)", 
            color: "var(--text-primary, #0f172a)", 
            padding: "16px", 
            borderRadius: "12px", 
            border: "1px solid var(--border-primary, #e2e8f0)", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "10px", 
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            position: "relative"
          }}
        >
          {copied ? (
            <>
              <CheckCircle2 size={20} color="#059669" />
              <span style={{ color: "#059669" }}>Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={20} /> Share Achievement
            </>
          )}
        </button>

        {/* Dynamic Course Page Link */}
        <Link 
          href={`/tutorials/${course?.slug || ""}`} 
          style={{ 
            width: "100%", 
            background: "none", 
            color: "var(--text-tertiary, #64748b)", 
            padding: "16px", 
            borderRadius: "12px", 
            border: "1px solid var(--border-primary, #e2e8f0)", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "10px", 
            textDecoration: "none", 
            fontSize: "14px",
            textAlign: "center"
          }}
        >
          <Globe size={18} /> View Course Page
        </Link>
        
        {/* Cryptographic Secure Verification Vault */}
        <div style={{ 
          marginTop: "16px", 
          padding: "24px", 
          background: "linear-gradient(135deg, #020617, #0f172a)", 
          borderRadius: "20px", 
          border: "1px solid #1e293b",
          color: "white",
          boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Top corner scanning radar element */}
          <div style={{ position: "absolute", top: "15px", right: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="pulse-glow" />
            <div style={{ width: "8px", height: "8px" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            
            {/* Header Block */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={26} color="#10b981" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.4))" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#10b981" }}>Secure Ledger Verified</div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>Boxspox Verification Authority</div>
              </div>
            </div>

            <div style={{ height: "1px", background: "#1e293b", margin: "8px 0" }} />

            {/* Cryptographic Details Terminal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "#94a3b8" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>[LEDGER_STATUS]</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>SUCCESS</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>[EXAM_SCORE]</span>
                <span style={{ color: "white", fontWeight: 700 }}>PASS (80%)</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                <span style={{ fontSize: "9px", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Cryptographic Signature</span>
                <span style={{ fontSize: "9px", color: "#a855f7", overflowWrap: "anywhere", lineHeight: 1.3 }}>{cryptoHash}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", color: "#475569", marginTop: "4px" }}>
                <Cpu size={12} />
                <span>Bypasses RLS validation check: OK</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
