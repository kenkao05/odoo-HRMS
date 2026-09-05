// Resolves the app's own base URL so we can build absolute redirect links
// (e.g. for Supabase's password-recovery email) that work in every
// environment without hardcoding localhost.
//
// This only runs server-side (called from an API route), so it deliberately
// does NOT use the NEXT_PUBLIC_ prefix -- no need to expose it to the browser.
// Set SITE_URL explicitly in production (e.g. on Vercel) once you have a
// real domain. Falls back to Vercel's auto-provided VERCEL_URL during
// preview/prod builds, then to localhost for local dev.
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}