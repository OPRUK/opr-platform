import Navigation from '../components/Navigation';
import {buildMetadata} from '../../lib/metadata';
import MealMaker from './MealMaker';
export const metadata=buildMetadata({title:'Make me a meal',description:'Tell us what is in your cupboard and fridge. Find a simple meal idea with quantities and cooking steps using ingredients you already have.',path:'/make-me-a-meal'});
export default function Page(){return <main id="main-content" className="min-h-screen bg-[#EED8B2] text-[#123C39]"><Navigation/><section className="meal-maker-page"><p className="meal-maker-eyebrow">A LITTLE CUPBOARD INSPIRATION</p><h1>Make me <em>a meal.</em></h1><p className="meal-maker-intro">Tell us what you have, and let’s make something good.</p><MealMaker/></section></main>}
