export type RecipeFaq = {
  question: string;
  answer: string;
};

export function buildFaqPageJsonLd(faqs: RecipeFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Community recipes keep their editorial FAQs keyed to the published recipe
// ID. Answers are drawn only from the approved recipe method and cook's notes.
export const communityRecipeFaqs: Record<number, RecipeFaq[]> = {
  41: [
    {
      question: "Can you make the steak and ale pie filling in advance?",
      answer:
        "Yes. Grandad's recipe says the cooled filling can be kept in the fridge overnight, ready to fill and bake the individual pies the following day.",
    },
    {
      question: "What can you use instead of Guinness?",
      answer:
        "Use another kind of ale, or replace the Guinness with red wine. Keep the same 200ml quantity used in the published recipe.",
    },
    {
      question: "How do you know when the pie filling is thick enough?",
      answer:
        "Simmer it for about 30–40 minutes, until the gravy coats the beef and a spoon drawn through the pan briefly leaves a trail. If it becomes too thick, loosen it with a splash of boiling water or stock.",
    },
    {
      question: "What can replace the balsamic vinegar?",
      answer:
        "The cook's notes recommend Worcestershire sauce for a similarly sharp, savoury taste.",
    },
    {
      question: "How long do the individual pies bake?",
      answer:
        "Bake them in the middle of a 180°C fan oven for 30–35 minutes, until the puff pastry has risen and turned golden brown. Use only a light coating of egg glaze so it does not become thick.",
    },
  ],
};
