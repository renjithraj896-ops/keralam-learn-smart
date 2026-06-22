DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(coalesce(message, '')) <= 4000
    AND length(coalesce(email, '')) <= 320
    AND (user_id IS NULL OR user_id = auth.uid())
  );