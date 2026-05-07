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

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 PDFs per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientData.count += 1;
  return false;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    backgroundColor: "#ffffff",
  },
  border: {
    border: "12pt solid #0f6e56",
    borderRadius: 4,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 3,
    color: "#333333",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0f6e56",
    textTransform: "uppercase",
    letterSpacing: 5,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  name: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    fontStyle: "italic",
  },
  course: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#333333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    bottom: 50,
    left: 60,
    right: 60,
    paddingHorizontal: 20,
  },
  footerItem: {
    textAlign: "center",
  },
  footerLabel: {
    fontSize: 10,
    color: "#999999",
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
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
        React.createElement(Text, { style: styles.course }, courseName),
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
  console.log("[CertAPI] Download request received");

  // Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  if (isRateLimited(ip)) {
    console.warn(`[CertAPI] Rate limit exceeded for IP: ${ip}`);
    return new NextResponse("Too Many Requests. Please try again later.", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Content-Type": "text/plain",
      },
    });
  }

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

    // Fetch profile and course details separately for maximum reliability
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", cert.user_id)
      .single();
    const { data: course } = await supabase
      .from("courses")
      .select("title, slug")
      .eq("id", cert.course_id)
      .single();

    console.log("[CertAPI] Data fetched for:", profile?.full_name);

    const recipientName = profile?.full_name || "Graduate";
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

    const fileName = `Certificate-${recipientName.replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
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
