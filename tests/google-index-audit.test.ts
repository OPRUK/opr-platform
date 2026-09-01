import assert from "node:assert/strict";
import test from "node:test";
import {
  extractSitemapUrls,
  failedIndexInspection,
  indexAuditPriority,
  indexAuditTreatment,
  normaliseIndexInspection,
  summariseIndexAudit,
} from "../lib/google-index-audit-core.ts";

test("extracts unique same-origin sitemap URLs and decodes XML entities", () => {
  const xml = `
    <urlset>
      <url><loc>https://otherpeoplesrecipes.co.uk/</loc></url>
      <url><loc>https://otherpeoplesrecipes.co.uk/search?q=rice&amp;type=recipe</loc></url>
      <url><loc>https://otherpeoplesrecipes.co.uk/#duplicate</loc></url>
      <url><loc>https://example.com/not-opr</loc></url>
      <url><loc>not a URL</loc></url>
    </urlset>
  `;

  assert.deepEqual(extractSitemapUrls(xml, "https://otherpeoplesrecipes.co.uk"), [
    "https://otherpeoplesrecipes.co.uk/",
    "https://otherpeoplesrecipes.co.uk/search?q=rice&type=recipe",
  ]);
});

test("normalises inspection results and summarises indexed, excluded and failed URLs", () => {
  const indexed = normaliseIndexInspection("https://otherpeoplesrecipes.co.uk/", {
    verdict: "PASS",
    coverageState: "Submitted and indexed",
    indexingState: "INDEXING_ALLOWED",
    pageFetchState: "SUCCESSFUL",
  });
  const excluded = normaliseIndexInspection("https://otherpeoplesrecipes.co.uk/example", {
    verdict: "NEUTRAL",
    coverageState: "Crawled - currently not indexed",
    indexingState: "INDEXING_ALLOWED",
    pageFetchState: "SUCCESSFUL",
  });
  const failed = failedIndexInspection(
    "https://otherpeoplesrecipes.co.uk/unavailable",
    "Google inspection timed out.",
  );

  const audit = summariseIndexAudit(
    "https://otherpeoplesrecipes.co.uk/sitemap.xml",
    [indexed, excluded, failed],
    "2026-09-01T10:00:00.000Z",
    4,
  );

  assert.deepEqual(
    {
      submitted: audit.submittedUrls,
      inspected: audit.inspectedUrls,
      indexed: audit.indexedUrls,
      notIndexed: audit.notIndexedUrls,
      failed: audit.failedInspections,
    },
    { submitted: 4, inspected: 2, indexed: 1, notIndexed: 1, failed: 1 },
  );
});

test("assigns practical treatments and priorities to Google indexing states", () => {
  const blocked = normaliseIndexInspection("https://otherpeoplesrecipes.co.uk/blocked", {
    verdict: "FAIL",
    indexingState: "BLOCKED_BY_META_TAG",
    pageFetchState: "SUCCESSFUL",
  });
  const fetchFailed = normaliseIndexInspection("https://otherpeoplesrecipes.co.uk/fetch", {
    verdict: "FAIL",
    indexingState: "INDEXING_ALLOWED",
    pageFetchState: "SERVER_ERROR",
  });
  const crawled = normaliseIndexInspection("https://otherpeoplesrecipes.co.uk/crawled", {
    verdict: "NEUTRAL",
    coverageState: "Crawled - currently not indexed",
    indexingState: "INDEXING_ALLOWED",
    pageFetchState: "SUCCESSFUL",
  });

  assert.equal(indexAuditPriority(blocked), "P1");
  assert.match(indexAuditTreatment(blocked), /Remove the indexing block/);
  assert.equal(indexAuditPriority(fetchFailed), "P1");
  assert.match(indexAuditTreatment(fetchFailed), /Fix the page-fetch problem/);
  assert.equal(indexAuditPriority(crawled), "P2");
  assert.match(indexAuditTreatment(crawled), /distinct value/);
});
