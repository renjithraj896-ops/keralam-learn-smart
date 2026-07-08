import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSite } from "@/lib/site-context";

export const Route = createFileRoute("/auth/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — Traffic Tips" },
      { name: "description", content: "Choose a new password for your Traffic Tips account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(6, "Min 6 characters").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { lang } = useSite();
  const ml = lang === "ml" ? "lang-ml" : "";
  const t = (en: string, m: string) => (lang === "en" ? en : m);

  // `ready` is true once we have a recovery session (from the emailed link).
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setReady(true);
        setChecking(false);
      }
    });

    // The recovery link may have already established a session by the time we mount.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (password !== confirm) {
      return toast.error(t("Passwords do not match", "പാസ്‌വേഡുകൾ പൊരുത്തപ്പെടുന്നില്ല"));
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) return toast.error(error.message);
      toast.success(t("Password updated — you're all set.", "പാസ്‌വേഡ് അപ്ഡേറ്റ് ചെയ്തു."));
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <Link to="/auth" className={`mb-6 text-sm text-muted-foreground hover:text-primary ${ml}`}>
        ← {t("Back to sign in", "സൈൻ ഇന്നിലേക്ക്")}
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className={`text-2xl font-bold ${ml}`}>
          {t("Set a new password", "പുതിയ പാസ്‌വേഡ് സജ്ജമാക്കുക")}
        </h1>

        {checking ? (
          <p className={`mt-4 text-sm text-muted-foreground ${ml}`}>
            {t("Verifying your reset link…", "നിങ്ങളുടെ ലിങ്ക് പരിശോധിക്കുന്നു…")}
          </p>
        ) : ready ? (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="password" className={ml}>{t("New password", "പുതിയ പാസ്‌വേഡ്")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm" className={ml}>{t("Confirm new password", "പാസ്‌വേഡ് ഉറപ്പിക്കുക")}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t("Please wait…", "ദയവായി കാത്തിരിക്കുക…") : t("Update password", "പാസ്‌വേഡ് അപ്ഡേറ്റ് ചെയ്യുക")}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <p className={`text-sm text-muted-foreground ${ml}`}>
              {t(
                "This reset link is invalid or has expired. Request a new one to continue.",
                "ഈ ലിങ്ക് അസാധുവാണ് അല്ലെങ്കിൽ കാലഹരണപ്പെട്ടു. പുതിയത് അഭ്യർത്ഥിക്കുക.",
              )}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/forgot-password">{t("Request new link", "പുതിയ ലിങ്ക് അഭ്യർത്ഥിക്കുക")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
