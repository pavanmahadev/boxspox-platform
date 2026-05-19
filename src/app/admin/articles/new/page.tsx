import React from "react";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div style={{ padding: "20px 0" }}>
      <ArticleEditor />
    </div>
  );
}
