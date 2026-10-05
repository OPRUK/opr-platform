import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/cookalong-signup/route.ts";

test("expired cook-along signups are closed without collecting contact details", async () => {
  const response = await POST();

  assert.equal(response.status, 410);
  assert.match((await response.json()).error, /has finished/i);
});
