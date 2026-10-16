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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-950">
      <section className="w-full max-w-lg border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950">
          <ArrowLeft size={16} /> Back to requests
        </Link>
        <div className="mb-5 grid size-12 place-items-center bg-slate-900 text-amber-300">
          <UserPlus size={20} />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Administration</p>
        <h1 className="text-3xl font-semibold">Invite an administrator</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create a one-time signup link for a new administrator. The link expires after 24 hours; share it only with the intended person.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium">New administrator email</label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating invitation…" : "Create invitation"}
          </Button>
        </form>

        {invitation && (
          <div className="mt-6 space-y-3 border border-slate-200 bg-slate-50 p-4">
            <p role="status" className="text-sm font-medium text-emerald-800">
              Invitation created for {invitation.email}. Expires {new Date(invitation.expiresAt).toLocaleString()}.
            </p>
            <label htmlFor="invitation-link" className="text-sm font-medium">Signup link</label>
            <Input id="invitation-link" readOnly value={invitation.invitationUrl} onFocus={(event) => event.currentTarget.select()} />
            <Button type="button" variant="outline" onClick={copyInvitation}>
              <Copy size={16} /> {copied ? "Copied" : "Copy invitation link"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
