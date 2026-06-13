"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import ExamForm from "@/components/instructor/ExamForm";

export default function CreateExam() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (exam: any, questions: any[]) => {
    const res = await fetch("/api/exams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, questions }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    showToast("✅ Exam created successfully!", "success");
    router.push("/instructor/exams");
    router.refresh();
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/instructor/exams" style={{
          width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-card)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border-primary)", color: "var(--text-primary)"
        }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
            Create Exam
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>Configure settings and add multiple question types.</p>
        </div>
      </div>

      <ExamForm onSubmit={handleSubmit} submitLabel="Create Complete Exam" />
    </div>
  );
}
