import { NextResponse } from "next/server";

/**
 * Google Search Console verification file.
 *
 * Served at: /googlec54fef805b09cc72.html
 *
 * Google Search Console's "HTML file upload" verification method
 * requires this exact file at the root of the site, with this exact
 * content. Once Google verifies it, you can delete this route.
 */
export async function GET() {
  const content = "google-site-verification: googlec54fef805b09cc72.html";
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
