"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Clock, Star, BookOpen } from "lucide-react";

const fallbackImage = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll('.course-card');
      
      if (cards.length === 0) return;
      
      const containerLeft = container.getBoundingClientRect().left;
      
      let currentIdx = 0;
      for (let i = 0; i < cards.length; i++) {
        const cardLeft = cards[i].getBoundingClientRect().left;
        // Find the card that is closest to the left edge of the container
        if (Math.abs(cardLeft - containerLeft) < 50) {
          currentIdx = i;
          break;
        }
      }
      
      let targetIdx = direction === "right" ? currentIdx + 1 : currentIdx - 1;
      
      // Clamp target index
      targetIdx = Math.max(0, Math.min(targetIdx, cards.length - 1));
      
      const targetCard = cards[targetIdx];
      const targetScrollLeft = targetCard.getBoundingClientRect().left - containerLeft + container.scrollLeft;
      
      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  };
  
  return (
    <section style={{ padding: "var(--section-spacing) 0", background: "var(--bg-primary)" }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          .course-card {
            flex: 0 0 280px !important;
          }
        }
      `}</style>
      <div className="section-container">
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          marginBottom: "48px",
          gap: "24px",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: "1 1 300px" }}>
            <h2 style={{ fontSize: "var(--h2-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}>
              Featured <span style={{ color: "var(--brand-primary)" }}>Courses</span>
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "var(--body-size)", maxWidth: "540px" }}>
              Hand-picked tutorials to help you start your coding journey today.
            </p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "8px" }}>
            <Link href="/learn" style={{
              color: "var(--brand-primary)",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "14px"
            }}>
              Explore All Domains <ChevronRight size={18} />
            </Link>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => scroll("left")}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                  e.currentTarget.style.color = "var(--brand-primary)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll("right")}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                  e.currentTarget.style.color = "var(--brand-primary)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: "32px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            scrollSnapType: "x mandatory",
            paddingBottom: "16px",
            paddingTop: "16px",
            margin: "-16px",
            paddingLeft: "16px",
            paddingRight: "16px",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {displayCourses.map((course: any, i: number) => {
            const duration = (course.duration || "—").replace("minitis", "minutes");
            const rating = course.rating || ["4.8", "4.9", "4.7", "4.6", "5.0", "4.8", "4.9", "4.7"][i % 8];
            const image = course.image_url || course.image || fallbackImage;

            return (
              <motion.div
                key={course.slug || i}
                className="course-card"
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
                  position: "relative",
                  flex: "0 0 340px",
                  scrollSnapAlign: "start"
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
                <div style={{ 
                  height: "200px", 
                  overflow: "hidden", 
                  position: "relative",
                  background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px"
                }}>
                  <img 
                    src={image} 
                    alt={`${course.title} course thumbnail`} 
                    loading="lazy"
                    decoding="async"
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "100%", 
                      objectFit: "contain", 
                      transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)" 
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />

                </div>

                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px", background: "rgba(15, 110, 86, 0.08)", padding: "4px 10px", borderRadius: "6px" }}>
                      {course.category || "Development"}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-secondary, #3b82f6)", textTransform: "uppercase", letterSpacing: "1px", background: "rgba(59, 130, 246, 0.08)", padding: "4px 10px", borderRadius: "6px" }}>
                      {course.difficulty || course.level}
                    </span>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: "20px", 
                    fontWeight: 900, 
                    color: "var(--text-primary)", 
                    marginBottom: "12px",
                    lineHeight: 1.2,
                    fontFamily: "var(--font-heading)"
                  }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "14px", 
                    lineHeight: 1.5, 
                    marginBottom: "20px",
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
                    
                    <Link href={`/learn/${slugify(course.category || "development")}/${course.slug}`} style={{
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

