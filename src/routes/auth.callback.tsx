import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const goError = (message: string) =>
      navigate({ to: "/auth/auth-error", search: { message } });

    const finish = async () => {
      const url = new URL(window.location.href);

      // 1. Provider returned an explicit error (e.g. user denied access).
      const providerError =
        url.searchParams.get("error_description") || url.searchParams.get("error");
      if (providerError) {
        if (!cancelled) goError(providerError);
        return;
      }

      // 2. Authorization-code (PKCE) flow: Supabase redirects with ?code=...
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          goError(error.message);
          return;
        }
        navigate({ to: "/" });
        return;
      }

      // 3. Token/hash flow (used by the Lovable OAuth wrapper + implicit flow):
      // the session is set via supabase.auth.setSession or detectSessionInUrl.
      // Poll briefly for the hydrated session.
      for (let i = 0; i < 20; i++) {
        if (cancelled) return;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate({ to: "/" });
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }

      // 4. Nothing resolved a session — surface a friendly error.
      if (!cancelled) goError("We couldn't complete your sign-in. Please try again.");
    };

    // React immediately if the session arrives via onAuthStateChange.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        if (!cancelled) navigate({ to: "/" });
      }
    });

    finish();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
