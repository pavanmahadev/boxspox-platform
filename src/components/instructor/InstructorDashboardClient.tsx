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
        .instructor-client-container {
          padding: 12px 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .stat-card {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
          padding: 28px;
          border-radius: 24px;
          border: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border-color: var(--brand-primary);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, var(--brand-primary) 0%, transparent 70%);
          opacity: 0.03;
          transition: opacity 0.4s;
          border-radius: 50%;
        }
        .stat-card:hover::before { opacity: 0.08; }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover .stat-icon { transform: scale(1.1) rotate(5deg); }
        .stat-label { font-size: 11px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1.5px; }
        .stat-value { font-size: 36px; font-weight: 900; color: var(--text-primary); letter-spacing: -1px; }

        .main-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 32px; }
        @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-title { font-size: 22px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.5px; }
        .view-all-link { color: var(--brand-primary); text-decoration: none; font-size: 14px; font-weight: 700; transition: color 0.2s; }
        .view-all-link:hover { color: #0D5C45; }

        .course-list { display: flex; flex-direction: column; gap: 16px; }
        .course-item { 
          background: var(--bg-card); 
          padding: 24px; 
          border-radius: 20px; 
          border: 1px solid var(--border-primary); 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
        }
        .course-item:hover { 
          transform: translateX(6px); 
          border-color: var(--brand-primary);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
        }
        .course-info { display: flex; align-items: center; gap: 20px; }
        .course-icon-bg { width: 52px; height: 52px; border-radius: 14px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid var(--border-primary); }
        .course-title-text { font-weight: 800; color: var(--text-primary); font-size: 16px; margin-bottom: 4px; }
        .course-meta-text { font-size: 13px; color: var(--text-tertiary); font-weight: 600; }

        .status-badge { 
          padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .status-badge.published { background: #ECFDF5; color: #10B981; border: 1px solid #10B98120; }
        .status-badge.draft { background: #FFFBEB; color: #F59E0B; border: 1px solid #F59E0B20; }

        .analytics-card { background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%); padding: 28px; border-radius: 28px; border: 1px solid var(--border-primary); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03); }
        .chart-container { 
          height: 200px; 
          background: linear-gradient(180deg, rgba(15, 110, 86, 0.08) 0%, transparent 100%); 
          border-radius: 20px; 
          margin-bottom: 24px; 
          position: relative; 
          overflow: hidden; 
          border: 1px solid var(--border-primary);
        }
        .pulse-indicator { position: absolute; top: 16px; right: 16px; display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.5); padding: 6px 12px; border-radius: 20px; backdrop-filter: blur(4px); }
        .pulse-circle { width: 8px; height: 8px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
        .pulse-text { color: white; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .chart-svg { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; }

        .metrics-list { display: flex; flex-direction: column; gap: 16px; }
        .metric-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-primary); }
        .metric-item:last-child { border-bottom: none; }
        .metric-label-group { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: var(--text-secondary); }
        .metric-value { font-weight: 800; color: var(--text-primary); }

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
