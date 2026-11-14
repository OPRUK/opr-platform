import data from './christmas-recipes.json';
import type { FeaturedRecipe } from './recipes';
export type ChristmasMenu = 'general' | 'vegetarian' | 'vegan';
export type ChristmasCourse = 'Starters' | 'Mains' | 'Sides' | 'Desserts';
export type ChristmasRecipe = FeaturedRecipe & { christmasMenus: ChristmasMenu[]; christmasCourse: ChristmasCourse };
export const christmasRecipes = data as ChristmasRecipe[];
export const christmasCourses: ChristmasCourse[] = ['Starters', 'Mains', 'Sides', 'Desserts'];
