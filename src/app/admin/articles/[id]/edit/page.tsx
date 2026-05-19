import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <ArticleEditor initialArticle={article} />
    </div>
  );
}
