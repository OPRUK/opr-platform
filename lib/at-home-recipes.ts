import data from './at-home-recipes.json';
import type {FeaturedRecipe} from './recipes';
export type AtHomeCategory='15 minute'|'Family'|'Date night';
export type AtHomeRecipe=FeaturedRecipe&{atHomeCategory:AtHomeCategory;editorialLabel:'At home recipes'};
export const atHomeRecipes=data as AtHomeRecipe[];

export type AtHomeCourse = 'Starter' | 'Main' | 'Dessert';
const starterSlugs = new Set([
 'at-home-smoked-mackerel-salad', 'at-home-caprese-toast',
 'at-home-tomato-and-lentil-soup', 'at-home-sweetcorn-fritters',
 'at-home-sweet-potato-and-lentil-soup', 'at-home-leek-and-potato-soup',
 'at-home-roasted-aubergine-with-tahini',
]);
export function atHomeCourses(recipe: Pick<AtHomeRecipe, 'slug' | 'category'>): AtHomeCourse[] {
 if (recipe.category === 'Dessert' || recipe.category === 'Dessert or baking') return ['Dessert'];
 if (recipe.category === 'Starter') return ['Starter'];
 return starterSlugs.has(recipe.slug) ? ['Starter', 'Main'] : ['Main'];
}
