import { finishOpcOAuth } from "../../../../lib/opc-social-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return finishOpcOAuth(request, "facebook");
}
