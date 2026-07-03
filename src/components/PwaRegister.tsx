"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount. Runs on every public page so the
 * install prompt becomes available as soon as the user visits the site
 * (Chrome requires an active controller before firing `beforeinstallprompt`).
 *
 * Only attaches in production — dev mode does lots of HMR fetching that
 * a service worker would interfere with.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register after the load event so SW boot doesn't compete with
    // first-paint resources.
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Registration can fail in private-mode windows or when a CSP
          // blocks worker-src. Swallow silently — app still works, it
          // just won't be installable in that session.
        });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);

  return null;
}
