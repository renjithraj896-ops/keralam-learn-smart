import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Use Supabase helper to parse URL and persist session if available
        // (supabase-js v2 exposes getSessionFromUrl).
        if (typeof supabase.auth.getSessionFromUrl === "function") {
          const { data, error } = await supabase.auth.getSessionFromUrl();
          if (error) {
            console.error("getSessionFromUrl error:", error);
            if (mounted) navigate({ to: "/auth" });
            return;
          }
        } else {
          // Fallback wait briefly for onAuthStateChange to fire (if tokens are set by provider wrapper)
          await new Promise((r) => setTimeout(r, 300));
        }

        // Give auth listener time to pick up session, then navigate into protected area
        if (mounted) {
          navigate({ to: "/profile" });
        }
      } catch (err) {
        console.error("Auth callback handling failed:", err);
        if (mounted) navigate({ to: "/auth" });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
