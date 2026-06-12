"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchCoursesAction } from "@/app/tutorials/actions";

/**
 * Pandaschool: Infinite Tutorial List
 * Implements intersection observer for high-performance lazy loading
 */

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  icon?: string;
  gradient?: string;
  modules?: any[];
}

interface InfiniteTutorialListProps {
  initialCourses: Course[];
  searchQuery?: string;
  categoryFilter?: string;
}

export function InfiniteTutorialList({ initialCourses, searchQuery = "", categoryFilter = "" }: InfiniteTutorialListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Reset list when search or filter changes
  useEffect(() => {
    const resetAndFetch = async () => {
      setLoading(true);
      setPage(0);
      setHasMore(true);
      
      try {
        const data = await fetchCoursesAction(0, 7, searchQuery, categoryFilter);
        setCourses(data);
        setPage(1);
        setHasMore(data.length === 8);
      } catch (error) {
        console.error("Search error:", error);
        setCourses([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (page > 0 || searchQuery || categoryFilter) {
      resetAndFetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter]);

  const fetchMoreCourses = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const from = page * 8;
    const to = from + 7;

    try {
      const data = await fetchCoursesAction(from, to, searchQuery, categoryFilter);
      if (data.length > 0) {
        setCourses(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
        if (data.length < 8) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more courses:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreCourses();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, page, loading]);

  const categories = [...new Set(courses.map((c) => c.category || "Uncategorized"))];

  return (
    <>
      {courses.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-tertiary)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>No tutorials found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} style={{ marginBottom: "64px" }}>
            <h2 style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}>
              {category}
              <div style={{ flex: 1, height: "1px", background: "var(--border-primary)" }} />
            </h2>

            <div className="tutorials-grid">
              {courses
                ?.filter((c) => (c.category || "Uncategorized") === category)
                .map((course) => {
                  const lessonCount = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;
                  return (
                    <Link 
                      key={course.id}
                      href={`/tutorials/${course.slug}`} 
                      style={{ textDecoration: "none" }} 
                      className="tutorial-card-v2"
                    >
                      <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background: course.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] + "15" || "#E1F5EE",
                          color: course.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] || "var(--brand-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: 800
                        }}>
                          {(course as any).image_url ? (
                            <img src={(course as any).image_url} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            course.icon || "📚"
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                            {course.title}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", fontSize: "12px" }}>
                            <span style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{course.difficulty}</span>
                            <span>•</span>
                            <span>{lessonCount} lessons</span>
                          </div>
                        </div>
                        <ArrowRight size={18} color="var(--brand-primary)" className="arrow" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))
      )}

      {/* Intersection Target */}
      <div ref={observerTarget} style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", margin: "20px 0" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", fontSize: "0.95rem", fontWeight: 600 }}>
            <Loader2 size={24} className="animate-spin" color="var(--brand-primary)" />
            <span>Updating tutorial list...</span>
          </div>
        )}
      </div>

      <style>{`
        .tutorials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .tutorials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
