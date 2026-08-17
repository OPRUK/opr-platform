import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/founding-table",
        destination: "/join-our-table",
        permanent: true,
      },
      {
        source: "/our-story",
        destination: "/",
        permanent: true,
      },
      {
        source: "/family-cookbook/grandads-steak-and-ale-pie",
        destination: "/family-cookbook/community/41",
        permanent: true,
      },
      {
        source: "/family-cookbook/phil-and-serbs-three-cheese-souffle",
        destination: "/family-cookbook/phils-and-serbs-three-cheese-souffle",
        permanent: true,
      },
      {
        source: "/family-cookbook/dads-friday-night-butter-chicken",
        destination: "/family-cookbook/daves-butter-chicken",
        permanent: true,
      },
      {
        source: "/family-cookbook/nans-sunday-rice-pudding",
        destination: "/family-cookbook/nana-serbs-sunday-rice-pudding",
        permanent: true,
      },
      {
        source: "/family-cookbook/krishna-vantis-baingan-ka-bharta",
        destination: "/family-cookbook/krishna-anands-baingan-ka-bharta",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
