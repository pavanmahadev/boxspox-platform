"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEGMENT_LABELS: Record<string, string> = {
  courses: "Courses",
  users: "Users",
  submissions: "Submissions",
  settings: "Settings",
  paths: "Learning Paths",
  new: "New Course",
  activity: "Activity",
};

// Cache resolved names to avoid re-fetching on every render
const nameCache: Record<string, string> = {};

function useResourceName(id: string, table: "courses" | "profiles" | null) {
  const [name, setName] = useState<string>(nameCache[id] || "");
  const fetchedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (!table || !UUID_REGEX.test(id) || fetchedRef.current || nameCache[id]) {
      if (nameCache[id]) setName(nameCache[id]);
      return;
    }
    fetchedRef.current = true;

    async function fetch() {
      if (table === "courses") {
        const { data } = await supabase.from("courses").select("title").eq("id", id).single();
        if (data?.title) {
          nameCache[id] = data.title;
          setName(data.title);
        }
      } else if (table === "profiles") {
        const { data } = await supabase.from("profiles").select("full_name, email").eq("id", id).single();
        if (data) {
          const resolved = data.full_name || data.email || "User";
          nameCache[id] = resolved;
          setName(resolved);
        }
      }
    }
    fetch();
  }, [id, table]);

  return name;
}

interface SegmentProps {
  id: string;
  table: "courses" | "profiles" | null;
  label: string;
  href: string;
  isLast: boolean;
}

function ResolvedSegment({ id, table, label, href, isLast }: SegmentProps) {
  const resolved = useResourceName(id, table);
  const displayLabel = UUID_REGEX.test(id) ? (resolved || "...") : label;

  const textStyle: React.CSSProperties = {
    color: isLast ? "var(--text-tertiary)" : "var(--text-secondary)",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  return (
    <>
      <span style={{ color: "var(--border-primary)", margin: "0 2px" }}>/</span>
      {isLast ? (
        <span style={textStyle}>{displayLabel}</span>
      ) : (
        <Link href={href} style={textStyle}>
          {displayLabel}
        </Link>
      )}
    </>
  );
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const allSegments = pathname.split("/").filter(Boolean);
  // allSegments = ["admin", "courses", "uuid"] etc.

  // Segments after "admin"
  const segments = allSegments.slice(1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
      <Link
        href="/admin"
        style={{ color: "var(--text-secondary)", fontWeight: 700, textDecoration: "none", fontSize: "13px" }}
      >
        Admin
      </Link>

      {segments.map((seg, i) => {
        const href = "/" + allSegments.slice(0, i + 2).join("/");
        const isLast = i === segments.length - 1;
        const isUUID = UUID_REGEX.test(seg);

        // Determine which table to look up based on parent segment
        let table: "courses" | "profiles" | null = null;
        if (isUUID) {
          const parent = segments[i - 1];
          if (parent === "courses") table = "courses";
          else if (parent === "users") table = "profiles";
        }

        const label = SEGMENT_LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <ResolvedSegment
            key={`${seg}-${i}`}
            id={seg}
            table={table}
            label={label}
            href={href}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}
