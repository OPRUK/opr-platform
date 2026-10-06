export default function AllergenNotice() {
  return (
    <aside
      aria-label="Allergen information"
      className="mt-6 rounded-2xl border border-[#9A622A]/35 bg-[#FFF3DF]/70 p-5 text-sm leading-6 text-stone-700"
    >
      <p className="font-bold uppercase tracking-[0.18em] text-[#9A622A]">Allergen information</p>
      <p className="mt-2">
        OPR does not provide verified allergen information for this contributor recipe. Check every ingredient label,
        account for substitutions and avoid cross-contamination where relevant before cooking or serving.
      </p>
    </aside>
  );
}
