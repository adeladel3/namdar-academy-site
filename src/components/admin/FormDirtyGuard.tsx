"use client";

import { useEffect } from "react";

/**
 * Warns the admin if they try to close/reload/navigate away while a form
 * has unsaved changes. Parent passes `dirty={true}` whenever its local form
 * state diverges from the server state.
 *
 * Covers: tab close, reload, external link click. Does NOT intercept
 * in-app <Link> navigation — that would require router integration, which
 * Next.js app-router does not expose cleanly today. Backup protection via
 * beforeunload is enough for the 90%% case.
 */
export default function FormDirtyGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return null;
}
