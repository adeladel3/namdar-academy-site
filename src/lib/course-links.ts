// Slugs that aren't sold as regular on-demand courses. These route to their
// own landing page instead of the generic /courses/[slug] detail page or the
// /dashboard/learn player.
//
// MON is a coaching program — students buy into it via /coaching, not the
// standard catalog. Add more here if we later split out other programs.
const COACHING_SLUGS = new Set(["mon"]);

/** Public detail / catalog link for a course card. Pass `externalHref` from
 *  the course record when available — it wins over the hardcoded fallback. */
export function courseDetailHref(slug: string, externalHref?: string | null): string {
  if (externalHref && externalHref.trim()) return externalHref.trim();
  if (COACHING_SLUGS.has(slug)) return "/coaching";
  return `/courses/${slug}`;
}

/** Dashboard "enter the course" link (content player). When the course is
 *  delivered through SpotPlayer (a spotPlayerCourseId is set), send the
 *  student to the license page instead of the in-site player. */
export function courseLearnHref(
  slug: string,
  externalHref?: string | null,
  spotPlayerCourseId?: string | null
): string {
  if (externalHref && externalHref.trim()) return externalHref.trim();
  if (COACHING_SLUGS.has(slug)) return "/coaching";
  if (spotPlayerCourseId && spotPlayerCourseId.trim())
    return `/dashboard/license/${slug}`;
  return `/dashboard/learn/${slug}`;
}
