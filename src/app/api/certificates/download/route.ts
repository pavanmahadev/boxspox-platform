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
} from "@react-pdf/renderer";

// Rate Limit Settings
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10; // 10 PDFs per hour per user

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#ffffff",
  },
  border: {
    border: "10pt solid #0f6e56",
    borderRadius: 4,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 30,
  },
  content: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    width: "100%",
  },
  logo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 3,
    color: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f6e56",
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
    textAlign: "center",
  },
  name: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  course: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTop: "1px solid #e2e8f0",
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
});

// Certificate PDF Component
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
    null,
    React.createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      React.createElement(
        View,
        { style: styles.border },
        React.createElement(
          View,
          { style: styles.content },
          React.createElement(Text, { style: styles.logo }, "BOXSPOX ACADEMY"),
          React.createElement(
            Text,
            { style: styles.title },
            "Certificate of Completion"
          ),
          React.createElement(
            Text,
            { style: styles.subtitle },
            "This is to certify that"
          ),
          React.createElement(Text, { style: styles.name }, recipientName),
          React.createElement(
            Text,
            { style: styles.subtitle },
            "has successfully completed the professional course"
          ),
          React.createElement(Text, { style: styles.course }, courseName)
        ),
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(
            View,
            { style: styles.footerItem },
            React.createElement(
              Text,
              { style: styles.footerLabel },
              "Date Issued"
            ),
            React.createElement(Text, { style: styles.footerValue }, date)
          ),
          React.createElement(
            View,
            { style: styles.footerItem },
            React.createElement(
              Text,
              { style: styles.footerLabel },
              "Authorized By"
            ),
            React.createElement(
              Text,
              { style: styles.footerValue },
              "Boxspox Academy"
            )
          ),
          React.createElement(
            View,
            { style: styles.footerItem },
            React.createElement(
              Text,
              { style: styles.footerLabel },
              "Certificate ID"
            ),
            React.createElement(
              Text,
              { style: styles.footerValue },
              certificateId
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
