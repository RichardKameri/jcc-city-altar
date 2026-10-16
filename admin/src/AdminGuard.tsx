import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/auth/me", {
      credentials: "include",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error("Not authorized");
      const payload = await response.json() as { user?: { role?: string } };
      if (payload.user?.role !== "ADMIN") throw new Error("Not authorized");
      setAuthorized(true);
    }).catch(() => {
      if (!controller.signal.aborted) setAuthorized(false);
    }).finally(() => {
      if (!controller.signal.aborted) setChecking(false);
    });

    return () => controller.abort();
  }, []);

  if (checking) return <main className="min-h-screen bg-background" aria-label="Checking administrator access" />;
  if (!authorized) return <Navigate to="/login" replace />;
  return <Outlet />;
}