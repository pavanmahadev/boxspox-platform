"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Clock, Star, BookOpen } from "lucide-react";

const fallbackImage = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

const defaultCourses = [
  {
    title: "Modern Web Development",
    description: "Master HTML5, CSS3, and Modern JavaScript from scratch.",
    difficulty: "Beginner",
    duration: "12 Hours",
    rating: "4.9",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    slug: "html-css-js"
  },
  {
    title: "React & Next.js Masterclass",
    description: "Build high-performance applications with the latest App Router.",
    difficulty: "Intermediate",
    duration: "18 Hours",
    rating: "4.8",
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80",
    slug: "react-nextjs"
  },
  {
    title: "Backend with Node & Supabase",
    description: "Learn to build secure APIs and manage databases effectively.",
    difficulty: "Advanced",
    duration: "15 Hours",
    rating: "4.9",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    slug: "backend-mastery"
  }
];

export function FeaturedCourses({ courses: dbCourses }: { courses?: any[] }) {
  const displayCourses = dbCourses && dbCourses.length > 0 ? dbCourses : defaultCourses;
  
  return (
    <section style={{ padding: "100px 0", background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
          <div>
            <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
              Featured <span style={{ color: "var(--brand-primary)" }}>Courses</span>
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "540px" }}>
              Hand-picked tutorials to help you start your coding journey today.
            </p>
          </div>
          <Link href="/tutorials" style={{
            color: "var(--brand-primary)",
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "14px"
          }}>
            View All Tutorials <ChevronRight size={18} />
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "clamp(24px, 4vw, 40px)"
        }}>
          {displayCourses.map((course: any, i: number) => {
            const duration = (course.duration || "—").replace("minitis", "minutes");
            const rating = course.rating || ["4.8", "4.9", "4.7", "4.6", "5.0", "4.8", "4.9", "4.7"][i % 8];
            const image = course.image_url || course.image || fallbackImage;

            return (
              <motion.div
                key={course.slug || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-16px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 30px 60px -12px rgba(15, 110, 86, 0.12)";
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                }}
              >
                <div style={{ height: "240px", overflow: "hidden", position: "relative" }}>
                  <img 
                    src={image} 
                    alt={course.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "var(--brand-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span style={{ width: "6px", height: "6px", background: "var(--brand-primary)", borderRadius: "50%" }} />
                    {course.difficulty || course.level}
                  </div>
                </div>

                <div style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px", background: "rgba(15, 110, 86, 0.08)", padding: "4px 10px", borderRadius: "6px" }}>
                      {course.category || "Development"}
                    </span>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: "24px", 
                    fontWeight: 900, 
                    color: "var(--text-primary)", 
                    marginBottom: "16px",
                    lineHeight: 1.2,
                    fontFamily: "var(--font-heading)"
                  }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "15px", 
                    lineHeight: 1.6, 
                    marginBottom: "32px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontWeight: 500
                  }}>
                    {course.description}
                  </p>

                  <div style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "24px",
                    borderTop: "1px solid var(--border-primary)"
                  }}>
                    <div style={{ display: "flex", gap: "24px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 700 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock size={18} color="var(--brand-primary)" /> {duration}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Star size={18} color="#FBBF24" fill="#FBBF24" /> {rating}
                      </div>
                    </div>
                    
                    <Link href={`/tutorials/${course.slug}`} style={{
                      padding: "12px 24px",
                      borderRadius: "14px",
                      background: "var(--brand-primary)",
                      color: "white",
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(15, 110, 86, 0.2)",
                      transition: "all 0.2s ease"
                    }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-primary-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-primary)")}>
                      Enroll <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

