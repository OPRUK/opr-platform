const PAGE_STATISTICS_ENDPOINT = "https://api.linkedin.com/rest/organizationPageStatistics";
const SHARE_STATISTICS_ENDPOINT = "https://api.linkedin.com/rest/organizationalEntityShareStatistics";

function linkedInTimeIntervals(start: number, end: number) {
  // Rest.li 2.0 uses structural punctuation in complex query parameters.
  // URLSearchParams percent-encodes that punctuation and LinkedIn rejects the
  // resulting timeIntervals value, so build this documented expression intact.
  return `(timeRange:(start:${start},end:${end}),timeGranularityType:DAY)`;
}

export function buildLinkedInPageStatisticsUrl({
  organizationUrn,
  start,
  end,
}: {
  organizationUrn: string;
  start: number;
  end: number;
}) {
  const timeIntervals = linkedInTimeIntervals(start, end);
  return new URL(
    `${PAGE_STATISTICS_ENDPOINT}?q=organization&organization=${encodeURIComponent(organizationUrn)}&timeIntervals=${timeIntervals}`,
  );
}

export function buildLinkedInShareStatisticsUrl({
  organizationUrn,
  start,
  end,
}: {
  organizationUrn: string;
  start: number;
  end: number;
}) {
  const timeIntervals = linkedInTimeIntervals(start, end);
  return new URL(
    `${SHARE_STATISTICS_ENDPOINT}?q=organizationalEntity&organizationalEntity=${encodeURIComponent(organizationUrn)}&timeIntervals=${timeIntervals}`,
  );
}
