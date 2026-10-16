import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (response.status === 401) {
          setError("Email or password was not accepted.");
        } else if (response.status === 403) {
          setError(payload.error || "Access denied.");
        } else if (response.status === 429) {
          setError("Too many sign-in attempts. Please try again later.");
        } else {
          setError("The administrator service is unavailable. Please try again later.");
        }
        return;
      }
      navigate("/", { replace: true });
    } catch {
      setError("The administrator service is unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12),transparent_42%),radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.12),transparent_38%)]" />
      <section className="relative w-full max-w-md border border-border bg-card p-7 shadow-xl sm:p-9">
        <div className="mb-6 grid size-12 place-items-center bg-primary text-primary-foreground"><LockKeyhole className="size-5" /></div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">JCC City Altar administration</p>
        <h1 className="text-3xl font-bold">Administrator sign in</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in with your seeded administrator account.</p>
        {searchParams.get("registered") === "1" && (
          <p role="status" className="mt-4 text-sm text-green-700">Your account is ready. Sign in with your new credentials.</p>
        )}
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-sm font-medium">Email</label>
            <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="admin-password" className="text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
        </form>
      </section>
    </main>
  );
}