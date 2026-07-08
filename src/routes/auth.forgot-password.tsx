import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSite } from "@/lib/site-context";

export const Route = createFileRoute("/auth/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password — Traffic Tips" },
      { name: "description", content: "Request a password reset link for your Traffic Tips account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

function ForgotPasswordPage() {
  const { lang } = useSite();
  const ml = lang === "ml" ? "lang-ml" : "";
  const t = (en: string, m: string) => (lang === "en" ? en : m);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) return toast.error(error.message);
      setSent(true);
      toast.success(t("Reset link sent — check your email.", "റീസെറ്റ് ലിങ്ക് അയച്ചു — ഇമെയിൽ പരിശോധിക്കുക."));
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
          {t("Forgot password?", "പാസ്‌വേഡ് മറന്നോ?")}
        </h1>
        <p className={`mt-1 text-sm text-muted-foreground ${ml}`}>
          {t(
            "Enter your account email and we'll send you a link to reset your password.",
            "നിങ്ങളുടെ ഇമെയിൽ നൽകുക — പാസ്‌വേഡ് റീസെറ്റ് ചെയ്യാൻ ഒരു ലിങ്ക് അയയ്ക്കും.",
          )}
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className={`text-sm text-foreground ${ml}`}>
              {t(
                "If an account exists for that email, a reset link is on its way. It may take a few minutes to arrive.",
                "ആ ഇമെയിലിന് ഒരു അക്കൗണ്ട് ഉണ്ടെങ്കിൽ, റീസെറ്റ് ലിങ്ക് അയച്ചിട്ടുണ്ട്. കുറച്ച് മിനിറ്റ് എടുത്തേക്കാം.",
              )}
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              {t("Send another link", "മറ്റൊരു ലിങ്ക് അയയ്ക്കുക")}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="email" className={ml}>{t("Email", "ഇമെയിൽ")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t("Please wait…", "ദയവായി കാത്തിരിക്കുക…") : t("Send reset link", "റീസെറ്റ് ലിങ്ക് അയയ്ക്കുക")}
            </Button>
          </form>
        )}

        <p className={`mt-4 text-center text-xs text-muted-foreground ${ml}`}>
          {t("Remembered it? ", "ഓർമ്മ വന്നോ? ")}
          <Link to="/auth" className="underline">{t("Sign in", "സൈൻ ഇൻ")}</Link>
        </p>
      </div>
    </div>
  );
}
