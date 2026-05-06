"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, Star, Layers, ChevronRight, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { subscribeToChannel } from "@/utils/realtime";

interface Course {
  id: string;
  title: string;
  status: string;
  enrollments?: { id: string }[];
  modules?: { lessons: { id: string }[] }[];
}

export function InstructorDashboardClient({ initialCourses, instructorId }: { initialCourses: Course[], instructorId: string }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchUpdatedData = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, status, enrollments(id), modules(lessons(id))")
      .eq("instructor_id", instructorId);
    if (data) setCourses(data);
  };

  useEffect(() => {
    // Listen for new enrollments to any of the instructor's courses
    const enrollmentSub = subscribeToChannel('enrollments', 'INSERT', () => {
       fetchUpdatedData();
    });

    // Listen for course updates
    const courseSub = subscribeToChannel('courses', '*', (payload) => {
       if (payload.new?.instructor_id === instructorId) {
         fetchUpdatedData();
       }
    });

    return () => {
      enrollmentSub();
      courseSub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, course) => acc + (course.enrollments?.length || 0), 0);
  const totalLessons = courses.reduce((acc, course) => acc + (course.modules?.reduce((mAcc: number, mod: any) => mAcc + (mod.lessons?.length || 0), 0) || 0), 0);

  return (
    <div className="instructor-client-container">
      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: "Total Courses", value: totalCourses, icon: <BookOpen size={24} />, color: "#10B981" },
          { label: "Total Students", value: totalStudents, icon: <Users size={24} />, color: "#3B82F6" },
          { label: "Total Lessons", value: totalLessons, icon: <Layers size={24} />, color: "#8B5CF6" },
          { label: "Avg. Rating", value: "4.8", icon: <Star size={24} />, color: "#F59E0B" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color + "15", color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div className="recent-courses-section">
          <div className="section-header">
            <h2 className="section-title">Manage Your Courses</h2>
            <Link href="/instructor/courses" className="view-all-link">View All</Link>
          </div>

          {courses.length > 0 ? (
            <div className="course-list">
              {courses.slice(0, 5).map(course => (
                <Link key={course.id} href={`/instructor/courses/${course.id}`} className="course-item hover-lift">
                  <div className="course-info">
                    <div className="course-icon-bg">📚</div>
                    <div>
                      <div className="course-title-text">{course.title}</div>
                      <div className="course-meta-text">{course.enrollments?.length || 0} students enrolled</div>
                    </div>
                  </div>
                  <div className="course-status-group">
                    <span className={`status-badge ${course.status}`}>
                      {course.status}
                    </span>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon-container">
                <BookOpen size={40} />
              </div>
              <h3>Your curriculum is empty</h3>
              <p>Share your expertise with the world. Start by creating your very first course.</p>
              <Link href="/instructor/courses/new" className="btn-primary">Create First Course</Link>
            </div>
          )}
        </div>

        <div className="activity-section">
          <h2 className="section-title">Teaching Analytics</h2>
          <div className="analytics-card">
             <div className="chart-container">
                <div className="pulse-indicator">
                  <div className="pulse-circle"></div>
                  <span className="pulse-text">Live Channel</span>
                </div>
                <svg viewBox="0 0 400 150" className="chart-svg">
                  <path d="M0,120 Q50,110 100,130 T200,90 T300,100 T400,60" fill="none" stroke="var(--brand-primary)" strokeWidth="3" />
                  <path d="M0,120 Q50,110 100,130 T200,90 T300,100 T400,60 L400,150 L0,150 Z" fill="rgba(15, 110, 86, 0.1)" />
                </svg>
             </div>
             
             <div className="metrics-list">
                <div className="metric-item">
                   <div className="metric-label-group">
                      <TrendingUp size={16} color="var(--brand-primary)" />
                      <span>Growth Rate</span>
                   </div>
                   <span className="metric-value">+12.5%</span>
                </div>
                <div className="metric-item">
                   <div className="metric-label-group">
                      <Zap size={16} color="#3B82F6" />
                      <span>Engagement</span>
                   </div>
                   <span className="metric-value">High</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .stat-card {
          background: var(--bg-card);
          padding: 24px;
          borderRadius: 20px;
          border: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-label { font-size: 11px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }
        .stat-value { font-size: 32px; font-weight: 900; color: var(--text-primary); }

        .main-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 32px; }
        @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-title { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .view-all-link { color: var(--brand-primary); text-decoration: none; font-size: 14px; font-weight: 700; }

        .course-list { display: flex; flexDirection: column; gap: 16px; }
        .course-item { 
          background: var(--bg-card); 
          padding: 20px; 
          border-radius: 16px; 
          border: 1px solid var(--border-primary); 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        .course-info { display: flex; align-items: center; gap: 16px; }
        .course-icon-bg { width: 48px; height: 48px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; fontSize: 24px; }
        .course-title-text { fontWeight: 800; color: var(--text-primary); fontSize: 15px; }
        .course-meta-text { fontSize: 12px; color: var(--text-tertiary); fontWeight: 600; }

        .status-badge { 
          padding: 6px 12px; border-radius: 8px; fontSize: 11px; fontWeight: 800; text-transform: uppercase;
        }
        .status-badge.published { background: #ECFDF5; color: #10B981; border: 1px solid #10B98130; }
        .status-badge.draft { background: #FFFBEB; color: #F59E0B; border: 1px solid #F59E0B30; }

        .analytics-card { background: var(--bg-card); padding: 24px; border-radius: 24px; border: 1px solid var(--border-primary); }
        .chart-container { 
          height: 200px; 
          background: linear-gradient(180deg, rgba(15, 110, 86, 0.05) 0%, transparent 100%); 
          border-radius: 16px; 
          margin-bottom: 24px; 
          position: relative; 
          overflow: hidden; 
        }
        .pulse-indicator { position: absolute; top: 16px; right: 16px; display: flex; alignItems: center; gap: 8px; background: rgba(0,0,0,0.4); padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); }
        .pulse-circle { width: 8px; height: 8px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
        .pulse-text { color: white; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .chart-svg { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; }

        .metrics-list { display: flex; flex-direction: column; gap: 16px; }
        .metric-item { display: flex; justify-content: space-between; align-items: center; }
        .metric-label-group { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: var(--text-secondary); }
        .metric-value { fontWeight: 800; }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .empty-state { padding: 60px 20px; text-align: center; }
        .empty-icon-container { width: 80px; height: 80px; border-radius: 50%; background: rgba(15, 110, 86, 0.05); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
      `}</style>
    </div>
  );
}
