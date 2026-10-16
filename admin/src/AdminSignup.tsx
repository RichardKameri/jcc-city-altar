import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function AdminSignup() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = new URLSearchParams(window.location.hash.slice(1)).get("invite") ?? "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!token) {
      setError("This signup link is missing its invitation. Ask an administrator for a new link.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setError(payload.error || "The account could not be created.");
        return;
      }
      navigate("/login?registered=1", { replace: true });
    } catch {
      setError("The administrator service is unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12),transparent_42%),radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.12),transparent_38%)]" />
      <section className="relative w-full max-w-md border border-border bg-card p-7 shadow-xl sm:p-9">
        <Link to="/login" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="mb-6 grid size-12 place-items-center bg-primary text-primary-foreground"><LockKeyhole className="size-5" /></div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">JCC City Altar administration</p>
        <h1 className="text-3xl font-bold">Create administrator account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a password with at least 14 characters.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
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
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={14}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="admin-confirm-password" className="text-sm font-medium">Confirm password</label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Input
              id="admin-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={14}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting || !token}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </section>
    </main>
  );
}
