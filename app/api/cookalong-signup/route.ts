export async function POST() {
  return Response.json(
    { error: "This cook-along has finished. Please join Our Table for future OPR invitations." },
    { status: 410 },
  );
}
