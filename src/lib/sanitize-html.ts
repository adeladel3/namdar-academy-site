import DOMPurify from "isomorphic-dompurify";

/**
 * Strip scripts and dangerous attributes from admin/staff-authored HTML.
 *
 * Rationale: staff (support + instructor roles) can edit article content,
 * course descriptions, lesson bodies, FAQ answers. Without sanitization,
 * a rogue staff account could inject `<script>` that runs in an admin's
 * browser when reviewing the content — classic stored-XSS → privilege
 * escalation path. CSP is also lenient (unsafe-inline allowed in prod for
 * the chat widget), so it offers no defense in depth against this vector.
 *
 * We DO NOT sanitize staticPages body — that content is gated behind
 * admin-only CRUD and is rendered via the intentional <LegacyHtml> escape
 * hatch (so the migrated calculator page can run its own script). Admins
 * can author anything; they already have the keys.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: [
      "onload",
      "onerror",
      "onclick",
      "onfocus",
      "onmouseover",
      "onmouseout",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onsubmit",
      "srcdoc",
      "formaction",
    ],
    // Block javascript:, data: (except safe images), vbscript:.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|\/|#|data:image\/(?:png|jpe?g|webp|gif|svg\+xml);)/i,
  });
}
