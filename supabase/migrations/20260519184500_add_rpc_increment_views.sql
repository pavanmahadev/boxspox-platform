-- RPC to increment views on articles
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
