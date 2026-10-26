import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Inbox,
  LoaderCircle,
  LogOut,
  Mail,
  MessageSquareQuote,
  Phone,
  Moon,
  Reply,
  RefreshCw,
  Search,
  Send,
  Sun,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./src/components/ui/alert-dialog";
import { Badge } from "./src/components/ui/badge";
import { Button } from "./src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./src/components/ui/dialog";
import { Input } from "./src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./src/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./src/components/ui/tooltip";

type ContactStatus = "PENDING" | "IN_PROGRESS" | "RESPONDED";
type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};
type ContactListResponse = {
  data: ContactSubmission[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number };
};
type ContactStats = { totalRequests: number; pendingCount: number; inProgressCount: number; respondedCount: number };
type ReplyChannel = "email" | "sms";

const PAGE_SIZE = 10;
const statusStyles: Record<ContactStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-800",
  RESPONDED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(path, { ...init, headers, credentials: "include" });
  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new AdminApiError(payload?.error || "The request could not be completed.", response.status);
  }
  return payload as T;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminContacts() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("jcc-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [settledSearch, setSettledSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState<ContactListResponse["pagination"]>({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [downloadingMessages, setDownloadingMessages] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [replyContact, setReplyContact] = useState<ContactSubmission | null>(null);
  const [replyChannel, setReplyChannel] = useState<ReplyChannel>("email");
  const [replyRecipient, setReplyRecipient] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [smtpUnavailable, setSmtpUnavailable] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light");
    window.localStorage.setItem("jcc-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSettledSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (settledSearch) params.set("search", settledSearch);
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    setListLoading(true);
    setError("");
    apiRequest<ContactListResponse>(`/api/admin/contacts?${params}`, { signal: controller.signal })
      .then((result) => {
        setContacts(result.data);
        setPagination(result.pagination);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
          navigate("/404", { replace: true });
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Unable to load messages.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setListLoading(false);
      });

    return () => controller.abort();
  }, [page, settledSearch, statusFilter, refreshIndex, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<ContactStats>("/api/admin/contacts/stats", { signal: controller.signal })
      .then(setStats)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
          navigate("/404", { replace: true });
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Unable to load message totals.");
      });
    return () => controller.abort();
  }, [refreshIndex, navigate]);

  async function disconnect() {
    await apiRequest<void>("/api/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    setContacts([]);
    setStats(null);
    navigate("/login", { replace: true });
  }

  async function changeStatus(contact: ContactSubmission) {
    const nextStatus = {
      PENDING: "IN_PROGRESS",
      IN_PROGRESS: "RESPONDED",
      RESPONDED: "PENDING",
    }[contact.status] as ContactStatus;
    setBusyId(contact.id);
    setError("");
    try {
      await apiRequest<ContactSubmission>(`/api/admin/contacts/${contact.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
        navigate("/404", { replace: true });
      } else {
        setError(requestError instanceof Error ? requestError.message : "Unable to update this message.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function deleteContact() {
    if (!pendingDelete) return;
    const contact = pendingDelete;
    setBusyId(contact.id);
    setError("");
    try {
      await apiRequest<void>(`/api/admin/contacts/${contact.id}`, { method: "DELETE" });
      setPendingDelete(null);
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
        navigate("/404", { replace: true });
      } else {
        setError(requestError instanceof Error ? requestError.message : "Unable to delete this message.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function downloadMessagesPdf() {
    setDownloadingMessages(true);
    setError("");
    try {
      const response = await fetch("/api/admin/contacts/export.pdf", { credentials: "include" });
      if (!response.ok) {
        if ([401, 403].includes(response.status)) {
          navigate("/404", { replace: true });
          return;
        }
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to download contact messages.");
      }

      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jcc-city-altar-contact-messages.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to download contact messages.");
    } finally {
      setDownloadingMessages(false);
    }
  }

  function openReply(contact: ContactSubmission, channel: ReplyChannel = "email") {
    setReplyContact(contact);
    setReplyChannel(channel);
    setReplyRecipient(channel === "email" ? contact.email : contact.phone ?? "");
    setReplyMessage("");
    setReplyError("");
    setSmtpUnavailable(false);
  }

  function changeReplyChannel(channel: ReplyChannel) {
    setReplyChannel(channel);
    setReplyRecipient(channel === "email" ? replyContact?.email ?? "" : replyContact?.phone ?? "");
    setReplyError("");
    setSmtpUnavailable(false);
  }

  async function sendEmailReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!replyContact) return;

    setReplySending(true);
    setReplyError("");
    setSmtpUnavailable(false);
    try {
      await apiRequest<{ sent: true }>(`/api/admin/contacts/${replyContact.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: replyMessage }),
      });
      setReplyContact(null);
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
        navigate("/404", { replace: true });
      } else {
        setReplyError(requestError instanceof Error ? requestError.message : "Unable to send this reply.");
        setSmtpUnavailable(requestError instanceof AdminApiError && requestError.status === 503);
      }
    } finally {
      setReplySending(false);
    }
  }

  const validPhoneRecipient = /^\+?[0-9][0-9 ()-]{5,30}$/.test(replyRecipient.trim());
  const emailDraftUrl = replyContact
    ? `mailto:${encodeURIComponent(replyRecipient)}?subject=${encodeURIComponent(`Re: ${replyContact.subject.replace(/^re:\s*/i, "")}`)}&body=${encodeURIComponent(`Hello ${replyContact.name},\n\n${replyMessage}`)}`
    : undefined;

  const metrics = [
    { label: "Total Requests", value: stats?.totalRequests, icon: Inbox, accent: "text-muted-foreground", wash: "bg-muted" },
    { label: "Pending", value: stats?.pendingCount, icon: Clock3, accent: "text-amber-800", wash: "bg-amber-100" },
    { label: "In Progress", value: stats?.inProgressCount, icon: RefreshCw, accent: "text-sky-800", wash: "bg-sky-100" },
    { label: "Responded", value: stats?.respondedCount, icon: CircleCheck, accent: "text-emerald-800", wash: "bg-emerald-100" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-vibrant-gradient text-primary-foreground">
                <Mail size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">JCC City Altar Admin</p>
                <p className="text-xs text-muted-foreground">Contact & Demo Requests</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="text-foreground hover:text-primary"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnect} className="text-muted-foreground hover:text-foreground">
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-7 sm:pt-10 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Administration</p>
              <h1 className="text-3xl font-semibold tracking-normal text-foreground">JCC City Altar Admin - Contact &amp; Demo Requests</h1>
              <p className="mt-2 text-sm text-muted-foreground">Review and manage incoming contact and demo requests.</p>
            </div>
            <div className="flex items-center gap-2 self-end">
              <Button variant="outline" onClick={() => void downloadMessagesPdf()} disabled={downloadingMessages} className="border-border bg-card text-foreground">
                {downloadingMessages ? <LoaderCircle className="animate-spin" /> : <Download />}
                <span className="hidden sm:inline">Download messages</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button variant="outline" onClick={() => navigate("/feedback")} className="border-border bg-card text-foreground">
                <MessageSquareQuote /> Feedback
              </Button>
              <Button variant="outline" onClick={() => navigate("/invite")} className="border-border bg-card text-foreground">
                <UserPlus /> Invite admin
              </Button>
              <Button asChild variant="link" className="text-primary">
                <a href="#request-list">View details <ArrowRight /></a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setRefreshIndex((value) => value + 1)}
                disabled={listLoading}
                className="border-border bg-card text-foreground"
              >
                {listLoading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                Refresh
              </Button>
            </div>
          </div>

          <section aria-label="Request totals" className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, accent, wash }) => (
              <article key={label} className="flex min-h-[104px] items-center justify-between border border-border bg-card px-5 py-4 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                    {value === undefined ? <span className="text-muted-foreground">—</span> : value.toLocaleString()}
                  </p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-md ${wash} ${accent}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
              </article>
            ))}
          </section>

          <section id="request-list" aria-label="Contact submissions" className="border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="relative w-full sm:max-w-sm">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name or email"
                  aria-label="Search name or email"
                  className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger aria-label="Filter by status" className="w-full border-border bg-background text-foreground sm:w-44">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESPONDED">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">{error}</div>}

            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-muted">
                  <TableRow className="hover:bg-muted">
                    <TableHead className="w-[180px] px-5 text-xs uppercase tracking-wide text-muted-foreground">Sender</TableHead>
                    <TableHead className="w-[190px] text-xs uppercase tracking-wide text-muted-foreground">Subject</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Message</TableHead>
                    <TableHead className="w-[115px] text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[155px] text-xs uppercase tracking-wide text-muted-foreground">Received</TableHead>
                    <TableHead className="w-[142px] pr-5 text-right text-xs uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading && contacts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-36 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline animate-spin" size={17} /> Loading messages</TableCell></TableRow>
                  ) : contacts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-36 text-center text-sm text-muted-foreground">{settledSearch || statusFilter !== "ALL" ? "No matching messages." : "No messages yet."}</TableCell></TableRow>
                  ) : contacts.map((contact) => {
                    const nextLabel = {
                      PENDING: "Move to in progress",
                      IN_PROGRESS: "Mark as responded",
                      RESPONDED: "Reopen request",
                    }[contact.status];
                    const isBusy = busyId === contact.id;
                    return (
                      <TableRow key={contact.id} className="align-top hover:bg-muted/50">
                        <TableCell className="px-5 py-4">
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <a href={`mailto:${contact.email}`} className="mt-1 block truncate text-xs text-muted-foreground hover:text-primary hover:underline">{contact.email}</a>
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`} className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary hover:underline">
                              <Phone size={12} aria-hidden="true" /> <span>Phone: {contact.phone}</span>
                            </a>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">Phone not provided</p>
                          )}
                        </TableCell>
                        <TableCell className="py-4 font-medium text-foreground">{contact.subject}</TableCell>
                        <TableCell className="max-w-0 py-3">
                          <p className="max-w-[30rem] truncate text-muted-foreground">{contact.message}</p>
                          <Button variant="ghost" size="sm" onClick={() => openReply(contact)} className="mt-1 -ml-3 h-8 text-primary">
                            <Reply size={15} /> Reply
                          </Button>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[contact.status]}`}>
                            {contact.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-xs tabular-nums text-muted-foreground">{formatDate(contact.createdAt)}</TableCell>
                        <TableCell className="py-3 pr-5">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={nextLabel} title={nextLabel} disabled={isBusy} onClick={() => void changeStatus(contact)} className="h-9 w-9 text-muted-foreground hover:text-primary">
                                  {contact.status === "PENDING" ? <Clock3 /> : contact.status === "IN_PROGRESS" ? <RefreshCw /> : <Check />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{nextLabel}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="View full message" title="View full message" onClick={() => setSelectedContact(contact)} className="h-9 w-9 text-muted-foreground">
                                  <Eye />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View full message</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Delete message" title="Delete message" disabled={isBusy} onClick={() => setPendingDelete(contact)} className="h-9 w-9 text-muted-foreground hover:bg-red-50 hover:text-red-700">
                                  <Trash2 />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete message</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                {pagination.totalItems === 0 ? "0 messages" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, pagination.totalItems)} of ${pagination.totalItems}`}
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" aria-label="Previous page" disabled={page <= 1 || listLoading} onClick={() => setPage((value) => value - 1)} className="border-border bg-card">
                  <ChevronLeft /> Previous
                </Button>
                <span className="min-w-[74px] text-center text-xs tabular-nums text-muted-foreground">Page {page} of {Math.max(pagination.totalPages, 1)}</span>
                <Button variant="outline" size="sm" aria-label="Next page" disabled={page >= pagination.totalPages || listLoading} onClick={() => setPage((value) => value + 1)} className="border-border bg-card">
                  Next <ChevronRight />
                </Button>
              </div>
            </footer>
          </section>
        </main>

        <Dialog open={Boolean(selectedContact)} onOpenChange={(open) => { if (!open) setSelectedContact(null); }}>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card text-card-foreground sm:max-w-xl">
            {selectedContact && (
              <>
                <DialogHeader className="pr-7 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contact message</p>
                  <DialogTitle className="pt-1 text-xl">{selectedContact.subject}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    From {selectedContact.name} · {formatDate(selectedContact.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                <a href={`mailto:${selectedContact.email}`} className="w-fit text-sm font-medium text-primary hover:underline">{selectedContact.email}</a>
                {selectedContact.phone ? (
                  <a href={`tel:${selectedContact.phone}`} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline">
                    <Phone size={15} aria-hidden="true" /> Phone: {selectedContact.phone}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Phone not provided</p>
                )}
                <div className="max-h-[45vh] overflow-y-auto border-y border-border py-5 text-sm leading-7 text-foreground">
                  <p className="whitespace-pre-wrap break-words">{selectedContact.message}</p>
                </div>
                <div className="flex justify-between">
                  <Button onClick={() => { openReply(selectedContact); setSelectedContact(null); }} className="bg-primary text-primary-foreground">
                    <Reply /> Reply
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedContact(null)} className="border-border bg-background">Close</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(replyContact)} onOpenChange={(open) => { if (!open && !replySending) setReplyContact(null); }}>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card text-card-foreground sm:max-w-xl">
            {replyContact && (
              <>
                <DialogHeader className="pr-7 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Reply to message</p>
                  <DialogTitle className="pt-1 text-xl">{replyContact.subject}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Replying to {replyContact.name}
                    {replyChannel === "email" && " · Sent from jcccityaltar@gmail.com"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(event) => void sendEmailReply(event)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reply-channel" className="text-sm font-medium">Reply by</label>
                    <Select value={replyChannel} onValueChange={(value) => changeReplyChannel(value as ReplyChannel)}>
                      <SelectTrigger id="reply-channel" className="border-border bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        {replyContact.phone && <SelectItem value="sms">Text message (SMS)</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reply-recipient" className="text-sm font-medium">
                      {replyChannel === "email" ? "Email address" : "Phone number"}
                    </label>
                    <Input
                      id="reply-recipient"
                      type={replyChannel === "email" ? "email" : "tel"}
                      value={replyRecipient}
                      onChange={(event) => setReplyRecipient(event.target.value)}
                      readOnly={replyChannel === "email"}
                      required
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reply-message" className="text-sm font-medium">Your reply</label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      required
                      maxLength={5000}
                      rows={6}
                      className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Write your reply..."
                    />
                  </div>
                  {replyError && <p role="alert" className="text-sm text-red-700">{replyError}</p>}
                  {smtpUnavailable && (
                    <p className="text-sm text-muted-foreground">
                      You can still send this reply from your email app. The draft will open with the recipient and reply filled in.
                    </p>
                  )}
                  {replyChannel === "sms" ? (
                    <>
                      <p className="text-xs text-muted-foreground">This opens your device's messaging app with the reply ready to send.</p>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setReplyContact(null)} className="border-border bg-background">Cancel</Button>
                        <Button asChild disabled={!replyMessage.trim() || !validPhoneRecipient} className="bg-primary text-primary-foreground">
                          <a href={validPhoneRecipient ? `sms:${replyRecipient.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(replyMessage)}` : undefined}>
                            <Phone /> Open SMS
                          </a>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setReplyContact(null)} disabled={replySending} className="border-border bg-background">Cancel</Button>
                      {smtpUnavailable && (
                        <Button asChild disabled={!replyMessage.trim() || !replyRecipient.trim()} className="bg-primary text-primary-foreground">
                          <a href={emailDraftUrl}><Mail /> Open email app</a>
                        </Button>
                      )}
                      {!smtpUnavailable && (
                        <Button type="submit" disabled={replySending || !replyMessage.trim()} className="bg-primary text-primary-foreground">
                          {replySending ? <LoaderCircle className="animate-spin" /> : <Send />}
                          Send email
                        </Button>
                      )}
                    </div>
                  )}
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
          <AlertDialogContent className="border-border bg-card text-card-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This permanently removes the message from the inbox. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border bg-background">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void deleteContact()} className="bg-red-700 text-white hover:bg-red-800">
                Delete message
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default AdminContacts;