"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  Plus, 
  CheckCircle2, 
  X, 
  Award, 
  ShieldCheck, 
  Trophy, 
  Building2, 
  Send,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  logo_url?: string;
  description: string;
  requirements: string[];
  location: string;
  type: string;
  experience: string;
  salary?: string;
  apply_email?: string;
  created_at: string;
}

export default function JobsPage() {
  const supabase = createClient();

  // Core Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Interaction Modals States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Post Job Form State
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    logo_url: "",
    description: "",
    requirements: "",
    location: "Remote",
    type: "Full-time",
    experience: "Entry Level",
    salary: "",
    apply_email: ""
  });

  // Fetch Jobs, Session, Profile, and Certificates
  async function fetchJobsData() {
    try {
      setLoading(true);
      
      // 1. Fetch Job Listings
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // 2. Fetch Session & Profile for Certified Apply
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Parallel profile & cert fetch
        const [profileRes, certsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("certificates").select(`*, course:courses(title)`).eq("user_id", session.user.id)
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (certsRes.data) setCertificates(certsRes.data);
      }
    } catch (err) {
      console.error("Failed to load jobs hub data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobsData();
  }, []);

  // Form requirements processor
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmittingJob(true);
    try {
      const requirementsArray = newJob.requirements
        ? newJob.requirements.split(",").map(r => r.trim()).filter(Boolean)
        : [];

      const { error } = await supabase.from("jobs").insert({
        title: newJob.title,
        company: newJob.company,
        logo_url: newJob.logo_url || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=128&h=128&q=80",
        description: newJob.description,
        requirements: requirementsArray,
        location: newJob.location,
        type: newJob.type,
        experience: newJob.experience,
        salary: newJob.salary || "Undisclosed",
        apply_email: newJob.apply_email || "careers@company.com",
        created_by: user?.id || null
      });

      if (error) throw error;

      setPostSuccess(true);
      setNewJob({
        title: "",
        company: "",
        logo_url: "",
        description: "",
        requirements: "",
        location: "Remote",
        type: "Full-time",
        experience: "Entry Level",
        salary: "",
        apply_email: ""
      });

      setTimeout(() => {
        setShowPostModal(false);
        setPostSuccess(false);
        fetchJobsData();
      }, 1500);

    } catch (err: any) {
      alert("Error posting job: " + (err.message || err));
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // 1-Click Application trigger
  const handleApply = async () => {
    if (!selectedJob) return;
    setIsApplying(true);

    // Simulate verified payload compilation & employer webhook notification
    setTimeout(async () => {
      try {
        // Optional: Save application log in activity_logs
        if (user) {
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "job_application",
            target_type: "job",
            target_id: selectedJob.id,
            metadata: { 
              job_title: selectedJob.title, 
              company: selectedJob.company,
              student_xp: profile?.xp || 0,
              verified_certs: certificates.map(c => c.course?.title)
            }
          });
        }

        setApplySuccess(true);
        setIsApplying(false);

        setTimeout(() => {
          setSelectedJob(null);
          setApplySuccess(false);
        }, 2200);

      } catch (err) {
        console.error(err);
        setIsApplying(false);
      }
    }, 1500);
  };

  // Client Filtering Engine
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = 
      locationFilter === "All" || 
      (locationFilter === "Remote" && job.location.toLowerCase().includes("remote")) ||
      (locationFilter === "Hybrid" && job.location.toLowerCase().includes("hybrid")) ||
      (locationFilter === "On-site" && !job.location.toLowerCase().includes("remote") && !job.location.toLowerCase().includes("hybrid"));

    const matchesType = 
      typeFilter === "All" || 
      job.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      padding: "calc(var(--nav-height) + var(--container-padding)) var(--container-padding) 60px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Custom Premium Stylesheet Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          .jobs-header-gradient {
            background: linear-gradient(135deg, rgba(15, 110, 86, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
            border: 1px solid var(--border-primary);
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
          }
          .glass-input-wrapper {
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: 16px;
            padding: 4px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 600px;
            margin: 24px auto 0;
            box-shadow: var(--shadow-md);
            transition: all 0.2s ease;
          }
          .glass-input-wrapper:focus-within {
            border-color: var(--brand-primary);
            box-shadow: 0 0 0 3px rgba(15, 110, 86, 0.15);
          }
          .glass-input {
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 1rem;
            width: 100%;
            padding: 12px 0;
            outline: none;
          }
          .filter-btn {
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            color: var(--text-secondary);
            padding: 8px 18px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .filter-btn.active {
            background: var(--brand-primary);
            color: white;
            border-color: var(--brand-primary);
            box-shadow: 0 8px 16px -4px rgba(15, 110, 86, 0.25);
          }
          .filter-btn:hover:not(.active) {
            border-color: var(--text-tertiary);
            color: var(--text-primary);
          }
          .job-card {
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
          }
          .job-card:hover {
            transform: translateY(-5px);
            border-color: var(--brand-primary);
            box-shadow: 0 20px 40px -10px rgba(15, 110, 86, 0.08), var(--shadow-lg);
          }
          .post-form-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
          }
          .post-form-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .post-form-input {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 10px;
            padding: 10px 14px;
            color: var(--text-primary);
            outline: none;
            font-size: 0.9rem;
            transition: border-color 0.2s ease;
          }
          .post-form-input:focus {
            border-color: var(--brand-primary);
          }
        `}} />

        {/* 1. Header Hero Banner */}
        <div className="jobs-header-gradient">
          <div style={{
            position: "absolute",
            top: "-40px",
            left: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.05)",
            filter: "blur(50px)"
          }} />
          
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 800,
            color: "var(--brand-primary)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            background: "rgba(15, 110, 86, 0.08)",
            padding: "6px 16px",
            borderRadius: "50px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px"
          }}>
            <Sparkles size={14} /> Boxspox Careers Portal
          </span>
          
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Get Hired with <span style={{ color: "var(--brand-primary)" }}>Verified Credentials</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px", margin: "16px auto 0", lineHeight: 1.6 }}>
            Bypass standard HR resume filters. Showcase your verified Boxspox course completions, XP, and badges to top tech companies instantly.
          </p>

          {/* Glass Search Bar */}
          <div className="glass-input-wrapper">
            <Search size={20} color="var(--text-tertiary)" />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search by role, company, skills, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Filter Bar & Actions Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "32px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-primary)"
        }}>
          {/* Active Filter Buttons Group */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {/* Location Group */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-tertiary)" }}>LOCATION:</span>
              <div style={{ display: "flex", gap: "6px" }}>
                {["All", "Remote", "Hybrid", "On-site"].map(loc => (
                  <button 
                    key={loc}
                    onClick={() => setLocationFilter(loc)}
                    className={`filter-btn ${locationFilter === loc ? "active" : ""}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Group */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-tertiary)" }}>TYPE:</span>
              <div style={{ display: "flex", gap: "6px" }}>
                {["All", "Full-time", "Internship"].map(type => (
                  <button 
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`filter-btn ${typeFilter === type ? "active" : ""}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action to Post a Position */}
          <button 
            onClick={() => {
              if (!user) {
                alert("Please log in to publish a position.");
                return;
              }
              setShowPostModal(true);
            }}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              fontSize: "0.9rem",
              borderRadius: "12px",
              boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.2)"
            }}
          >
            <Plus size={18} /> Post a Job
          </button>
        </div>

        {/* 3. Grid of Job Listings */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Building2 size={48} className="flame-wiggle" color="var(--brand-primary)" style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Assembling opportunities database...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
            gap: "24px"
          }}>
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div>
                  {/* Card Header: Company Logo & Details */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid var(--border-primary)",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <img 
                        src={job.logo_url} 
                        alt={job.company} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=128&h=128&q=80";
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>{job.company}</span>
                        <ShieldCheck size={14} color="var(--brand-primary)" />
                      </div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 0", lineHeight: 1.2 }}>
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description segment */}
                  <p style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: "20px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {job.description}
                  </p>

                  {/* Pills Metadata Section */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "8px", color: "var(--text-secondary)" }}>
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "8px", color: "var(--text-secondary)" }}>
                      <Clock size={12} /> {job.type}
                    </span>
                    {job.salary && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, background: "rgba(16, 185, 129, 0.08)", padding: "4px 10px", borderRadius: "8px", color: "#10b981" }}>
                        <DollarSign size={12} /> {job.salary}
                      </span>
                    )}
                  </div>

                  {/* Skill Requirements Pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                    {job.requirements.slice(0, 3).map((req, idx) => (
                      <span 
                        key={idx} 
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: "rgba(15, 110, 86, 0.05)",
                          color: "var(--brand-primary)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid rgba(15, 110, 86, 0.1)"
                        }}
                      >
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-tertiary)", alignSelf: "center" }}>
                        +{job.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px",
                    fontSize: "0.85rem",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "var(--brand-primary)",
                    border: "1px solid rgba(15, 110, 86, 0.3)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--brand-primary)";
                  }}
                >
                  Quick Apply <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px dashed var(--border-secondary)"
          }}>
            <Building2 size={48} style={{ color: "var(--text-tertiary)", marginBottom: "16px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              No matches found
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>
              Try adjusting your query, removing filters, or clearing the active search input.
            </p>
          </div>
        )}

        {/* ==================== MODAL A: 1-CLICK VERIFIED APPLY ==================== */}
        {selectedJob && (
          <div className="claim-modal-overlay">
            <div className="claim-modal" style={{ maxWidth: "500px", position: "relative" }}>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>

              {applySuccess ? (
                /* Success screen */
                <div style={{ padding: "10px 0" }}>
                  <div style={{
                    width: "72px",
                    height: "72px",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px"
                  }}>
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    Application Sent! 🚀
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    Your certified Boxspox achievements and certificates have been successfully compiled and sent to <strong>{selectedJob.company}</strong>!
                  </p>
                </div>
              ) : (
                /* Apply Form */
                <div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-primary)", background: "white" }}>
                      <img src={selectedJob.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{selectedJob.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{selectedJob.company} • {selectedJob.location}</p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "4px" }}>
                    Certified 1-Click Apply
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px", lineHeight: 1.4 }}>
                    By clicking submit, your certified learning credentials on Boxspox will be securely attached as your verified technical resume.
                  </p>

                  {/* Certified resume showcase panel */}
                  {user ? (
                    <div style={{
                      background: "rgba(15, 110, 86, 0.03)",
                      border: "1px solid rgba(15, 110, 86, 0.15)",
                      borderRadius: "14px",
                      padding: "20px",
                      textAlign: "left",
                      marginBottom: "28px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brand-primary)", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                        <ShieldCheck size={16} /> Verified Academic Resume
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                        <div>
                          <strong style={{ color: "var(--text-tertiary)" }}>Student:</strong>{" "}
                          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                            {profile?.full_name || user.email?.split("@")[0]}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-tertiary)" }}>Academic XP:</strong>{" "}
                          <span style={{ color: "#6366f1", fontWeight: 800 }}>{profile?.xp || 0} XP</span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-tertiary)" }}>Streak Level:</strong>{" "}
                          <span style={{ color: "#ff4d4d", fontWeight: 800 }}>{profile?.streak || 0} Days 🔥</span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-tertiary)" }}>Verified Certificates:</strong>{" "}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                            {certificates.length > 0 ? (
                              certificates.map((c, i) => (
                                <span 
                                  key={i} 
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    background: "rgba(245, 158, 11, 0.1)",
                                    color: "#f59e0b",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(245, 158, 11, 0.15)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px"
                                  }}
                                >
                                  <Award size={10} /> {c.course?.title}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                                No certificates issued yet. Complete a course and pass its final exam to unlock certificates!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: "16px",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      borderRadius: "12px",
                      color: "#f87171",
                      fontSize: "0.85rem",
                      marginBottom: "28px"
                    }}>
                      You must be logged in to apply with your Boxspox credentials.
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                      onClick={() => setSelectedJob(null)}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-primary)",
                        padding: "12px"
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      disabled={isApplying || !user}
                      className="btn-primary"
                      style={{
                        flex: 2,
                        background: "linear-gradient(135deg, var(--brand-primary), #0f6e56)",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        boxShadow: "0 8px 16px -4px rgba(15, 110, 86, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Send size={16} /> {isApplying ? "Submitting Payload..." : "Submit Certified Application"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== MODAL B: POST A NEW OPPORTUNITY ==================== */}
        {showPostModal && (
          <div className="claim-modal-overlay">
            <div className="claim-modal" style={{ maxWidth: "600px", padding: "32px", position: "relative", textAlign: "left" }}>
              {/* Close Button */}
              <button 
                onClick={() => setShowPostModal(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>

              {postSuccess ? (
                /* Success */
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{
                    width: "72px",
                    height: "72px",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px"
                  }}>
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    Job Published! 🚀
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    The position has been successfully published to the live Boxspox Careers Hub!
                  </p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handlePostJob}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "4px" }}>
                    Publish a Position
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                    Publish a new internship or job opportunity for our network of verified student developers.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="post-form-row">
                      <span className="post-form-label">Role Title *</span>
                      <input 
                        type="text" 
                        className="post-form-input" 
                        placeholder="e.g. Junior React Developer"
                        required
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      />
                    </div>
                    <div className="post-form-row">
                      <span className="post-form-label">Company Name *</span>
                      <input 
                        type="text" 
                        className="post-form-input" 
                        placeholder="e.g. Vercel"
                        required
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="post-form-row">
                      <span className="post-form-label">Location Type *</span>
                      <select 
                        className="post-form-input"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid (SF Office)">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                    <div className="post-form-row">
                      <span className="post-form-label">Position Type *</span>
                      <select 
                        className="post-form-input"
                        value={newJob.type}
                        onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="post-form-row">
                    <span className="post-form-label">Logo Image URL</span>
                    <input 
                      type="url" 
                      className="post-form-input" 
                      placeholder="e.g. https://domain.com/logo.png"
                      value={newJob.logo_url}
                      onChange={(e) => setNewJob({ ...newJob, logo_url: e.target.value })}
                    />
                  </div>

                  <div className="post-form-row">
                    <span className="post-form-label">Description *</span>
                    <textarea 
                      className="post-form-input" 
                      placeholder="Describe the role, team, and day-to-day responsibilities..."
                      rows={3}
                      required
                      style={{ resize: "vertical" }}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                  </div>

                  <div className="post-form-row">
                    <span className="post-form-label">Requirements (comma separated)</span>
                    <input 
                      type="text" 
                      className="post-form-input" 
                      placeholder="e.g. React, Next.js, CSS Flexbox"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="post-form-row">
                      <span className="post-form-label">Salary Range</span>
                      <input 
                        type="text" 
                        className="post-form-input" 
                        placeholder="e.g. $80k - $100k / yr"
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      />
                    </div>
                    <div className="post-form-row">
                      <span className="post-form-label">Application Email *</span>
                      <input 
                        type="email" 
                        className="post-form-input" 
                        placeholder="careers@company.com"
                        required
                        value={newJob.apply_email}
                        onChange={(e) => setNewJob({ ...newJob, apply_email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button 
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-primary)",
                        padding: "12px"
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingJob}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, var(--brand-primary), #0f6e56)",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        boxShadow: "0 8px 16px -4px rgba(15, 110, 86, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Plus size={16} /> {isSubmittingJob ? "Publishing..." : "Publish Position"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
