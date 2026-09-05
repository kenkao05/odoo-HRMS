// Resolves the app's own base URL so we can build absolute redirect links
// (e.g. for Supabase's password-recovery email) that work in every
// environment without hardcoding localhost.
//
// Set NEXT_PUBLIC_SITE_URL explicitly in production (e.g. on Vercel) once
// you have a real domain. Falls back to Vercel's auto-provided VERCEL_URL
// during preview/prod builds, then to localhost for local dev.
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}