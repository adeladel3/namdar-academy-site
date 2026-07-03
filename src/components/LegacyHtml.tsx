"use client";

import { useEffect, useRef } from "react";

/**
 * LegacyHtml — safely render admin-authored HTML that may contain <script>
 * and <style> tags.
 *
 * Why not just `dangerouslySetInnerHTML`?
 *   React's reconciler walks the parsed tree and warns ("Encountered a
 *   script tag while rendering React component") because inline <script>
 *   tags inserted that way are parsed into DOM nodes but the browser will
 *   not execute them. For legacy CMS bodies (e.g. the `calculator` static
 *   page migrated from the old site) that ships working interactive HTML,
 *   we need the scripts to actually run.
 *
 * What this does instead:
 *   - Sets innerHTML on a ref'd <div> after mount (bypasses React's parser).
 *   - Walks the injected tree, clones each <script> node, and replaces it
 *     with the clone — this is how you trigger browser execution of
 *     otherwise-inert script nodes.
 *   - External `<script src=…>` tags are awaited sequentially so dependent
 *     inline scripts below them see their globals.
 *
 * Only use with content authored by trusted staff (admin-managed). The
 * staticPages table is admin-only CRUD, so that's fine here.
 */
export default function LegacyHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    host.innerHTML = html;

    // Replace each <script> with a fresh cloned one so the browser runs it.
    // For external scripts, chain them so ordering holds.
    const originals = Array.from(host.querySelectorAll("script"));
    let cancelled = false;

    const runNext = (i: number) => {
      if (cancelled || i >= originals.length) return;
      const old = originals[i];
      const replacement = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        replacement.setAttribute(attr.name, attr.value);
      }
      replacement.text = old.textContent ?? "";
      const onDone = () => runNext(i + 1);
      if (old.src) {
        replacement.onload = onDone;
        replacement.onerror = onDone;
      }
      old.parentNode?.replaceChild(replacement, old);
      if (!old.src) onDone();
    };
    runNext(0);

    return () => {
      cancelled = true;
      host.innerHTML = "";
    };
  }, [html]);

  return <div ref={ref} className={className} />;
}
