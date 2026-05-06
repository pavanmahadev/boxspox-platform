import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import puppeteer from "puppeteer";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
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
      return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 });
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
      return NextResponse.json({ error: "Certificate record not found" }, { status: 404 });
    }

    // Fetch profile and course details separately for maximum reliability
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", cert.user_id).single();
    const { data: course } = await supabase.from("courses").select("title, slug").eq("id", cert.course_id).single();

    console.log("[CertAPI] Data fetched for:", profile?.full_name);

    const recipientName = profile?.full_name || "Graduate";
    const courseName = course?.title || "Professional Course";
    const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const certificateId = cert.id.substring(0, 13).toUpperCase();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Certificate</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
              body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: white; }
              .cert-container { width: 297mm; height: 210mm; padding: 20mm; box-sizing: border-box; }
              .cert-border { border: 15px solid #0f6e56; height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-radius: 4px; }
              .logo { font-size: 24px; font-weight: 900; margin-bottom: 20px; }
              .title { font-size: 40px; font-weight: 900; color: #0f6e56; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 30px; }
              .name { font-family: 'Playfair Display', serif; font-size: 60px; font-style: italic; font-weight: 700; margin-bottom: 20px; }
              .course { font-size: 30px; font-weight: 800; margin-bottom: 40px; text-align: center; max-width: 80%; }
              .footer { width: 80%; display: flex; justify-content: space-between; position: absolute; bottom: 50px; font-size: 14px; }
              .footer div { text-align: center; }
              .footer b { display: block; font-size: 18px; margin-top: 5px; }
          </style>
      </head>
      <body>
          <div class="cert-container">
              <div class="cert-border">
                  <div class="logo">BOXSPOX ACADEMY</div>
                  <div class="title">Certificate of Completion</div>
                  <div>This is to certify that</div>
                  <div class="name">${recipientName}</div>
                  <div>has successfully completed the professional course</div>
                  <div class="course">${courseName}</div>
                  <div class="footer">
                      <div>Date Issued<b>${date}</b></div>
                      <div>Authorized By<b>Boxspox Academy</b></div>
                      <div>Certificate ID<b>${certificateId}</b></div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    console.log("[CertAPI] Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 30000, // 30s launch timeout
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794 });
    
    console.log("[CertAPI] Setting content...");
    await page.setContent(htmlTemplate, { waitUntil: 'load' });
    
    // Give it a tiny bit of extra time for fonts if needed
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("[CertAPI] Rendering PDF...");
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
    });
    
    await browser.close();
    console.log("[CertAPI] Browser closed");

    const pdfBuffer = Buffer.from(pdfUint8Array);
    const fileName = `Certificate-${recipientName.replace(/\s+/g, '-')}.pdf`;

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
    return NextResponse.json({ error: "PDF generation failed", details: err.message }, { status: 500 });
  }
}
