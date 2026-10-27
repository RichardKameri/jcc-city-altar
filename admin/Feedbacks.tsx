import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Inbox, LoaderCircle, LogOut, MessageSquareQuote, RefreshCw, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./src/components/ui/badge";
import { Button } from "./src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./src/components/ui/select";

type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED";
type Feedback = {
  id: string;
  name: string;
  message: string;
  profileImageType: string | null;
  status: FeedbackStatus;
  featured: boolean;
  createdAt: string;
};
type FeedbackPage = {
  data: Feedback[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number };
};

const PAGE_SIZE = 20;
const statusStyles: Record<FeedbackStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
};

class FeedbackApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  const payload = response.status === 204 ? undefined : await response.json().catch(() => null) as { error?: string } | undefined;
  if (!response.ok) {
    throw new FeedbackApiError(payload?.error ?? "The request could not be completed.", response.status);
  }
  return payload as T;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminFeedbacks() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FeedbackPage["data"]>([]);
  const [pagination, setPagination] = useState<FeedbackPage["pagination"]>({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (status !== "ALL") params.set("status", status);
    setLoading(true);
    setError("");
    request<FeedbackPage>(`/api/admin/feedback?${params}`, { signal: controller.signal })
      .then((result) => {
        setData(result.data);
        setPagination(result.pagination);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        if (requestError instanceof FeedbackApiError && [401, 403].includes(requestError.status)) {
          navigate("/404", { replace: true });
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Unable to load feedback.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [navigate, page, refreshIndex, status]);

  async function updateFeedback(feedback: Feedback, update: { status?: FeedbackStatus; featured?: boolean }) {
    setBusyId(feedback.id);
    setError("");
    try {
      await request<Feedback>(`/api/admin/feedback/${feedback.id}`, {
        method: "PATCH",
        body: JSON.stringify(update),
      });
      setRefreshIndex((current) => current + 1);
    } catch (requestError) {
      if (requestError instanceof FeedbackApiError && [401, 403].includes(requestError.status)) {
        navigate("/404", { replace: true });
      } else {
        setError(requestError instanceof Error ? requestError.message : "Unable to update feedback.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    await request<void>("/api/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    navigate("/login", { replace: true });
  }

  async function downloadFeedbackPdf() {
    setDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/feedback/export.pdf", { credentials: "include" });
      if (!response.ok) {
        if ([401, 403].includes(response.status)) {
          navigate("/404", { replace: true });
          return;
        }
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to download the feedback PDF.");
      }

      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jcc-city-altar-feedback.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to download the feedback PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><MessageSquareQuote size={18} /></span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">JCC City Altar Admin</p><p className="text-xs text-muted-foreground">Feedback moderation</p></div>
          </div>
          <div className="flex shrink-0 gap-1 sm:gap-2">
            <Button variant="outline" size="icon" aria-label="Contact requests" onClick={() => navigate("/contacts")} className="border-border bg-card sm:w-auto sm:px-3">
              <Inbox /><span className="hidden sm:inline">Contact requests</span>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()} className="text-muted-foreground sm:w-auto sm:px-3">
              <LogOut size={16} /><span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 pb-12 pt-8 sm:px-7 sm:pt-10 lg:px-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Administration</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Feedback</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Approve submissions, then choose which approved feedback appears on the About page.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="outline" onClick={() => void downloadFeedbackPdf()} disabled={downloading} className="w-full border-border bg-card sm:w-auto">
              {downloading ? <LoaderCircle className="animate-spin" /> : <Download />} Download PDF
            </Button>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger aria-label="Filter feedback by status" className="w-full border-border bg-card sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All feedback</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setRefreshIndex((current) => current + 1)} disabled={loading} className="w-full border-border bg-card sm:w-auto">
              {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Refresh
            </Button>
          </div>
        </div>
        {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <section aria-label="Feedback submissions" className="divide-y divide-border border border-border bg-card shadow-sm">
          {loading && data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline animate-spin" size={17} /> Loading feedback</div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">{status === "ALL" ? "No feedback submitted yet." : `No ${status.toLowerCase()} feedback.`}</div>
          ) : data.map((feedback) => {
            const busy = busyId === feedback.id;
            return (
              <article key={feedback.id} className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {feedback.profileImageType && (
                      <img
                        src={`/api/admin/feedback/${feedback.id}/profile-picture`}
                        alt={`${feedback.name}'s profile`}
                        loading="lazy"
                        className="size-12 rounded-full border border-border object-cover"
                      />
                    )}
                    <h2 className="font-semibold">{feedback.name}</h2>
                    <Badge variant="outline" className={`rounded-full ${statusStyles[feedback.status]}`}>{feedback.status.toLowerCase()}</Badge>
                    {feedback.featured && <Badge variant="outline" className="gap-1 rounded-full border-primary/40 text-primary"><Star size={12} /> On About page</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(feedback.createdAt)}</p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{feedback.message}</p>
                </div>
                <div className="flex w-full shrink-0 flex-wrap gap-2 sm:justify-end md:w-auto">
                  {feedback.status !== "APPROVED" && (
                    <Button size="sm" onClick={() => void updateFeedback(feedback, { status: "APPROVED" })} disabled={busy} className="flex-1 sm:flex-none">
                      {busy ? <LoaderCircle className="animate-spin" /> : <Check />} Approve
                    </Button>
                  )}
                  {feedback.status !== "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => void updateFeedback(feedback, { status: "REJECTED" })} disabled={busy} className="flex-1 border-border bg-background sm:flex-none">
                      <X /> Reject
                    </Button>
                  )}
                  {feedback.status === "APPROVED" && (
                    <Button size="sm" variant={feedback.featured ? "secondary" : "outline"} onClick={() => void updateFeedback(feedback, { featured: !feedback.featured })} disabled={busy} className={`w-full sm:w-auto ${feedback.featured ? "" : "border-border bg-background"}`}>
                      <Star /> {feedback.featured ? "Remove from About" : "Show on About"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
          <footer className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-muted-foreground">
              {pagination.totalItems === 0 ? "0 submissions" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, pagination.totalItems)} of ${pagination.totalItems}`}
            </p>
            <div className="flex items-center justify-between gap-1 sm:justify-end sm:gap-2">
              <Button variant="outline" size="sm" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="border-border bg-card px-2 sm:px-3"><ChevronLeft /><span className="hidden sm:inline">Previous</span></Button>
              <span className="min-w-[74px] text-center text-xs text-muted-foreground">Page {page} of {Math.max(pagination.totalPages, 1)}</span>
              <Button variant="outline" size="sm" aria-label="Next page" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="border-border bg-card px-2 sm:px-3"><span className="hidden sm:inline">Next</span><ChevronRight /></Button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
