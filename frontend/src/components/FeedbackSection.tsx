import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp, LoaderCircle, MessageSquareQuote, Send, X } from "lucide-react";
import { motion } from "framer-motion";

type Feedback = {
  id: string;
  name: string;
  message: string;
  profileImageType?: string | null;
  createdAt: string;
};

type SelectedProfileImage = { mimeType: string; data: string; previewUrl: string };

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState<SelectedProfileImage | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/feedback", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Feedback could not be loaded right now.");
        const result = await response.json() as { data: Feedback[] };
        setFeedback(result.data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Feedback could not be loaded right now.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          ...(profileImage ? { profileImage: { mimeType: profileImage.mimeType, data: profileImage.data } } : {}),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "Your feedback could not be submitted. Please try again.");
      }
      setName("");
      setMessage("");
      setProfileImage(null);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your feedback could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function selectProfileImage(file: File | undefined) {
    setSubmitError("");
    if (!file) {
      setProfileImage(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileImage(null);
      setSubmitError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setProfileImage(null);
      setSubmitError("Profile pictures must be 10 MB or smaller.");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Image could not be read."));
        reader.onerror = () => reject(new Error("Image could not be read."));
        reader.readAsDataURL(file);
      });
      const comma = dataUrl.indexOf(",");
      if (comma < 0) throw new Error("Image could not be read.");
      setProfileImage({ mimeType: file.type, data: dataUrl.slice(comma + 1), previewUrl: dataUrl });
    } catch (error) {
      setProfileImage(null);
      setSubmitError(error instanceof Error ? error.message : "Image could not be read.");
    }
  }

  const visibleFeedback = showAll ? feedback : feedback.slice(0, 3);

  return (
    <section aria-labelledby="community-feedback-title" className="mt-20 border-t border-border pt-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <MessageSquareQuote className="mx-auto mb-4 text-accent" size={30} aria-hidden="true" />
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent">Stories from our community</p>
          <h2 id="community-feedback-title" className="mb-3 font-display text-4xl font-bold md:text-5xl">Community Feedback</h2>
          <p className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            Hear what our community has to say, or share your own experience with JCC City Altar.
          </p>
        </motion.div>

        {loadError && <p role="alert" className="mb-6 text-center text-sm text-destructive">{loadError}</p>}
        {loading && <p role="status" className="mb-6 text-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 inline animate-spin" size={16} /> Loading feedback</p>}
        {!loading && !loadError && feedback.length > 0 && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {visibleFeedback.map((item) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <p className="whitespace-pre-wrap break-words font-body text-base leading-7 text-foreground">“{item.message}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    {item.profileImageType && (
                      <img
                        src={`/api/feedback/${item.id}/profile-picture`}
                        alt=""
                        loading="lazy"
                        className="size-11 rounded-full border border-border object-cover"
                      />
                    )}
                    <p className="font-display text-lg font-bold text-accent">{item.name}</p>
                  </div>
                </motion.article>
              ))}
            </div>
            {feedback.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-body text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                  aria-expanded={showAll}
                >
                  {showAll ? "Show less" : "See more feedback"}
                  <ChevronDown size={16} className={showAll ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
              </div>
            )}
          </>
        )}
        {!loading && !loadError && feedback.length === 0 && (
          <p className="mb-8 text-center font-body text-muted-foreground">Be the first to share your experience with us.</p>
        )}

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <button
            type="button"
            aria-expanded={formOpen}
            aria-controls="feedback-submission-form"
            onClick={() => setFormOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-purple-gradient px-6 py-3 font-body font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {formOpen ? "Close feedback form" : "Share your feedback"}
            {formOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {submitted && !formOpen && <p role="status" className="mt-4 text-sm text-green-600">Thank you! Your feedback was submitted for review.</p>}
        </div>
        {formOpen && (
          <form id="feedback-submission-form" onSubmit={(event) => void submitFeedback(event)} className="mx-auto mt-5 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h3 className="font-display text-2xl font-bold">Share your feedback</h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Submissions are reviewed by our team. If approved and selected, your name, picture, and feedback may appear publicly on this page.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback-name" className="font-body text-sm font-medium">Your name</label>
              <input
                id="feedback-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Name to display with your feedback"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback-message" className="font-body text-sm font-medium">Your feedback</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                minLength={10}
                maxLength={2000}
                rows={5}
                required
                className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us about your experience..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback-picture" className="font-body text-sm font-medium">Profile picture (optional)</label>
              <input
                id="feedback-picture"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  void selectProfileImage(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:font-medium"
              />
              <p className="font-body text-xs text-muted-foreground">JPEG, PNG, or WebP; 10 MB maximum. The picture is only shown if your feedback is approved and selected.</p>
              {profileImage && (
                <div className="flex items-center gap-3 pt-2">
                  <img src={profileImage.previewUrl} alt="Selected profile preview" className="size-14 rounded-full border border-border object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">Profile picture selected</span>
                  <button type="button" onClick={() => setProfileImage(null)} aria-label="Remove profile picture" className="rounded p-2 text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
            {submitted && <p role="status" className="text-sm text-green-600">Thank you! Your feedback was submitted for review.</p>}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-purple-gradient px-5 py-3 font-body font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
