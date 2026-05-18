"use client";

import React, { useState, useEffect } from 'react';
import { Briefcase, Edit, MapPin, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      const { error } = await supabase.from('jobs').insert([{
        title: editingJob.title,
        company: editingJob.company,
        team: editingJob.team,
        location: editingJob.location,
        type: editingJob.type,
        link: editingJob.link
      }]);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Job added successfully', 'success');
        setEditingJob(null);
        fetchJobs();
      }
    } else {
      const { error } = await supabase.from('jobs').update({
        title: editingJob.title,
        company: editingJob.company,
        team: editingJob.team,
        location: editingJob.location,
        type: editingJob.type,
        link: editingJob.link
      }).eq('id', editingJob.id);
      
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Job updated successfully', 'success');
        setEditingJob(null);
        fetchJobs();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Job deleted', 'success');
      fetchJobs();
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    showToast('AI is finding fresh tech jobs...', 'info');
    try {
      const res = await fetch('/api/ai/generate-jobs', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast(`Successfully found and added ${data.count} new jobs!`, 'success');
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate jobs with AI', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNew = () => {
    setIsNew(true);
    setEditingJob({ title: '', company: '', team: '', location: '', type: 'Full-time', link: '' });
  };

  return (
    <div style={{ padding: "40px", background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Manage Jobs</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Add, update, or remove job listings.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px' }}
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? "Finding Jobs..." : "Auto-Find with AI"}
          </button>
          <button onClick={handleAddNew} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px' }}>
            <Plus size={16} /> Add Job
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={thStyle}>Job Title</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No jobs found. Use AI to auto-find some!</td></tr>
              ) : jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{job.team}</div>
                  </td>
                  <td style={tdStyle}>{job.company}</td>
                  <td style={tdStyle}>{job.location}</td>
                  <td style={tdStyle}>{job.type}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setIsNew(false); setEditingJob(job); }} style={iconButtonStyle} title="Edit">
                        <Edit size={16} color="#4F46E5" />
                      </button>
                      <button onClick={() => handleDelete(job.id)} style={iconButtonStyle} title="Delete">
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>{isNew ? 'Add Job' : 'Update Job'}</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Job Title</label>
                <input required type="text" value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Company</label>
                <input required type="text" value={editingJob.company} onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Team / Category</label>
                <input required type="text" value={editingJob.team} onChange={(e) => setEditingJob({ ...editingJob, team: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input required type="text" value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <input required type="text" value={editingJob.type} onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Apply Link (URL)</label>
                <input required type="url" value={editingJob.link} onChange={(e) => setEditingJob({ ...editingJob, link: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingJob(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontSize: '14px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#111827',
};

const iconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '4px',
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #D1D5DB',
  fontSize: '0.9rem',
  outline: 'none',
};
