export const MAX_API_BODY_BYTES = 48 * 1024;

export function validateJsonApiRequest(request: Request, maxBodyBytes = MAX_API_BODY_BYTES): { status: number; error: string; allow?: string } | undefined {
  if (request.method !== "POST") return { status: 405, error: "Method not allowed.", allow: "POST" };
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return { status: 415, error: "Content-Type must be application/json." };
  if (Number(request.headers.get("content-length") || 0) > maxBodyBytes) return { status: 413, error: "Request body is too large." };
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return { status: 403, error: "Cross-site requests are not allowed." };
  if (origin && origin !== new URL(request.url).origin) return { status: 403, error: "Cross-origin requests are not allowed." };
  if (!origin && referer && new URL(referer).origin !== new URL(request.url).origin) return { status: 403, error: "Cross-origin requests are not allowed." };
  return undefined;
}
