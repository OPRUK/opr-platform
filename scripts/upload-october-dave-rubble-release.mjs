import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";

const releaseDirectory = ".tmp/october-dave-rubble-release";
const files = [
  ["opr-dave-and-rubble-the-finishing-touch-v1.mp4", "videos/opr-dave-and-rubble-the-finishing-touch-v1.mp4", "video/mp4"],
  ["opr-dave-and-rubble-the-carrot-v1.mp4", "videos/opr-dave-and-rubble-the-carrot-v1.mp4", "video/mp4"],
  ["opr-dave-and-rubble-the-simmer-v1.mp4", "videos/opr-dave-and-rubble-the-simmer-v1.mp4", "video/mp4"],
  ["opr-dave-and-rubble-the-finishing-touch-poster.jpg", "posters/opr-dave-and-rubble-the-finishing-touch-poster.jpg", "image/jpeg"],
  ["opr-dave-and-rubble-the-carrot-poster.jpg", "posters/opr-dave-and-rubble-the-carrot-poster.jpg", "image/jpeg"],
  ["opr-dave-and-rubble-the-simmer-poster.jpg", "posters/opr-dave-and-rubble-the-simmer-poster.jpg", "image/jpeg"],
];

for (const [filename, pathname, contentType] of files) {
  const result = await put(pathname, await readFile(`${releaseDirectory}/${filename}`), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType,
  });
  console.log(`${pathname} -> ${result.url}`);
}
