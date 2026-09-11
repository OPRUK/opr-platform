import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

test("every admin route handler applies the shared AAL2 guard", () => {
  const adminRoutes = readdirSync("app/api/admin", { recursive: true })
    .map(String)
    .filter((path) => path.endsWith("route.ts"))
    .map((path) => `app/api/admin/${path}`);

  assert.ok(adminRoutes.length > 0, "the admin API route inventory must not be empty");

  for (const route of adminRoutes) {
    const source = readFileSync(route, "utf8");
    const handlers = source.match(/export async function (?:GET|POST|PUT|PATCH|DELETE)\b/g) ?? [];
    const protectedGatewayCalls =
      source.match(/await (?:requireAdmin|getNewsletterAudience)\(request\)/g) ?? [];

    assert.match(source, /import \{ requireAdmin \}/, `${route} must import requireAdmin`);
    assert.ok(handlers.length > 0, `${route} must export at least one handler`);
    assert.ok(
      protectedGatewayCalls.length >= handlers.length,
      `${route} must send every exported handler through its requireAdmin gateway`,
    );
  }
});
