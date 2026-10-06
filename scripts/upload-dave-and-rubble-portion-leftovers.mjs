import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";

const files = [
  ["/Users/chatenoberoi-morris/Downloads/opr-dave-and-rubble-portion-final.mp4", "videos/opr-dave-and-rubble-the-portion.mp4", "video/mp4"],
  ["/Users/chatenoberoi-morris/Downloads/opr-dave-and-rubble-leftovers-final.mp4", "videos/opr-dave-and-rubble-the-leftovers.mp4", "video/mp4"],
  [".tmp/site-release/opr-dave-and-rubble-the-portion-poster.jpg", "posters/opr-dave-and-rubble-the-portion-poster.jpg", "image/jpeg"],
  [".tmp/site-release/opr-dave-and-rubble-the-leftovers-poster.jpg", "posters/opr-dave-and-rubble-the-leftovers-poster.jpg", "image/jpeg"],
];

for (const [source, pathname, contentType] of files) {
  const result = await put(pathname, await readFile(source), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  console.log(`${pathname} -> ${result.url}`);
}
