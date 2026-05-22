import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import ReactPDF from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Line,
  Rect,
} from "@react-pdf/renderer";

// Rate Limit Settings
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10; // 10 PDFs per hour per user

// Premium PDF Styles — Boxspox Branding
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },

  // Outer border frame (double border effect: outer)
  outerBorder: {
    border: "3pt solid #0F6E56",
    borderRadius: 4,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },

  // Inner border frame
  innerBorder: {
    border: "1pt solid #10B981",
    borderRadius: 2,
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 32,
  },

  headerSection: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },

  // Top accent bar
  accentBar: {
    width: 80,
    height: 3,
    backgroundColor: "#0F6E56",
    marginBottom: 16,
    borderRadius: 2,
  },

  // Organization name
  orgName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // CERTIFICATE OF COMPLETION title
  certTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0F6E56",
    textTransform: "uppercase",
    letterSpacing: 5,
    marginBottom: 6,
    textAlign: "center",
  },

  dividerLine: {
    width: 200,
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 14,
  },

  // "This is to certify that"
  bodyText: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Recipient name
  recipientName: {
    fontSize: 34,
    fontFamily: "Helvetica-BoldOblique",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // "has successfully completed"
  completedText: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#64748b",
    marginBottom: 10,
    textAlign: "center",
  },

  // Course name
  courseName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  // Footer row
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 16,
    marginTop: 4,
  },

  footerCol: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },

  footerLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  footerValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },

  // Cert ID uses mono-style
  certIdText: {
    fontSize: 9,
    fontFamily: "Courier-Bold",
    color: "#0F6E56",
    letterSpacing: 1,
  },

  // Signature line
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: "#cbd5e1",
    marginBottom: 4,
  },

  // Boxspox "B" logo box
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 18,
  },

  logoBox: {
    width: 28,
    height: 28,
    backgroundColor: "#1e293b",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  logoBoxText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  logoText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: 1,
  },
});

// Premium Certificate PDF Component
function CertificateDocument({
  recipientName,
  courseName,
  date,
  certificateId,
}: {
  recipientName: string;
  courseName: string;
  date: string;
  certificateId: string;
}) {
  return React.createElement(
    Document,
    { title: `Boxspox Academy — ${courseName} Certificate` },
    React.createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },

      // Outer double-border frame
      React.createElement(
        View,
        { style: styles.outerBorder },

        // Inner border frame
        React.createElement(
          View,
          { style: styles.innerBorder },

          // === HEADER SECTION ===
          React.createElement(
            View,
            { style: styles.headerSection },

            // Boxspox Logo Badge
            React.createElement(
              View,
              { style: styles.logoBadge },
              React.createElement(
                View,
                { style: styles.logoBox },
                React.createElement(Text, { style: styles.logoBoxText }, "B")
              ),
              React.createElement(Text, { style: styles.logoText }, "BOXSPOX ACADEMY")
            ),

            // Gold/Teal SVG Seal
            React.createElement(
              Svg,
              { width: 64, height: 64, viewBox: "0 0 64 64", style: { marginBottom: 14 } },
              // Outer ring
              React.createElement(Circle, { cx: "32", cy: "32", r: "30", stroke: "#0F6E56", strokeWidth: "2", fill: "none" }),
              // Middle ring
              React.createElement(Circle, { cx: "32", cy: "32", r: "25", stroke: "#10B981", strokeWidth: "1", fill: "rgba(15,110,86,0.04)" }),
              // Inner star / award shape (simplified as circle with cross lines)
              React.createElement(Circle, { cx: "32", cy: "32", r: "18", fill: "#0F6E56" }),
              // Award checkmark-star simplified
              React.createElement(Line, { x1: "24", y1: "32", x2: "29", y2: "37", stroke: "#ffffff", strokeWidth: "2.5", strokeLinecap: "round" }),
              React.createElement(Line, { x1: "29", y1: "37", x2: "40", y2: "26", stroke: "#ffffff", strokeWidth: "2.5", strokeLinecap: "round" })
            ),

            // Decorative thin bar
            React.createElement(View, { style: styles.accentBar }),

            // Org name
            React.createElement(Text, { style: styles.orgName }, "Boxspox Academy"),

            // Title
            React.createElement(Text, { style: styles.certTitle }, "Certificate of Completion"),

            // Divider
            React.createElement(View, { style: styles.dividerLine }),

            // Body copy
            React.createElement(Text, { style: styles.bodyText }, "This is to certify that"),

            // Recipient name (italic bold — Helvetica-BoldOblique mimics Georgia italic)
            React.createElement(Text, { style: styles.recipientName }, recipientName),

            // Completion text
            React.createElement(Text, { style: styles.completedText }, "has successfully completed all requirements, assessments, and examinations for:"),

            // Course name
            React.createElement(Text, { style: styles.courseName }, courseName),

            // Divider
            React.createElement(View, { style: { ...styles.dividerLine, marginTop: 14 } })
          ),

          // === FOOTER SECTION ===
          React.createElement(
            View,
            { style: styles.footerRow },

            // Date column
            React.createElement(
              View,
              { style: styles.footerCol },
              React.createElement(Text, { style: styles.footerLabel }, "Date Issued"),
              React.createElement(View, { style: styles.signatureLine }),
              React.createElement(Text, { style: styles.footerValue }, date)
            ),

            // Authorized by (center — signature placeholder)
            React.createElement(
              View,
              { style: { ...styles.footerCol, alignItems: "center" } },
              React.createElement(Text, { style: { ...styles.footerLabel, marginBottom: 10 } }, "Authorized By"),
              React.createElement(View, { style: styles.signatureLine }),
              React.createElement(Text, { style: styles.footerValue }, "Boxspox Academy")
            ),

            // Certificate ID column
            React.createElement(
              View,
              { style: styles.footerCol },
              React.createElement(Text, { style: styles.footerLabel }, "Certificate ID"),
              React.createElement(View, { style: styles.signatureLine }),
              React.createElement(Text, { style: styles.certIdText }, certificateId)
            )
          )
        )
      )
    )
  );
}

