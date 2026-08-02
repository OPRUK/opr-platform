import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
