"use client";

import React, { useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';

interface PDFViewerProps {
  url: string;
  title: string;
  isDownloadable?: boolean;
}

export function PDFViewer({ url, title, isDownloadable = true }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <FileText size={20} />
          </div>
          <h3 className="font-bold text-[var(--text-primary)] truncate max-w-md">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isDownloadable && (
            <Link 
              href={url} 
              target="_blank" 
              download 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] transition-colors text-[var(--text-secondary)] text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </Link>
          )}
          <Link 
            href={url} 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Open in New Tab</span>
          </Link>
        </div>
      </div>

      {/* PDF Container */}
      <div className="relative flex-1 bg-neutral-900 w-full h-full">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)] z-10 bg-[var(--bg-card)]">
            <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading document...</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] p-6 text-center">
            <FileText size={48} className="mb-4 text-[var(--text-tertiary)]" />
            <h4 className="text-xl font-bold mb-2">Unable to load PDF directly</h4>
            <p className="mb-6 max-w-md">
              Your browser might not support embedded PDFs, or the file is hosted on a domain that prevents embedding.
            </p>
            <Link 
              href={url} 
              target="_blank"
              className="px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white font-bold inline-flex items-center gap-2"
            >
              <ExternalLink size={18} /> View Document Manually
            </Link>
          </div>
        ) : (
          <iframe
            src={`${url}#toolbar=0`}
            className="w-full h-full border-none absolute inset-0 z-20"
            title={title}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        )}
      </div>
    </div>
  );
}
