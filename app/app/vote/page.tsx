import type { Metadata } from "next";
import { Eyebrow } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import VoteList from "./VoteList";

export const metadata: Metadata = { title: "Recipe of the Month" };

function currentMonthName() {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" }).format(
    new Date(),
  );
}

export default function VoteScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-16">
        <Eyebrow className="mb-2">Vote now · {currentMonthName()}</Eyebrow>
        <h1 className="mb-2 text-[27px] font-bold">Recipe of the Month</h1>
        <p className="mb-5 text-base opacity-80">
          One vote per month. Pick the story you&apos;d love to see featured.
        </p>
        <VoteList />
      </div>
      <MobileTabBar />
    </div>
  );
}
