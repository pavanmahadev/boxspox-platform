"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Code, PenTool, Database, ShieldCheck, Play, Sparkles, Briefcase, Scale, Tractor, BrainCircuit } from "lucide-react";
import { Notch } from "@/components/ui/Notch";

const DOMAINS = [
  {
    id: "mba",
    label: "Business",
    icon: <Briefcase size={16} />,
    title: "MBA & Business",
    desc: "Explore comprehensive MBA & Business courses.",
    image: "/images/domains/mba.jpg",
    color: "#E85D04", // orange
    link: "/learn/business"
  },
  {
    id: "law",
    label: "Law",
    icon: <Scale size={16} />,
    title: "Law & Legal",
    desc: "Explore Law & Legal courses.",
    image: "/images/domains/law.jpg", 
    color: "#1E3A8A", // dark blue
    link: "/learn/law"
  },
  {
    id: "technology",
    label: "Technology",
    icon: <Code size={16} />,
    title: "Technology",
    desc: "Explore Technology courses.",
    image: "/images/domains/technology.jpg",
    color: "#059669", // emerald green
    link: "/learn/technology"
  },
  {
    id: "agriculture",
    label: "Agriculture",
    icon: <Tractor size={16} />,
    title: "Agriculture",
    desc: "Explore Agriculture courses.",
    image: "/images/domains/agriculture.jpg",
    color: "#16A34A", // green
    link: "/learn/agriculture"
  },
  {
    id: "data",
    label: "AI & Data",
    icon: <BrainCircuit size={16} />,
    title: "AI & Data Science",
    desc: "Explore AI & Data Science courses.",
    image: "/images/domains/data.jpg",
    color: "#6D28D9", // purple
    link: "/learn/data"
  },
  {
    id: "design",
    label: "Design",
    icon: <PenTool size={16} />,
    title: "Design & Creative",
    desc: "Explore Design & Creative courses.",
    image: "/images/domains/design.jpg",
    color: "#7E22CE", // deep purple
    link: "/learn/design"
  },
  {
    id: "engineering",
    label: "Engineering",
    icon: <Code size={16} />, // Or another icon like Wrench or HardHat if available
    title: "Engineering",
    desc: "Explore Engineering courses.",
    image: "/images/domains/engineering.jpg",
    color: "#2563EB", // blue
    link: "/learn/engineering"
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: <Sparkles size={16} />, // Or another icon like Stethoscope
    title: "Healthcare",
    desc: "Explore Healthcare courses.",
    image: "/images/domains/healthcare.jpg",
    color: "#0D9488", // teal
    link: "/learn/healthcare"
  }
];

export function Hero() {
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].id);

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDomain((currentId) => {
        const currentIndex = DOMAINS.findIndex(d => d.id === currentId);
        const nextIndex = (currentIndex + 1) % DOMAINS.length;
        return DOMAINS[nextIndex].id;
      });
    }, 5000); // Automatically change slide every 5 seconds

    // Cleanup interval on unmount or when user manually clicks (activeDomain changes)
    return () => clearInterval(timer);
  }, [activeDomain]);

  const currentDomain = DOMAINS.find(d => d.id === activeDomain) || DOMAINS[0];

  return (
    <section style={{
      display: "flex",
      alignItems: "center",
      padding: "120px 24px 40px",
      background: "#FFFFFF",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Decorative Blob */}
      <motion.div
        animate={{ backgroundColor: currentDomain.color }}
        transition={{ duration: 0.8 }}
        style={{
          position: "absolute",
          top: "20%", right: "-10%",
          width: "40vw", height: "40vw",
          borderRadius: "50%",
          filter: "blur(100px)",
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box" }}>
        <div className="hero-grid">

          {/* ── LEFT: text content ── */}
          <div className="hero-left">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "8px 16px", borderRadius: "50px",
              background: "rgba(15,110,86,0.1)", color: "#0F6E56",
              fontWeight: 700, fontSize: "13px", marginBottom: "24px"
            }}>
              <Sparkles size={14} /> Master the future of work
            </div>

            <h1 style={{
              fontSize: "clamp(32px, 3.5vw, 54px)",
              fontWeight: 900, lineHeight: 1.1,
              letterSpacing: "-1.5px", marginBottom: "24px",
              color: "var(--text-primary)", fontFamily: "var(--font-heading)"
            }}>
              Master the Most<br />
              <span style={{
                background: "linear-gradient(135deg, var(--brand-primary), #10B981)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>In-Demand Skills</span>
            </h1>

            <p style={{
              fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
              color: "var(--text-secondary)", lineHeight: 1.6,
              marginBottom: "40px", fontWeight: 500
            }}>
              Learn AI, Corporate Law, Business Strategy, React, and more.
              Improve your skills with interactive lessons and tell people you
              are ready for the future.
            </p>

            <div className="hero-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <Link href="/register" className="btn-primary" style={{ padding: "16px 40px", fontSize: "16px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Start Learning Free <ChevronRight size={18} />
              </Link>
              <Link href="/learn" style={{
                display: "inline-flex", alignItems: "center", gap: "12px",
                color: "var(--text-primary)", textDecoration: "none",
                fontWeight: 700, fontSize: "16px",
                padding: "16px 24px", borderRadius: "12px",
                background: "var(--bg-secondary)", border: "1px solid var(--border-primary)"
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "var(--bg-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Play size={14} fill="currentColor" />
                </div>
                Browse Domains
              </Link>
            </div>
          </div>

          {/* ── RIGHT: image card + notch ── */}
          <div className="hero-right">

            {/* Card — explicit height so it never collapses */}
            <div style={{
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.2)",
              lineHeight: 0
            }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDomain.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Link href={currentDomain.link}>
                    <Image
                      src={currentDomain.image}
                      alt={currentDomain.title}
                      width={1200}
                      height={800}
                      priority
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hidden preloader to fix image reloading flashes */}
            <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
              {DOMAINS.map((domain) => (
                <Image key={domain.id} src={domain.image} alt="preload" width={1200} height={800} priority={false} />
              ))}
            </div>

            {/* Notch */}
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Notch
                items={DOMAINS.map(d => ({ id: d.id, label: d.label, icon: d.icon }))}
                activeId={activeDomain}
                onChange={setActiveDomain}
                activeColor={currentDomain.color}
              />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 48px;
          align-items: center;
          width: 100%;
        }
        .hero-left {
          min-width: 0;
        }
        .hero-right {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .hero-right {
            order: -1;
          }
          .hero-left {
            text-align: center;
          }
          .hero-buttons {
            justify-content: center;
          }
        }
        @media (max-width: 600px) {
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          .hero-buttons a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}


