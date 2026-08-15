type CommunityCook = {
  id: number;
  name: string;
  note: string | null;
  photoUrl: string | null;
};

export default function FamiliesWhoMadeThis({ cooks, recipeTitle }: { cooks: CommunityCook[]; recipeTitle: string }) {
  if (!cooks.length) return null;

  return (
    <section className="bg-[#123C39] px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Families who&apos;ve made this</p>
          <h2 className="mt-5 text-4xl font-bold">This recipe has found new tables.</h2>
          <p className="mt-5 leading-7 text-stone-200">A few of the people who have brought {recipeTitle} into their own homes.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cooks.map((cook) => (
            <article key={cook.id} className="rounded-3xl bg-white/10 p-6">
              <div className="flex items-center gap-4">
                {cook.photoUrl ? (
                  <Image src={cook.photoUrl} alt={`${cook.name}'s version of ${recipeTitle}`} width={64} height={64} unoptimized className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 font-bold text-[#123C39]">{cook.name.charAt(0).toUpperCase()}</div>
                )}
                <p className="text-lg font-bold">{cook.name}</p>
              </div>
              {cook.note ? <p className="mt-5 leading-7 text-stone-100">“{cook.note}”</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
