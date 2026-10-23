import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, UserPlus } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

type InvitationResponse = {
  email: string;
  invitationUrl: string;
  expiresAt: string;
};

export default function AdminInvitation() {
  const [email, setEmail] = useState("");
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInvitation(null);
    setCopied(false);
    try {
      const response = await fetch("/api/admin/auth/invitations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json() as InvitationResponse & { error?: string };
      if (!response.ok) {
        setError(payload.error || "The invitation could not be created.");
        return;
      }
      setInvitation(payload);
    } catch {
      setError("The administrator service is unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInvitation() {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.invitationUrl);
      setCopied(true);
      setError("");
    } catch {
      setError("Could not copy the link. Select and copy it manually.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <UserPlus size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">JCC City Altar Admin</p>
              <p className="text-xs text-muted-foreground">Administrator access</p>
            </div>
          </div>
          <Link to="/" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Back to requests</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-9 sm:px-7 sm:py-12">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Administration</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Invite an administrator</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Create a one-time signup link for a new administrator. It expires after 24 hours, so share it only with the intended person.
          </p>
        </div>

        <section aria-labelledby="invite-form-title" className="mt-8 border border-border border-l-4 border-l-primary bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <UserPlus size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 id="invite-form-title" className="text-lg font-semibold">New administrator</h2>
              <p className="mt-1 text-sm text-muted-foreground">The invitation will be bound to this email address.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">Administrator email</label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 max-w-xl"
              />
            </div>
            {error && <p role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">Link expires 24 hours after it is created.</p>
              <Button type="submit" className="w-full sm:w-auto sm:min-w-48" disabled={submitting}>
                <UserPlus size={16} />
                {submitting ? "Creating invitation…" : "Create invitation"}
              </Button>
            </div>
          </form>

          {invitation && (
            <div className="mt-6 border border-primary/30 bg-primary/5 p-4 sm:p-5">
              <p role="status" className="text-sm leading-6">
                <span className="font-semibold text-primary">Invitation created.</span>{" "}
                Send the link to {invitation.email} before {new Date(invitation.expiresAt).toLocaleString()}.
              </p>
              <div className="mt-4 space-y-2">
                <label htmlFor="invitation-link" className="text-sm font-medium">One-time signup link</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="invitation-link"
                    readOnly
                    value={invitation.invitationUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="font-mono text-xs"
                  />
                  <Button type="button" variant="outline" onClick={copyInvitation} className="shrink-0">
                    <Copy size={16} /> {copied ? "Copied" : "Copy link"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
