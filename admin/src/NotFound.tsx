import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is unavailable.</p>
        <Link to="/login" className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline">Administrator sign in</Link>
      </div>
    </main>
  );
}