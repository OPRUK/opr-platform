import data from './at-home-recipes.json';
import type {FeaturedRecipe} from './recipes';
export type AtHomeCategory='15 minute'|'Family'|'Date night';
export type AtHomeRecipe=FeaturedRecipe&{atHomeCategory:AtHomeCategory;editorialLabel:'At home recipes'};
export const atHomeRecipes=data as AtHomeRecipe[];