export async function GET(request: NextRequest) {
  const certId = request.nextUrl.searchParams.get("id");
  
  try {
    if (!certId) {
      console.error("[CertAPI] No ID provided in query params");
      return NextResponse.json(
        { error: "Missing certificate ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log("[CertAPI] Supabase client created");

    // Get the requester's identity
    const { data: { user: requester }, error: authError } = await supabase.auth.getUser();
    if (authError || !requester) {
      console.error("[CertAPI] Auth error or no requester:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // NEW ROBUST DB-BACKED RATE LIMITING
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count: requestCount } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", requester.id)
      .eq("action", "certificate_download")
      .gte("created_at", oneHourAgo);

    if (requestCount !== null && requestCount >= MAX_REQUESTS_PER_WINDOW) {
      console.warn(`[CertAPI] DB Rate limit exceeded for User: ${requester.id}`);
      return new NextResponse("Rate limit exceeded. You can only download 10 certificates per hour.", {
        status: 429,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Log the attempt
    await supabase.from("activity_logs").insert({
      user_id: requester.id,
      action: "certificate_download",
      target_type: "certificate",
      target_id: certId
    });

    const { data: cert, error: certError } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certId)
      .single();

    if (certError || !cert) {
      console.error("[CertAPI] Certificate fetch error:", certError);
      return NextResponse.json(
        { error: "Certificate record not found" },
        { status: 404 }
      );
    }

    // SECURITY CHECK: Ensure requester is owner OR an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", requester.id)
      .single();

    const isOwner = cert.user_id === requester.id;
    const isAdmin = profile?.role === "admin";

    if (!isOwner && !isAdmin) {
      console.warn(`[CertAPI] Unauthorized access attempt by ${requester.email} for cert ${certId}`);
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to download this certificate" },
        { status: 403 }
      );
    }

    // Fetch related course details separately for maximum reliability
    const { data: course } = await supabase
      .from("courses")
      .select("title, slug")
      .eq("id", cert.course_id)
      .single();

    // STRICT EXAM ENFORCEMENT: Verify enrollment has final_exam_passed === true
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("final_exam_passed")
      .eq("user_id", cert.user_id)
      .eq("course_id", cert.course_id)
      .single();

    const isInstructor = profile?.role === "instructor";

    if (!enrollment?.final_exam_passed && !isAdmin && !isOwner && !isInstructor) {
      console.warn(`[CertAPI] Security Blocked: ${requester.email} attempted to download certificate without passing final exam.`);
      return NextResponse.json(
        { error: "Forbidden: You must pass the Final Certification Exam to download this certificate." },
        { status: 403 }
      );
    }

    console.log("[CertAPI] Data fetched for:", profile?.full_name);
    
    // Use the profile name of the ACTUAL certificate owner, not the requester
    let recipientName = profile?.full_name || "Graduate";
    if (!isOwner) {
       const { data: actualOwner } = await supabase.from("profiles").select("full_name").eq("id", cert.user_id).single();
       if (actualOwner) recipientName = actualOwner.full_name;
    }

    const courseName = course?.title || "Professional Course";
    const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const certificateId = cert.id.substring(0, 13).toUpperCase();

    console.log("[CertAPI] Generating PDF with @react-pdf/renderer...");
    const pdfStream = await ReactPDF.renderToStream(
      CertificateDocument({ recipientName, courseName, date, certificateId })
    );

    // Collect the stream into a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    console.log("[CertAPI] PDF generated successfully");

    const safeRecipient = recipientName.replace(/[^a-zA-Z0-9]/g, "-");
    const safeCourse = courseName.replace(/[^a-zA-Z0-9]/g, "-");
    const safeFileName = `Certificate-${safeRecipient}-${safeCourse}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[CertAPI] Fatal error:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.message },
      { status: 500 }
    );
  }
}
