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
  // Rest.li 2.0 uses structural punctuation in complex query parameters.
  // URLSearchParams percent-encodes that punctuation and LinkedIn rejects the
  // resulting timeIntervals value, so build this documented expression intact.
  const timeIntervals = `(timeRange:(start:${start},end:${end}),timeGranularityType:DAY)`;
  return new URL(
    `${PAGE_STATISTICS_ENDPOINT}?q=organization&organization=${encodeURIComponent(organizationUrn)}&timeIntervals=${timeIntervals}`,
  );
}
