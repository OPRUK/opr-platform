// The OPR Film Collection — sourced from the OPR YouTube channel
// (youtube.com/@OPR_UK), but played back as an embedded, privacy-enhanced
// player directly on the site (not a link out to youtube.com) so watching a
// film doesn't send visitors away. Both /films (desktop) and /app/films
// (mobile) render from this one list — to add a film, upload it to the
// channel and add its video ID here.
export type Film = {
  title: string;
  /** YouTube video ID (the part after v= or /shorts/). */
  id: string;
};

export const films: Film[] = [
  { title: "Other People’s Recipes | Every Recipe Has a Story", id: "-2CTcjha48w" },
  { title: "Three Recipes, Three Stories | The OPR Cookbook", id: "VaINXwaNYVk" },
  { title: "Ada’s Party Jollof Rice | A Recipe to Bring People Together", id: "wp8z8pw4gsw" },
  { title: "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On", id: "nvSp_OJQH-U" },
  { title: "Krishna Anand’s Baingan Ka Bharta | From the Kitchen Drawer", id: "-fmlnz1OSJ4" },
  { title: "Krishna Anand’s Baingan ka Bharta | A Family Recipe", id: "jh1pWUHYsxo" },
  { title: "The First Step to Baingan Ka Bharta | OPR", id: "4ZxVsfsu6BU" },
  { title: "Preserving Nani’s Secret Baingan Bharta | Other People’s Recipes", id: "7_-wTrk8U30" },
  { title: "The OPR Idea | A Menu Written by the People", id: "15aK3zI9bIg" },
  { title: "A Menu Written by the People | The OPR Vision", id: "UJlgxsIQC80" },
  { title: "Same Town. Same Dish. | The OPR Vision", id: "nYXQIGq5kdQ" },
  { title: "A New Menu Every Month | The OPR Vision", id: "EuikM782tjo" },
];
