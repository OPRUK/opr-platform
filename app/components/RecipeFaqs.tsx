import type { RecipeFaq } from "../../lib/recipe-faqs";

export default function RecipeFaqs({
  recipeTitle,
  faqs,
}: {
  recipeTitle: string;
  faqs: RecipeFaq[];
}) {
  if (!faqs.length) return null;

  return (
    <section className="bg-[#EED8B2] px-6 py-12 md:py-16" aria-labelledby="recipe-faq-heading">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
          Helpful answers
        </p>
        <h2 id="recipe-faq-heading" className="mt-3 text-center text-4xl font-bold text-[#123C39]">
          Questions about {recipeTitle}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl bg-[#FFF3DF] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#123C39]">{faq.question}</h3>
              <p className="mt-3 leading-7 text-stone-700">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
