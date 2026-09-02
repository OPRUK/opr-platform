import assert from "node:assert/strict";
import test from "node:test";
import {
  configuredPinterestAccessToken,
  configuredPinterestOAuthCredentials,
} from "../lib/pinterest-auth.ts";

test("uses a configured production-limited access token without exposing it", () => {
  const environment = { PINTEREST_ACCESS_TOKEN: "  temporary-token  " };
  assert.equal(configuredPinterestAccessToken(environment), "temporary-token");
});

test("ignores a blank direct access token", () => {
  const environment = { PINTEREST_ACCESS_TOKEN: "   " };
  assert.equal(configuredPinterestAccessToken(environment), null);
});

test("accepts the durable OAuth configuration only when every value is present", () => {
  const complete = {
    PINTEREST_CLIENT_ID: "client-id",
    PINTEREST_CLIENT_SECRET: "client-secret",
  };
  assert.deepEqual(configuredPinterestOAuthCredentials("refresh-token", complete), {
    clientId: "client-id",
    clientSecret: "client-secret",
    refreshToken: "refresh-token",
  });
  assert.equal(configuredPinterestOAuthCredentials(null, complete), null);
  assert.equal(configuredPinterestOAuthCredentials("refresh-token", { PINTEREST_CLIENT_ID: "client-id" }), null);
});
