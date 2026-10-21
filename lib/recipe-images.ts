// Intrinsic dimensions measured from the published finished-dish images.
// Unknown future uploads omit social dimensions rather than claiming a ratio.
const recipeImageDimensions: Record<string, { width: number; height: number }> = {
  "/images/recipes/lesleys-italian-cherry-pound-cake.webp": {
    "width": 1200,
    "height": 800
  },
  "/images/recipes/robin-vaughans-gingerbread-wide.png": {
    "width": 1448,
    "height": 1086
  },
  "/images/recipes/nana-serbs-rice-pudding-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/daves-butter-chicken-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/barbaras-beef-casserole-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/krishna-vantis-baingan-ka-bharta-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/sudeshs-bhindi-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/adas-jollof-rice-wide.webp": {
    "width": 1448,
    "height": 1086
  },
  "/images/recipes/sams-shepherds-pie-wide.webp": {
    "width": 1448,
    "height": 1086
  },
  "/images/recipes/phils-and-serbs-three-cheese-souffle-wide.png": {
    "width": 1536,
    "height": 1024
  },
  "/images/recipes/gautam-shobha-tandoori-aloo-nazakat-wide.webp": {
    "width": 1672,
    "height": 941
  },
  "/images/recipes/auntie-marcias-pineapple-jerk-chicken-wide.webp": {
    "width": 1024,
    "height": 559
  },
  "/images/recipes/badepapas-pindi-cholley-wide.webp": {
    "width": 1024,
    "height": 559
  },
  "/images/recipes/grandads-steak-ale-pie.png": {
    "width": 1448,
    "height": 1086
  },
  "/images/recipes/pats-haddock-tomato-bake.webp": {
    "width": 1600,
    "height": 900
  },
  "/images/recipes/georginas-mums-apple-pear-chutney.webp": {
    "width": 1600,
    "height": 900
  }
};

export function getRecipeImageDimensions(path: string) {
  return recipeImageDimensions[path];
}
