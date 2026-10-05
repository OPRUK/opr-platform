import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/cookalong-signup/route.ts";
import { cookalongEvent, isCookalongCronEligible, isCookalongSignupOpen } from "../lib/cookalong-event.ts";

test("unconfirmed cook-along signups are closed without collecting contact details", async () => {
  const response = await POST();

  assert.equal(response.status, 410);
  assert.match((await response.json()).error, /not been confirmed/i);
});

test("the single event configuration keeps unscheduled signups and email sends ineligible", () => {
  assert.equal(cookalongEvent.status, "planning");
  assert.equal(cookalongEvent.startsAt, null);
  assert.equal(cookalongEvent.evergreenPage, true);
  assert.equal(isCookalongSignupOpen(), false);
  assert.equal(isCookalongCronEligible("recipeList"), false);
  assert.equal(isCookalongCronEligible("joiningLink"), false);
});
