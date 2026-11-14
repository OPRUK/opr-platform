import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import { christmasRecipes } from '../../lib/christmas-recipes';
import ChristmasCollection from './ChristmasCollection';
import styles from './christmas.module.css';
export const metadata: Metadata = {title:{absolute:'Christmas lunch recipes, menus and planning | OPR'},description:'Plan Christmas lunch with full recipes: 10 starters, 10 mains, 20 sides and 10 desserts in each of our classic, vegetarian and vegan menus.',alternates:{canonical:'/christmas'}};
const tips=[
 ['Start with your main','Choose the centrepiece first. Write down its oven temperature, cooking and resting times, then work backwards from the time you want to sit down.'],
 ['Check your oven space','Put the empty trays and dishes in the cold oven before the day. Allow space for hot air to circulate; a crowded oven can slow cooking.'],
 ['Make a short timetable','Give every dish a start time, oven shelf and serving dish. Include preheating, resting, cooling and chilling, not just the cook-time badge.'],
 ['Make the sauce early','Cranberry sauce can be made up to two days ahead and refrigerated. Choose a make-ahead pudding too, allowing its full chilling time.'],
 ['Prepare the vegetables','Peel potatoes the day before, cover with cold water and refrigerate. Drain well before cooking. Keep washed and trimmed vegetables covered and chilled.'],
 ['Label the serving dishes','Set out platters, bowls and serving spoons with a note of what goes in each. It is one less decision to make when everything is ready.'],
 ['Keep plant-based dishes separate','Use separate utensils and roasting tins. Check stock, pastry, mincemeat and spread are vegan, and cheeses are labelled vegetarian.'],
 ['Defrost in the fridge','Follow the packaging for your exact joint or bird and allow plenty of time. Keep raw meat covered on the bottom shelf, away from ready-to-eat food.'],
 ['Use a clean thermometer','For poultry, sausages, stuffing and thoroughly cooked dishes, check the centre reaches 70°C for 2 minutes or 75°C for 30 seconds. Colour alone is unreliable.'],
 ['Use the resting window','While a cooked roast rests, finish the potatoes and warm the plates. Keep resting and serving timings realistic so food does not sit out for long.'],
 ['Delegate the cold jobs','Ask someone to plate the starter, fill water glasses or bring sauces to the table. Put chilled dishes out just before eating.'],
 ['Plan for leftovers','Cool and refrigerate leftovers within 1–2 hours and eat within two days. Cool rice ideally within one hour and use within 24 hours. Reheat only once until steaming hot throughout.'],
];
export default function ChristmasPage(){
 const cards=christmasRecipes.map(({slug,title,image,prepTime,cookTime,serves,christmasMenus,christmasCourse})=>({slug,title,image,prepTime,cookTime,serves,christmasMenus,christmasCourse}));
 return <main id="main-content" tabIndex={-1} className={styles.page}><Navigation/>
 <header className={styles.hero}><div><p className={styles.kicker}>Christmas at the OPR table</p><h1>A little planning.<br/>A lovely Christmas lunch.</h1><p className={styles.intro}>The best Christmas lunch leaves room to enjoy the people around your table. Choose your main first, check its cooking and resting times, then work backwards from when you would like to eat. Make the sauces and a chilled dessert ahead, prepare what you can the day before, and give every tray a place in the oven. Our classic, vegetarian and vegan menus let everyone share in the celebration.</p><Link className={styles.primaryLink} href="#recipes">Find your Christmas recipes</Link></div></header>
 <section className={styles.planning} aria-labelledby="planning-heading"><div className={styles.sectionHeading}><p className={styles.kicker}>Before the apron goes on</p><h2 id="planning-heading">Make a little room for calm.</h2></div><div className={styles.timeline}><article><p>The day before</p><h3>Prepare and chill</h3><p>Make suitable sauces and desserts, trim vegetables and check dietary labels. Read your chosen recipes for overnight soaking or chilling.</p></article><article><p>On Christmas morning</p><h3>Work backwards</h3><p>Start with the longest-cooking dish. Follow your own oven timetable and the main recipe’s doneness checks, rather than a single timing for every menu.</p></article><article><p>Before you sit down</p><h3>Rest and finish</h3><p>Rest the main as directed, finish the hot sides and dress salads at the last moment. Bring cold starters out just before serving.</p></article></div>
 <details className={styles.tips} open><summary>12 quick wins, tips and tricks</summary><ol>{tips.map(([title,text])=><li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol><p className={styles.source}>Cooking and storage guidance: <a href="https://www.food.gov.uk/safety-hygiene/cooking-your-food">Food Standards Agency: cooking food</a> and <a href="https://www.food.gov.uk/safety-hygiene/chilling">chilling food</a>.</p></details></section>
 <ChristmasCollection recipes={cards}/><aside className={styles.editorial}><h2>From the OPR kitchen</h2><p>These are original editorial recipes, rather than contributor family recipes. They have not been independently kitchen-tested. Timings are guides: follow each recipe’s written doneness checks. The serving and stage images are clearly labelled AI-generated illustrations.</p><p>Have a Christmas dish with a story of its own? <Link href="/share">Share your family recipe.</Link></p><p>For something to serve alongside, explore <a href="https://otherpeoplescocktails.co.uk/christmas-cocktails">Christmas at Other People’s Cocktails</a>.</p></aside></main>;
}
