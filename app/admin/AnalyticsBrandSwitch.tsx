import type { SocialBrand } from "../../lib/social-brand";

export default function AnalyticsBrandSwitch({ brand, onChange }: {
  brand: SocialBrand;
  onChange: (brand: SocialBrand) => void;
}) {
  return (
    <div role="group" aria-label="Analytics brand" className="mt-4 inline-flex gap-1 rounded-full border border-[#123C39] p-1">
      {(["opr", "opc"] as const).map((item) => (
        <button key={item} type="button" aria-pressed={brand === item} onClick={() => onChange(item)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${brand === item ? "bg-[#123C39] text-white" : "hover:bg-[#FFF3DF]"}`}>
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
