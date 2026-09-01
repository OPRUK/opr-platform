const PAGE_STATISTICS_ENDPOINT = "https://api.linkedin.com/rest/organizationPageStatistics";

export function buildLinkedInPageStatisticsUrl({
  organizationUrn,
  start,
  end,
}: {
  organizationUrn: string;
  start: number;
  end: number;
}) {
  const url = new URL(PAGE_STATISTICS_ENDPOINT);
  url.searchParams.set("q", "organization");
  url.searchParams.set("organization", organizationUrn);

  // LinkedIn documents both Rest.li object syntax and these flattened fields.
  // The flattened form avoids the PARAM_INVALID response the live endpoint
  // returns when URLSearchParams serialises the object expression.
  url.searchParams.set("timeIntervals.timeGranularityType", "DAY");
  url.searchParams.set("timeIntervals.timeRange.start", String(start));
  url.searchParams.set("timeIntervals.timeRange.end", String(end));

  return url;
}
