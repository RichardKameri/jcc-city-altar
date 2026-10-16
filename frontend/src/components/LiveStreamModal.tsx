import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Platform = "youtube" | "facebook";

interface LiveStreamModalProps {
  platform: Platform;
  children: ReactNode;
}

const YOUTUBE_EMBED =
  "https://www.youtube.com/embed/live_stream?channel=UCzRovr_hqD1m24gWhldOLsg";
const FACEBOOK_EMBED =
  "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FJCCCityAltar&tabs=timeline&width=500&height=600";

const LiveStreamModal = ({ platform, children }: LiveStreamModalProps) => {
  const [open, setOpen] = useState(false);
  const isYouTube = platform === "youtube";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="font-display text-xl">
            {isYouTube ? "🔴 YouTube Live" : "🔵 Facebook Live"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full bg-black">
          {isYouTube ? (
            <iframe
              title="YouTube Live Stream"
              width="100%"
              height="450"
              src={YOUTUBE_EMBED}
              frameBorder={0}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full"
            />
          ) : (
            <iframe
              title="Facebook Live Stream"
              src={FACEBOOK_EMBED}
              width="100%"
              height={500}
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder={0}
              allowFullScreen
              className="w-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;
