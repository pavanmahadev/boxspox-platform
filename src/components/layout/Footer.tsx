"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Code2, Globe, Mail, Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Custom SVG Icons for Brands (since Lucide removed them)
const GithubIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) setSettings(data);
    };
    getSettings();
  }, []);

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Tutorials", href: "/tutorials" },
        { label: "Learning Paths", href: "/paths" },
        { label: "Projects", href: "/projects" },
        { label: "Interactive Editor", href: "/playground" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Community", href: "#" },
        { label: "Support", href: "#" },
        { label: "Cheat Sheets", href: "/cheatsheets" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ]
    }
  ];

  const socialLinks = [
    { icon: GithubIcon, href: settings?.social_github, label: "GitHub" },
    { icon: TwitterIcon, href: settings?.social_twitter, label: "Twitter / X" },
    { icon: LinkedinIcon, href: settings?.social_linkedin, label: "LinkedIn" },
    { icon: YoutubeIcon, href: settings?.social_youtube, label: "YouTube" },
  ].filter(link => link.href);

  return (
    <footer style={{ 
      background: "var(--bg-primary)", 
      borderTop: "1px solid var(--border-primary)", 
      padding: "var(--section-spacing) 0 40px",
      color: "var(--text-primary)"
    }}>
      <div className="section-container">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: "48px",
          marginBottom: "60px"
        }}>
          {/* Brand Column */}
          <div style={{ gridColumn: "span 1", minWidth: "260px" }} className="footer-brand-col">
            <style>{`
              @media (min-width: 1024px) {
                .footer-brand-col { grid-column: span 2 !important; }
              }
            `}</style>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-primary)", marginBottom: "24px" }}>
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={settings.platform_name} style={{ height: "40px", width: "auto", display: "block" }} />
              ) : (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Code2 size={22} color="white" aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-1px", fontFamily: "var(--font-heading)" }}>
                    {settings?.platform_name || "PANDASCHOOL"}
                  </span>
                </>
              )}
            </Link>
            <p style={{ color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: "320px", marginBottom: "32px", fontSize: "14px" }}>
              Empowering developers worldwide with project-based learning and AI-powered mentorship.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {socialLinks.length > 0 ? socialLinks.map((link, i) => (
                <Link key={i} href={link.href} target="_blank" rel="noopener noreferrer" 
                  aria-label={`Follow us on ${link.label}`}
                  style={{ color: "#9CA3AF", transition: "color 0.2s" }} 
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")} 
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
                  <link.icon style={{ width: "20px", height: "20px" }} aria-hidden="true" />
                </Link>
              )) : (
                [
                  { Icon: GithubIcon, label: "GitHub" },
                  { Icon: TwitterIcon, label: "Twitter" },
                  { Icon: LinkedinIcon, label: "LinkedIn" },
                  { Icon: YoutubeIcon, label: "YouTube" },
                ].map(({ Icon, label }, i) => (
                  <span key={i} style={{ color: "#D1D5DB", cursor: "default" }} aria-label={label} role="img">
                    <Icon style={{ width: "20px", height: "20px" }} aria-hidden="true" />
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px", color: "var(--text-primary)" }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ 
                      color: "var(--text-tertiary)", 
                      textDecoration: "none", 
                      fontSize: "14px", 
                      fontWeight: 500,
                      transition: "color 0.2s"
                    }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          paddingTop: "40px", 
          borderTop: "1px solid var(--border-primary)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          textAlign: "center"
        }} className="footer-bottom">
          <style>{`
            @media (max-width: 640px) {
              .footer-bottom { 
                flex-direction: column !important;
                text-align: center !important;
              }
              .footer-bottom-links {
                flex-direction: column !important;
                gap: 12px !important;
              }
              .footer-divider { display: none !important; }
            }
          `}</style>
          <div style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
            &copy; {currentYear} {settings?.platform_name || "PANDASCHOOL"}. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }} className="footer-bottom-links">
            <Link href={`mailto:${settings?.admin_email || "hello@pandaschool.in"}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
              <Mail size={16} /> {settings?.admin_email || "hello@pandaschool.in"}
            </Link>
            <div style={{ width: "1px", height: "14px", background: "#E5E7EB" }} className="footer-divider" />
            <div style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
              Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> by GreenNetspark
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
