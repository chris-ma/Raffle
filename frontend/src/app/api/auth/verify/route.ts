import { isAdmin, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorizedResponse();
  return Response.json({ ok: true });
}
