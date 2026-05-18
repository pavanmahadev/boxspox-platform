"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, MapPin, Send, Sparkles, UserPlus, Zap } from 'lucide-react';

export default function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const renderContent = () => {
    switch (slug) {
      case 'hiring-2026':
        return <HiringProgram />;
      case 'apply':
        return <ApplyNow />;
      case 'post':
        return <PostJob />;
      case 'updates':
        return <JobUpdates />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)' }}>404</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Page Not Found</p>
            <Link href="/" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Go Home</Link>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      padding: '120px 20px 80px',
      color: 'var(--text-primary)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-secondary)', 
          textDecoration: 'none',
          marginBottom: '40px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        {renderContent()}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Hiring Program 2026                             */
/* -------------------------------------------------------------------------- */
function HiringProgram() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 110, 86, 0.05)',
          color: 'var(--brand-primary)',
          padding: '8px 16px',
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          <Sparkles size={14} />
          <span>Exclusive for 2026 Graduates</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px' }}>
          Ignite Your Career in <span style={{ background: 'linear-gradient(135deg, var(--brand-primary), #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>2026</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Join our elite hiring program designed to transform ambitious graduates into industry leaders. Applications are now open.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        <div style={benefitCardStyle}>
          <div style={iconContainerStyle}><Zap size={24} color="var(--brand-primary)" /></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Fast-Track Growth</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Accelerated career path with mentorship from senior leaders and hands-on project experience.</p>
        </div>
        <div style={benefitCardStyle}>
          <div style={iconContainerStyle}><Briefcase size={24} color="var(--brand-primary)" /></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Global Impact</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Work on projects that touch millions of users worldwide and solve real-world problems.</p>
        </div>
        <div style={benefitCardStyle}>
          <div style={iconContainerStyle}><UserPlus size={24} color="var(--brand-primary)" /></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Elite Community</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Join a cohort of top-tier talent and build a network that will last a lifetime.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/jobs/apply" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1rem' }}>
          Apply to the Program
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Apply Now                                  */
/* -------------------------------------------------------------------------- */
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

function ApplyNow() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      const supabase = createClient();
      const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      setActiveJobs(data || []);
      setLoading(false);
    }
    loadJobs();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>Open Positions</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Join our mission to build the future of education.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading positions...</div>
        ) : activeJobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <Briefcase size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Open Positions</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We're not actively hiring right now, but check back soon!</p>
          </div>
        ) : activeJobs.map((job: any) => (
          <div key={job.id} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{job.title}</h3>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {job.team}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {job.type}</span>
                {job.company && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>@ {job.company}</span>}
              </div>
            </div>
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', textDecoration: 'none' }}>Apply</a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Looking for more opportunities?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          We recommend checking out specialized platforms like <a href="https://simplify.jobs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Simplify.jobs</a> and <a href="https://jobsfornewgrad.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>JobsForNewGrad</a> for real-time updates on entry-level roles.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Post Job                                  */
/* -------------------------------------------------------------------------- */
function PostJob() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>Post a Job</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Reach thousands of top-tier developers and designers.</p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Job Title</label>
          <input type="text" placeholder="e.g. Senior React Developer" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Company Name</label>
          <input type="text" placeholder="e.g. Acme Inc." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input type="text" placeholder="e.g. Remote or New York, NY" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Job Description</label>
          <textarea placeholder="Describe the role and requirements..." style={{ ...inputStyle, height: '150px', resize: 'vertical' }}></textarea>
        </div>
        <button type="button" className="btn-primary" style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}>
          <Send size={16} /> Submit Job Listing
        </button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Job Updates                                 */
/* -------------------------------------------------------------------------- */
function JobUpdates() {
  const updates = [
    { date: "May 10, 2026", title: "New Frontend Roles Added", content: "We have just added 3 new frontend roles for our product team. Check them out in the Apply section!" },
    { date: "May 5, 2026", title: "Hiring Program Update", content: "The hiring program for 2026 graduates has received over 1000 applications. Interviews start next week." },
    { date: "April 28, 2026", title: "We are now remote-first!", content: "To support our growing team, we are transitioning to a remote-first company for most engineering roles." },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>Job Updates</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Stay informed about new opportunities and program news.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {updates.map((update, index) => (
          <div key={index} style={{
            borderLeft: '4px solid var(--brand-primary)',
            paddingLeft: '20px',
            position: 'relative'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '4px' }}>{update.date}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{update.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{update.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */
const benefitCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #f0f0f0',
  transition: 'transform 0.2s',
};

const iconContainerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(15, 110, 86, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: 600,
  marginBottom: '8px',
  color: 'var(--text-primary)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s',
  outline: 'none',
};
