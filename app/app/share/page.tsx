import type { Metadata } from "next";
import { Eyebrow } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import MobileShareForm from "./MobileShareForm";

export const metadata: Metadata = { title: "Share your recipe" };

export default function ShareScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-16">
        <Eyebrow className="mb-2">Whet our appetite</Eyebrow>
        <h1 className="mb-2 text-[27px] font-bold">Share your family&apos;s recipe</h1>
        <p className="mb-5 text-base opacity-80">Every one carries a memory worth preserving.</p>
        <MobileShareForm />
      </div>
      <MobileTabBar />
    </div>
  );
}
