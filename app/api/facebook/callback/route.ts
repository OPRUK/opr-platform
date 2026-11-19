import type { NextRequest } from "next/server";
import { finishOpcOAuth } from "../../../../lib/opc-social-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return finishOpcOAuth(request, "facebook");
}
