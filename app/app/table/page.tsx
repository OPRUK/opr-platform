import type { Metadata } from "next";
import MobileTabBar from "../_components/MobileTabBar";
import MobileFoundingTableForm from "./MobileFoundingTableForm";

export const metadata: Metadata = { title: "Join Our Table" };

export default function FoundingTableScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <MobileFoundingTableForm />
      </div>
      <MobileTabBar />
    </div>
  );
}
