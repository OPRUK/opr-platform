// The OPR Film Collection — sourced directly from the OPR YouTube channel
// (youtube.com/@OPR_UK) so the desktop /films page and the mobile app's
// /app/films screen both link out to the real videos instead of maintaining
// separate copies of local video files and hand-written synopsis text.
// To add a film: upload it to the channel, then add one entry here.
export type Film = {
  title: string;
  youtubeUrl: string;
  /** YouTube's deterministic thumbnail URL for this video/short. */
  thumbnail: string;
};

function youtubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const films: Film[] = [
  {
    title: "Other People’s Recipes | Every Recipe Has a Story",
    youtubeUrl: "https://www.youtube.com/watch?v=-2CTcjha48w",
    thumbnail: youtubeThumbnail("-2CTcjha48w"),
  },
  {
    title: "Three Recipes, Three Stories | The OPR Cookbook",
    youtubeUrl: "https://www.youtube.com/watch?v=VaINXwaNYVk",
    thumbnail: youtubeThumbnail("VaINXwaNYVk"),
  },
  {
    title: "Ada’s Party Jollof Rice | A Recipe to Bring People Together",
    youtubeUrl: "https://www.youtube.com/watch?v=wp8z8pw4gsw",
    thumbnail: youtubeThumbnail("wp8z8pw4gsw"),
  },
  {
    title: "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On",
    youtubeUrl: "https://www.youtube.com/watch?v=nvSp_OJQH-U",
    thumbnail: youtubeThumbnail("nvSp_OJQH-U"),
  },
  {
    title: "Krishna Anand’s Baingan Ka Bharta | From the Kitchen Drawer",
    youtubeUrl: "https://www.youtube.com/watch?v=-fmlnz1OSJ4",
    thumbnail: youtubeThumbnail("-fmlnz1OSJ4"),
  },
  {
    title: "Krishna Anand’s Baingan ka Bharta | A Family Recipe",
    youtubeUrl: "https://www.youtube.com/watch?v=jh1pWUHYsxo",
    thumbnail: youtubeThumbnail("jh1pWUHYsxo"),
  },
  {
    title: "The First Step to Baingan Ka Bharta | OPR",
    youtubeUrl: "https://www.youtube.com/watch?v=4ZxVsfsu6BU",
    thumbnail: youtubeThumbnail("4ZxVsfsu6BU"),
  },
  {
    title: "Preserving Nani’s Secret Baingan Bharta | Other People’s Recipes",
    youtubeUrl: "https://www.youtube.com/shorts/7_-wTrk8U30",
    thumbnail: youtubeThumbnail("7_-wTrk8U30"),
  },
  {
    title: "The OPR Idea | A Menu Written by the People",
    youtubeUrl: "https://www.youtube.com/watch?v=15aK3zI9bIg",
    thumbnail: youtubeThumbnail("15aK3zI9bIg"),
  },
  {
    title: "A Menu Written by the People | The OPR Vision",
    youtubeUrl: "https://www.youtube.com/watch?v=UJlgxsIQC80",
    thumbnail: youtubeThumbnail("UJlgxsIQC80"),
  },
  {
    title: "Same Town. Same Dish. | The OPR Vision",
    youtubeUrl: "https://www.youtube.com/watch?v=nYXQIGq5kdQ",
    thumbnail: youtubeThumbnail("nYXQIGq5kdQ"),
  },
  {
    title: "A New Menu Every Month | The OPR Vision",
    youtubeUrl: "https://www.youtube.com/shorts/EuikM782tjo",
    thumbnail: youtubeThumbnail("EuikM782tjo"),
  },
];
