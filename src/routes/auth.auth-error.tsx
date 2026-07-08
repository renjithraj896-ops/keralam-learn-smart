import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/lib/site-context";

export const Route = createFileRoute("/auth/auth-error")({
  validateSearch: (search: Record<string, unknown>) => ({
    message: typeof search.message === "string" ? search.message : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign-in error — Traffic Tips" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthErrorPage,
});

function AuthErrorPage() {
  const { message } = Route.useSearch();
  const { lang } = useSite();
  const ml = lang === "ml" ? "lang-ml" : "";
  const t = (en: string, m: string) => (lang === "en" ? en : m);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
        </div>

        <h1 className={`text-xl font-bold ${ml}`}>
          {t("Sign-in failed", "സൈൻ ഇൻ പരാജയപ്പെട്ടു")}
        </h1>

        <p className={`mt-2 text-sm text-muted-foreground ${ml}`}>
          {t(
            "We couldn't sign you in. This can happen if the login link expired or was already used.",
            "നിങ്ങളെ സൈൻ ഇൻ ചെയ്യാൻ കഴിഞ്ഞില്ല. ലോഗിൻ ലിങ്ക് കാലഹരണപ്പെട്ടതോ ഇതിനകം ഉപയോഗിച്ചതോ ആകാം.",
          )}
        </p>

        {message && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground break-words">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link to="/auth">{t("Back to sign in", "സൈൻ ഇന്നിലേക്ക് മടങ്ങുക")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">{t("Go to home", "ഹോമിലേക്ക്")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
