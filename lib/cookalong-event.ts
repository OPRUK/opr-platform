export type CookalongStatus = "planning" | "scheduled" | "complete";
export type CookalongCron = "recipeList" | "joiningLink";

// This is the only place an OPR cook-along should be opened, dated, promoted
// or made eligible for email. Leave startsAt and cron send times null until a
// session has been confirmed.
export const cookalongEvent = {
  status: "planning" as CookalongStatus,
  title: "The next OPR cook-along",
  startsAt: null as string | null,
  lastMeaningfulUpdate: "2026-10-06",
  evergreenPage: true,
  cta: {
    href: "/join-our-table",
    label: "Join Our Table →",
  },
  public: {
    home: {
      eyebrow: "Cook with OPR",
      message: "The next cook-along is being planned.",
    },
    films: {
      eyebrow: "Cook with OPR",
      message: "The next cook-along is being planned. Join our table to hear when the date and recipe are confirmed.",
    },
    livePage: {
      eyebrow: "Cook with Dave",
      title: "Cook with Dave.",
      summary: "The first OPR cook-along has finished. Cook Dave’s Butter Chicken at home, and be first to hear about the next chance to cook together.",
      nextSessionHeading: "Be first to hear when we cook together again.",
      nextSessionCopy: "We’ll share the next cook-along date, recipe and any replay details with the OPR community once they’re confirmed.",
      inviteHeading: "Get future invitations from OPR.",
      inviteCopy: "Join the OPR table for news, new recipes and future cook-along announcements. We won’t promise a date until it is confirmed.",
    },
  },
  email: {
    closedSignup: {
      subject: "An update from Other People’s Recipes",
      heading: "The cook-along has finished.",
      copy: "Dave’s Butter Chicken cook-along has now finished, so no further event emails will be sent from this list.",
      futureCopy: "Future OPR invitations will only be sent when a new session has been confirmed and you have opted in to receive them.",
    },
    newsletter: {
      eyebrow: "Cook with Dave",
      heading: "More from Dave’s kitchen",
      copy: "The Butter Chicken cook-along has now finished. We’ll announce the next chance to cook together once the details are confirmed.",
      ctaCampaign: "dave-cookalong",
    },
    recipeList: {
      subject: "Dave’s Butter Chicken: the recipe",
      heading: "Time to go shopping.",
      copy: "Dave’s live Butter Chicken cook-along has finished. Here is the recipe in case you would like to cook it at home.",
      recipeHref: "/family-cookbook/daves-butter-chicken",
      recipeCta: "See the full recipe and method",
      audienceNote: "You’re receiving this because you signed up for Dave’s live cook-along.",
    },
    joiningLink: {
      subject: "Dave’s Butter Chicken cook-along update",
      heading: "The cook-along has finished.",
      copy: "Dave’s live Butter Chicken cook-along has finished, so this link is no longer active.",
      futureCopy: "We’ll share future OPR events only after their details are confirmed.",
      audienceNote: "You’re receiving this because you signed up for Dave’s live cook-along.",
    },
    adminSignup: {
      subjectPrefix: "New cook-along signup",
      heading: "Someone has joined the cook-along.",
      copy: "signed up to watch Dave’s live Butter Chicken cook-along.",
    },
  },
  cron: {
    recipeList: { sendAt: null as string | null },
    joiningLink: { sendAt: null as string | null },
  },
} as const;

export function isCookalongSignupOpen(now = new Date()): boolean {
  if (cookalongEvent.status !== "scheduled" || !cookalongEvent.startsAt) return false;
  return now.getTime() < Date.parse(cookalongEvent.startsAt);
}

export function isCookalongCronEligible(cron: CookalongCron, now = new Date()): boolean {
  const sendAt = cookalongEvent.cron[cron].sendAt;
  if (cookalongEvent.status !== "scheduled" || !cookalongEvent.startsAt || !sendAt) return false;

  const timestamp = now.getTime();
  return timestamp >= Date.parse(sendAt) && timestamp < Date.parse(cookalongEvent.startsAt);
}

export function cookalongUnavailableMessage(): string {
  return `${cookalongEvent.title} has not been confirmed yet. Please ${cookalongEvent.cta.label.replace(" →", "").toLowerCase()} for future OPR invitations.`;
}
